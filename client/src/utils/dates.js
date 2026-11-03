// Today as YYYY-MM-DD in the user's local time zone (for <input type="date" min=...>).
export const todayISO = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};

// Number of rental days; a same-day rental counts as 1 (matches the server).
export const rentalDays = (pickup, ret) => {
  if (!pickup || !ret) return 0;
  const diff = Math.ceil((new Date(ret) - new Date(pickup)) / (24 * 60 * 60 * 1000));
  return Number.isNaN(diff) || diff < 0 ? 0 : Math.max(1, diff);
};
