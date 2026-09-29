import test from 'node:test';
import assert from 'node:assert/strict';
import { VENUES, COACHES } from '../src/data.js';
import { seedBusy, slots, fits, trust, verified, overlap, rankVenues, rankCoaches, book, addDays } from '../src/booking.js';

const monday = new Date('2026-10-05T00:00:00');
const pulse = VENUES.find(v => v.id === 'pulse');

test('slots cover opening hours and mark past ones', () => {
  const s = slots(pulse, monday, new Set(), new Date('2026-10-05T12:30:00'));
  assert.equal(s.length, pulse.close - pulse.open);
  assert.equal(s[0].label, '5:00 AM');
  assert.ok(s.find(x => x.hour === 12).past);
  assert.ok(!s.find(x => x.hour === 13).past);
});

test('free windows match days and hours', () => {
  assert.ok(fits('morning', 1, 6));
  assert.ok(!fits('morning', 1, 18));
  assert.ok(fits('weekend', 6, 18));
  assert.ok(!fits('weekend', 3, 18));
  assert.ok(fits('any', 3, 3));
});

test('verified credentials drive trust; unverified claims do not', () => {
  const albert = COACHES.find(c => c.id === 'albert'), karthik = COACHES.find(c => c.id === 'karthik');
  assert.ok(trust(albert) > trust(karthik));
  assert.ok(verified(albert));
  assert.ok(!verified(karthik));
  assert.ok(trust(albert) <= 100 && trust(karthik) >= 0);
});

test('coaches with no schedule overlap sink below ones who fit', () => {
  const ranked = rankCoaches(COACHES, { window: 'weekend' });
  const firstNoFit = ranked.findIndex(c => c.fit === 0);
  assert.ok(ranked.slice(0, firstNoFit).every(c => c.fit > 0));
  assert.equal(overlap(COACHES.find(c => c.id === 'karthik'), 'weekend'), 0);
});

test('venue ranking filters by sport and search', () => {
  const r = rankVenues(VENUES, { sport: 'Athletics', from: monday });
  assert.ok(r.every(v => v.sports.includes('Athletics')));
  assert.deepEqual(rankVenues(VENUES, { q: 'kelambakkam', from: monday }).map(v => v.id), ['shuttle']);
});

test('booking refuses double bookings and past slots', () => {
  const now = new Date('2026-10-05T04:00:00');
  const s = slots(pulse, monday, new Set(), now).find(x => x.hour === 6);
  const first = book(new Set(), pulse, s);
  assert.ok(first.ok && first.booked.size === 1 && first.ref.startsWith('ATH-'));
  const again = book(first.booked, pulse, s);
  assert.equal(again.ok, false);
  const past = slots(pulse, addDays(monday, -1), new Set(), now)[0];
  assert.equal(book(new Set(), pulse, past).ok, false);
});

test('seeded busy slots leave most of the day open', () => {
  for (const v of VENUES) for (let i = 0; i < 14; i++) {
    const d = addDays(new Date('2026-10-05T00:00:00'), i), n = v.close - v.open;
    const busy = [...seedBusy(v, d)].length;
    assert.ok(busy < n * 0.6, `${v.id} day ${i}: ${busy}/${n} busy`);
  }
});
