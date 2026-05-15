const MIN_FUTURE_DAYS = 62;

export function futureDate(daysOut: number = MIN_FUTURE_DAYS): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysOut);
  return d;
}

export function formatISO(d: Date): string {
  return d.toISOString().split("T")[0];
}

// Months to advance in the calendar UI to safely land 60+ days ahead
export const SAFE_CALENDAR_MONTHS_AHEAD = 3;
