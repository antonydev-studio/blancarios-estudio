/**
 * Cleanup script — removes all TEST QA FINAL data from production MongoDB.
 *
 * Usage:
 *   MONGO_URI=mongodb+srv://... node scripts/cleanup-test-data.js
 *
 * Or with .env.local:
 *   node scripts/cleanup-test-data.js
 *
 * Deletes:
 * - appointments where clienteNombre contains "TEST QA FINAL" or
 *   clienteCorreo matches playwright-*@example.invalid
 * - users where nombre contains "TEST QA FINAL" or
 *   correo matches playwright-*@example.invalid
 * - services where titulo contains "TEST QA FINAL"
 * - movements linked to deleted appointments (via citaId)
 *
 * SAFE: only matches clearly labeled test data patterns.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local if it exists (local dev only)
try {
  const envPath = resolve(__dirname, "../.env.local");
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  // .env.local not present — rely on environment variables
}

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("ERROR: MONGO_URI not set.");
  console.error("Run: MONGO_URI=<uri> node scripts/cleanup-test-data.js");
  process.exit(1);
}

const TEST_MARKER = "TEST QA FINAL";
const PLAYWRIGHT_EMAIL = /playwright.*@example\.invalid/i;

async function cleanup() {
  await mongoose.connect(MONGO_URI, { bufferCommands: false });
  const db = mongoose.connection.db;

  // Find test appointments first (need IDs to clean up linked movements)
  const testAppts = await db.collection("appointments").find({
    $or: [
      { clienteNombre: { $regex: TEST_MARKER } },
      { clienteCorreo: PLAYWRIGHT_EMAIL },
    ],
  }).project({ _id: 1 }).toArray();

  const testIds = testAppts.map((a) => a._id);

  // Delete linked movements
  let movsDeleted = 0;
  if (testIds.length) {
    const mvRes = await db.collection("movements").deleteMany({
      citaId: { $in: testIds },
    });
    movsDeleted = mvRes.deletedCount;
  }

  // Delete test appointments
  const apptRes = await db.collection("appointments").deleteMany({
    $or: [
      { clienteNombre: { $regex: TEST_MARKER } },
      { clienteCorreo: PLAYWRIGHT_EMAIL },
    ],
  });

  // Delete test users
  const userRes = await db.collection("users").deleteMany({
    $or: [
      { nombre: { $regex: TEST_MARKER } },
      { correo: PLAYWRIGHT_EMAIL },
    ],
  });

  // Delete test services
  const svcRes = await db.collection("services").deleteMany({
    titulo: { $regex: TEST_MARKER },
  });

  console.log(`Deleted ${apptRes.deletedCount} test appointments`);
  console.log(`Deleted ${movsDeleted} linked movements`);
  console.log(`Deleted ${userRes.deletedCount} test users`);
  console.log(`Deleted ${svcRes.deletedCount} test services`);
  console.log("Cleanup complete.");

  await mongoose.disconnect();
}

cleanup().catch((err) => {
  console.error("Cleanup failed:", err.message);
  process.exit(1);
});
