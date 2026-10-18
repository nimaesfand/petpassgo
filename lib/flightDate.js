// A flight lookup may use a date only when the traveler picked one.
// Never substitute today (PT or otherwise) — that was writing "today" onto
// trips when the date field was still empty.
export function explicitFlightDate(input) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(input || "")) ? String(input) : null;
}
