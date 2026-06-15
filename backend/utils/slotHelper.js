/**
 * Slot helper utilities
 * - generateSlots(start, end, intervalMinutes): returns array of "HH:MM" slots
 * - isValidSlot(slot): validates "HH:MM"
 * - normalizeDateToDay(input): returns YYYY-MM-DD string
 */

function pad(n) {
  return String(n).padStart(2, "0");
}

function parseHM(str) {
  const m = String(str).match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return { h, min };
}

function generateSlots(start = "09:00", end = "17:00", interval = 30) {
  const s = parseHM(start);
  const e = parseHM(end);
  if (!s || !e) throw new Error("Invalid start or end time");
  const slots = [];
  let cur = s.h * 60 + s.min;
  const endMinutes = e.h * 60 + e.min;
  while (cur + 0 <= endMinutes) {
    const hh = Math.floor(cur / 60);
    const mm = cur % 60;
    slots.push(`${pad(hh)}:${pad(mm)}`);
    cur += interval;
    if (cur > 24 * 60) break;
  }
  return slots;
}

function isValidSlot(slot) {
  return !!parseHM(slot);
}

function normalizeDateToDay(input) {
  const d = input instanceof Date ? new Date(input) : new Date(String(input));
  if (Number.isNaN(d.getTime())) return null;
  // Use UTC date parts so result is stable regardless of server timezone
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

module.exports = {
  generateSlots,
  isValidSlot,
  normalizeDateToDay,
};
