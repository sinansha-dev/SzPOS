/**
 * Get current timestamp in IST (India Standard Time, UTC+5:30)
 */
export function getISTTimestamp(): string {
  const now = new Date();
  // Convert UTC to IST by adding 5 hours 30 minutes
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  return istTime.toISOString().replace('Z', '+05:30');
}

/**
 * Get current date in IST (YYYY-MM-DD format)
 */
export function getISTDate(): string {
  const now = new Date();
  // Convert UTC to IST by adding 5 hours 30 minutes
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  return istTime.toISOString().slice(0, 10);
}
