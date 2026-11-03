import mongoose from "mongoose";

export const isString = (v) => typeof v === "string";
export const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

/** Strict 24-hex ObjectId string check (rejects objects such as {"$ne":null}). */
export const isValidId = (v) => typeof v === "string" && /^[a-f\d]{24}$/i.test(v) && mongoose.isValidObjectId(v);

const DAY_MS = 24 * 60 * 60 * 1000;
export const MAX_RENTAL_DAYS = 365;

/**
 * Parses a calendar date ("YYYY-MM-DD", optionally followed by a time part)
 * into a Date at 00:00 UTC. Returns null when the value is not a real date.
 */
export const parseDateOnly = (value) => {
  if (typeof value !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) return null;
  return date;
};

/** Validates a pickup/return pair. Returns { error } or { pickup, ret, days }. */
export const validateRentalRange = (pickupInput, returnInput) => {
  const pickup = parseDateOnly(pickupInput);
  const ret = parseDateOnly(returnInput);
  if (!pickup || !ret) return { error: "Please provide valid pickup and return dates (YYYY-MM-DD)." };
  // one day of grace so users in time zones behind UTC can still book "today"
  const earliest = new Date(Date.now() - DAY_MS);
  if (pickup < new Date(Date.UTC(earliest.getUTCFullYear(), earliest.getUTCMonth(), earliest.getUTCDate()))) {
    return { error: "Pickup date cannot be in the past." };
  }
  if (ret < pickup) return { error: "Return date cannot be before the pickup date." };
  // A same-day rental is charged as one day.
  const days = Math.max(1, Math.ceil((ret - pickup) / DAY_MS));
  if (days > MAX_RENTAL_DAYS) return { error: `Bookings are limited to ${MAX_RENTAL_DAYS} days.` };
  return { pickup, ret, days };
};

/** Throwable HTTP error understood by the central error handler. */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
