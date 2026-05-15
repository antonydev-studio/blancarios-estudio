// Mexico City is permanently UTC-6 (no DST since 2022).
// Vercel servers run UTC — all "today" comparisons must use this offset.
const OFFSET_MS = 6 * 60 * 60 * 1000;

export function toMexicoISO(date) {
  const mex = new Date(date.getTime() - OFFSET_MS);
  return (
    `${mex.getUTCFullYear()}-` +
    `${String(mex.getUTCMonth() + 1).padStart(2, "0")}-` +
    `${String(mex.getUTCDate()).padStart(2, "0")}`
  );
}

export function getMexicoToday() {
  return toMexicoISO(new Date());
}
