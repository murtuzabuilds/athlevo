// Athlevo's product rules as small pure functions.
// Each maps to a research finding: schedule fit (50%), judging a coach (35%), quality nearby (15%).

export const WINDOWS = {
  any: { label: 'Any time', hours: null, days: null },
  morning: { label: 'Mornings', hours: [5, 6, 7, 8, 9, 10] },
  evening: { label: 'Evenings', hours: [16, 17, 18, 19, 20, 21] },
  weekend: { label: 'Weekends', days: [0, 6] },
};

const key = d => d.toISOString().slice(0, 10);
export const addDays = (d, n) => new Date(d.getTime() + n * 864e5);

/** Hourly slots for a venue on a date, marking booked and past ones. */
export function slots(venue, date, booked = new Set(), now = new Date()) {
  const out = [];
  for (let h = venue.open; h < venue.close; h++) {
    const k = `${key(date)} ${String(h).padStart(2, '0')}`;
    const start = new Date(`${key(date)}T${String(h).padStart(2, '0')}:00:00`);
    out.push({ key: k, hour: h, label: fmtHour(h), taken: booked.has(`${venue.id}|${k}`), past: start < now });
  }
  return out;
}
export const fmtHour = h => `${((h + 11) % 12) + 1}:00 ${h < 12 ? 'AM' : 'PM'}`;

/** Deterministic "other people's bookings" so the grid looks lived-in but stays testable. */
export function seedBusy(venue, date) {
  const s = new Set(); const seed = [...(venue.id + key(date))].reduce((a, c) => a + c.charCodeAt(0), 0);
  for (let h = venue.open; h < venue.close; h++) if (((seed * 9301 + h * 49297 + h * h * 233) % 233280) / 233280 < 0.28) s.add(`${venue.id}|${key(date)} ${String(h).padStart(2, '0')}`);
  return s;
}

/** Does a slot (day of week, hour) fall inside the user's free window? */
export function fits(window, day, hour) {
  const w = WINDOWS[window] || WINDOWS.any;
  return (!w.days || w.days.includes(day)) && (!w.hours || w.hours.includes(hour));
}

/** How many free, future slots a venue has in the user's window over the next n days. */
export function openInWindow(venue, window, from, bookedAll, n = 7, now = from) {
  let c = 0;
  for (let i = 0; i < n; i++) {
    const d = addDays(from, i), busy = new Set([...seedBusy(venue, d), ...bookedAll]);
    for (const s of slots(venue, d, busy, now)) if (!s.taken && !s.past && fits(window, d.getDay(), s.hour)) c++;
  }
  return c;
}

/** Coach trust score, 0 to 100, from things a learner can check. */
export function trust(coach) {
  const v = coach.creds.filter(c => c.verified).length, u = coach.creds.length - v;
  const s = Math.min(40, v * 15) + Math.min(20, coach.years * 2) + Math.max(0, (coach.rating - 4) * 20) + Math.min(20, coach.sessions / 50) - u * 3;
  return Math.max(0, Math.min(100, Math.round(s)));
}
export const verified = coach => coach.creds.filter(c => c.verified).length >= 2;

/** Hours a coach can do that the learner can too, across a week. */
export function overlap(coach, window) {
  let n = 0;
  for (const d of coach.windows.days) for (const h of coach.windows.hours) if (fits(window, d, h)) n++;
  return n;
}

/** Rank venues for a sport and window: schedule fit first, then quality, then distance. */
export function rankVenues(venues, { sport = null, window = 'any', from = new Date(), booked = new Set(), q = '' } = {}) {
  const needle = q.trim().toLowerCase();
  return venues
    .filter(v => !sport || v.sports.includes(sport))
    .filter(v => !needle || [v.name, v.area, ...v.sports].join(' ').toLowerCase().includes(needle))
    .map(v => {
      const open = openInWindow(v, window, from, booked);
      const score = Math.min(open, 20) * 2 + v.rating * 8 - v.km * 1.5;
      return { ...v, open, score };
    })
    .sort((a, b) => b.score - a.score);
}

export function rankCoaches(coaches, { sport = null, window = 'any', q = '' } = {}) {
  const needle = q.trim().toLowerCase();
  return coaches
    .filter(c => !sport || c.sport === sport)
    .filter(c => !needle || [c.name, c.sport, c.focus].join(' ').toLowerCase().includes(needle))
    .map(c => ({ ...c, trust: trust(c), fit: overlap(c, window), verified: verified(c) }))
    .sort((a, b) => (b.fit > 0) - (a.fit > 0) || b.trust - a.trust);
}

/** Book a slot. Refuses double bookings and past slots. Returns a new set, never mutates. */
export function book(booked, venue, slot) {
  const k = `${venue.id}|${slot.key}`;
  if (slot.past) return { ok: false, reason: 'That time has passed.' };
  if (booked.has(k) || slot.taken) return { ok: false, reason: 'Someone just took that slot. Pick another.' };
  const next = new Set(booked); next.add(k);
  return { ok: true, booked: next, ref: 'ATH-' + k.replace(/\D/g, '').slice(-8) };
}

export function directions(venue) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name + ', ' + venue.area + ', Chennai')}`;
}
