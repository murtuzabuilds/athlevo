import { HOME, SPORTS, VENUES, COACHES, EVENTS } from './src/data.js';
import { WINDOWS, slots, seedBusy, fits, rankVenues, rankCoaches, book, addDays, directions, fmtHour } from './src/booking.js';

const $ = s => document.querySelector(s);
const KEY = 'athlevo.v1';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const saved = load();
const S = {
  window: saved.window || 'any', sport: null, q: '',
  booked: new Set(saved.booked || []), bookings: saved.bookings || [], registered: new Set(saved.registered || []),
  chats: saved.chats || {}, stack: [], day: 0, pick: null,
};
const save = () => { try { localStorage.setItem(KEY, JSON.stringify({ window: S.window, booked: [...S.booked], bookings: S.bookings, registered: [...S.registered], chats: S.chats })); } catch {} };
const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const inr = n => '₹' + n.toLocaleString('en-IN');
const initials = n => n.split(' ').map(w => w[0]).join('').slice(0, 2);
const venueById = id => VENUES.find(v => v.id === id);
const coachById = id => COACHES.find(c => c.id === id);
const hue = id => [...id].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
const thumb = v => v.img ? `style="background-image:url(${v.img})"` : `style="background:linear-gradient(135deg,hsl(${hue(v.id)} 55% 38%),#2A2A2E)"`;
const star = '<svg class="st" viewBox="0 0 24 24"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.5 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>';
const back = '<button type="button" class="back" data-back aria-label="Back">‹</button>';

function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2200); }

/* ---------- router ---------- */
function go(name, arg, push = true) {
  if (push && S.cur) S.stack.push(S.cur);
  S.cur = { name, arg };
  $('#view').innerHTML = VIEWS[name](arg);
  $('#view').scrollTop = 0;
  const tab = { home: 'home', venues: 'home', venue: 'home', slots: 'home', coaches: 'coaches', coach: 'coaches', bookings: 'bookings', events: 'events', chat: 'chat', thread: 'chat' }[name];
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
}
const rerender = () => go(S.cur.name, S.cur.arg, false);

/* ---------- shared bits ---------- */
const windowBar = () => `<div class="when"><span>I'm free</span>${Object.entries(WINDOWS).map(([k, w]) => `<button type="button" data-window="${k}" class="${S.window === k ? 'on' : ''}">${w.label}</button>`).join('')}</div>`;
const fitTag = n => n > 0 ? `<span class="fit">${n} open slot${n === 1 ? '' : 's'} when you're free</span>` : `<span class="fit none">No slots in your window</span>`;
const venueCard = v => `<button type="button" class="vcard" data-venue="${v.id}"><div class="ph" ${thumb(v)}><span class="chip">${v.km} km</span></div>
  <div class="vb"><b>${esc(v.name)}</b><small>${esc(v.area)} · ${v.sports.join(', ')}</small><div class="row"><span>${star}${v.rating} <i>(${v.reviews})</i></span><span class="price">${inr(v.price)}<i>/${v.per}</i></span></div>${fitTag(v.open)}</div></button>`;
const coachRow = c => `<button type="button" class="crow" data-coach="${c.id}"><span class="av" style="--h:${hue(c.id)}">${initials(c.name)}${c.verified ? '<i class="tick" title="Verified">✓</i>' : ''}</span>
  <span class="cm"><b>${esc(c.name)}</b><small>${c.sport} · ${esc(c.focus)}</small><small class="${c.fit ? 'ok' : 'no'}">${c.fit ? `${c.fit} hours a week that fit you` : 'Schedule does not overlap'}</small></span>
  <span class="trust"><b>${c.trust}</b><small>trust</small></span></button>`;

/* ---------- views ---------- */
const VIEWS = {
  home() {
    const venues = rankVenues(VENUES, { sport: S.sport, window: S.window, from: today(), booked: S.booked, q: S.q });
    const coaches = rankCoaches(COACHES, { sport: S.sport, window: S.window, q: S.q }).slice(0, 3);
    return `<header class="top"><div><small>Your location</small><b>⌖ ${HOME.area} ⌄</b></div><span class="me">M</span></header>
    <label class="search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="q" placeholder="Search venues, coaches, sports" value="${esc(S.q)}" autocomplete="off"></label>
    ${windowBar()}
    <div class="cats"><button type="button" data-sport="" class="${!S.sport ? 'on' : ''}">All</button>${SPORTS.map(s => `<button type="button" data-sport="${s}" class="${S.sport === s ? 'on' : ''}">${s}</button>`).join('')}</div>
    <div class="h"><h2>Spotlight</h2><button type="button" data-go="venues">See all</button></div>
    <div class="rail">${venues.length ? venues.map(venueCard).join('') : '<p class="empty">No venues match. Try another sport.</p>'}</div>
    <div class="h"><h2>Coach choice</h2><button type="button" data-tab="coaches">See all</button></div>
    <div class="list">${coaches.map(coachRow).join('') || '<p class="empty">No coaches match.</p>'}</div>
    <div class="h"><h2>Athletic events</h2><button type="button" data-tab="events">See all</button></div>
    <div class="evrail">${EVENTS.slice(0, 4).map(e => `<button type="button" class="ev" data-tab="events" style="--c:${e.color}"><b>${e.dist}<i>${e.unit}</i></b><small>in ${e.inDays} days</small></button>`).join('')}</div>`;
  },
  venues() {
    const venues = rankVenues(VENUES, { sport: S.sport, window: S.window, from: today(), booked: S.booked, q: S.q });
    return `<header class="bar">${back}<b>Venues near ${HOME.area}</b><span></span></header>${windowBar()}
    <p class="note">Ranked by open slots in your window, then rating, then distance.</p>
    <div class="stack">${venues.map(venueCard).join('')}</div>`;
  },
  venue(id) {
    const v = venueById(id), coaches = COACHES.filter(c => c.venue === id);
    return `<div class="hero" ${thumb(v)}>${back}</div>
    <div class="pad"><h1>${esc(v.name)}</h1><p class="muted">${esc(v.area)} · ${v.km} km away</p>
    <div class="stats"><div><b>${star}${v.rating}</b><small>Ratings</small></div><div><b>${v.reviews}</b><small>Reviews</small></div><div><b>${v.close - v.open}h</b><small>Open daily</small></div></div>
    <h3>Location</h3><a class="map" href="${directions(v)}" target="_blank" rel="noopener"><span>${esc(v.area)}, Chennai</span><b>Get directions ↗</b></a>
    <h3>What's here</h3><div class="amen">${v.amenities.map(a => `<span>${esc(a)}</span>`).join('')}</div>
    ${coaches.length ? `<h3>Coaches here</h3><div class="list">${rankCoaches(coaches, { window: S.window }).map(coachRow).join('')}</div>` : ''}
    <h3>Reviews</h3><div class="rev"><p>“Track surface is excellent and the morning slots are rarely crowded.”</p><small>Sample review</small></div>
    </div><div class="buy"><div><b>${inr(v.price)}</b><small>/${v.per}</small></div><button type="button" class="volt" data-slots="${v.id}">Book now</button></div>`;
  },
  slots(id) {
    const v = venueById(id), days = [...Array(7)].map((_, i) => addDays(today(), i));
    const d = days[S.day], busy = new Set([...seedBusy(v, d), ...S.booked]);
    const all = slots(v, d, busy, new Date());
    return `<header class="bar">${back}<b>Slot booking</b><span></span></header>
    <div class="pad"><p class="muted">${esc(v.name)} · ${d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
    <div class="days">${days.map((x, i) => `<button type="button" data-day="${i}" class="${i === S.day ? 'on' : ''}"><small>${x.toLocaleDateString('en-IN', { weekday: 'short' })}</small><b>${x.getDate()}</b></button>`).join('')}</div>
    ${windowBar()}
    <div class="legend"><span><i class="lg fitc"></i>Fits you</span><span><i class="lg"></i>Open</span><span><i class="lg tk"></i>Taken</span></div>
    <div class="grid">${all.map(s => { const f = fits(S.window, d.getDay(), s.hour) && S.window !== 'any'; return `<button type="button" data-slot="${s.key}" ${s.taken || s.past ? 'disabled' : ''} class="${S.pick === s.key ? 'on' : ''} ${f ? 'f' : ''} ${s.taken ? 'tk' : ''}">${s.label}</button>`; }).join('')}</div></div>
    <div class="buy"><div><b>${S.pick ? fmtHour(+S.pick.slice(-2)) : 'Pick a time'}</b><small>${S.pick ? d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' }) : '60 minute slot'}</small></div><button type="button" class="volt" data-confirm="${v.id}" ${S.pick ? '' : 'disabled'}>Confirm</button></div>`;
  },
  coaches() {
    const list = rankCoaches(COACHES, { sport: S.sport, window: S.window, q: S.q });
    return `<header class="bar"><span></span><b>Verified coaches</b><span></span></header>${windowBar()}
    <p class="note">Trust score = verified credentials, years coaching, rating and sessions delivered. Self-reported claims count against it until verified.</p>
    <div class="list">${list.map(coachRow).join('')}</div>`;
  },
  coach(id) {
    const c = rankCoaches([coachById(id)], { window: S.window })[0], v = venueById(c.venue);
    const dn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `<header class="bar">${back}<b>Coach</b><span></span></header>
    <div class="pad center"><span class="av xl" style="--h:${hue(c.id)}">${initials(c.name)}${c.verified ? '<i class="tick">✓</i>' : ''}</span><h1>${esc(c.name)}</h1><p class="muted">${c.sport} · ${esc(c.focus)}</p>
    <div class="stats"><div><b>${c.trust}</b><small>Trust</small></div><div><b>${star}${c.rating}</b><small>Rating</small></div><div><b>${c.years}y</b><small>Coaching</small></div><div><b>${c.sessions}</b><small>Sessions</small></div></div></div>
    <div class="pad"><h3>Qualifications</h3><ul class="creds">${c.creds.map(x => `<li class="${x.verified ? 'v' : 'u'}"><span>${x.verified ? '✓' : '?'}</span>${esc(x.t)}<small>${x.verified ? 'Verified by Athlevo' : 'Self-reported'}</small></li>`).join('')}</ul>
    <h3>Availability</h3><p class="muted">${c.windows.days.map(d => dn[d]).join(', ')} · ${c.windows.hours.map(fmtHour).join(', ')}</p>
    <p class="${c.fit ? 'ok' : 'no'}">${c.fit ? `${c.fit} of those hours fit your "${WINDOWS[S.window].label}" window.` : `Nothing overlaps your "${WINDOWS[S.window].label}" window. Try another.`}</p>
    <h3>Trains at</h3>${venueCard(rankVenues([v], { window: S.window, from: today(), booked: S.booked })[0])}</div>
    <div class="buy"><div><b>${inr(c.fee)}</b><small>/session</small></div><button type="button" class="ghost" data-thread="${c.id}">Chat</button><button type="button" class="volt" data-slots="${c.venue}">Book</button></div>`;
  },
  bookings() {
    const up = S.bookings.slice().reverse();
    return `<header class="bar"><span></span><b>My bookings</b><span></span></header><div class="pad">
    ${up.length ? up.map(b => `<div class="bk"><div class="ph sm" ${thumb(venueById(b.venue))}></div><div><b>${esc(venueById(b.venue).name)}</b><small>${b.when}</small><small class="ref">${b.ref}</small></div></div>`).join('') : '<div class="emptybig"><b>No bookings yet</b><p>Find a venue that fits your schedule and grab a slot.</p><button type="button" class="volt" data-go="venues">Browse venues</button></div>'}
    ${[...S.registered].length ? `<h3>Events</h3>${[...S.registered].map(id => { const e = EVENTS.find(x => x.id === id); return `<div class="bk"><div class="ph sm ev" style="--c:${e.color}"><b>${e.dist}</b></div><div><b>${esc(e.name)}</b><small>in ${e.inDays} days · ${esc(venueById(e.venue).name)}</small></div></div>`; }).join('')}` : ''}</div>`;
  },
  events() {
    return `<header class="bar"><span></span><b>Athletic events</b><span></span></header><div class="pad"><p class="muted">Meets, clinics and community runs near ${HOME.area}.</p>
    <div class="evgrid">${EVENTS.map(e => { const r = S.registered.has(e.id); return `<div class="evc" style="--c:${e.color}"><b class="d">${e.dist}<i>${e.unit}</i></b><div><b>${esc(e.name)}</b><small>${esc(venueById(e.venue).name)} · in ${e.inDays} days</small><small>${inr(e.fee)} · ${e.spots - (r ? 1 : 0)} spots left</small></div><button type="button" class="${r ? 'ghost' : 'volt'} sm" data-reg="${e.id}">${r ? 'Registered ✓' : 'Register'}</button></div>`; }).join('')}</div></div>`;
  },
  chat() {
    return `<header class="bar"><span></span><b>Chats</b><span></span></header><div class="pad"><div class="seg"><button type="button" class="on">Coaches</button><button type="button" disabled>Venues</button></div>
    <div class="list">${COACHES.map(c => { const t = S.chats[c.id] || []; const last = t[t.length - 1]; return `<button type="button" class="crow" data-thread="${c.id}"><span class="av" style="--h:${hue(c.id)}">${initials(c.name)}</span><span class="cm"><b>${esc(c.name)}</b><small>${last ? esc(last.t) : 'Say hi and share your goal'}</small></span></button>`; }).join('')}</div></div>`;
  },
  thread(id) {
    const c = coachById(id), t = S.chats[id] || [];
    return `<header class="bar">${back}<b>${esc(c.name)}</b><span></span></header>
    <div class="msgs">${t.length ? t.map(m => `<p class="m ${m.me ? 'me' : ''}">${esc(m.t)}</p>`).join('') : `<p class="m">Hi! I'm ${esc(c.name.split(' ')[0])}. What are you training for?</p>`}</div>
    <form class="compose" data-send="${id}"><input name="t" placeholder="Message" autocomplete="off" required><button class="volt" aria-label="Send">➤</button></form>`;
  },
};

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('button,[data-back]'); if (!t) return;
  const d = t.dataset;
  if ('back' in d) { const p = S.stack.pop(); if (p) go(p.name, p.arg, false); return; }
  if (d.tab) { S.stack = []; S.cur = null; S.pick = null; go(d.tab); return; }
  if (d.go) { go(d.go); return; }
  if (d.window) { S.window = d.window; save(); rerender(); return; }
  if (d.sport !== undefined) { S.sport = d.sport || null; rerender(); return; }
  if (d.venue) { go('venue', d.venue); return; }
  if (d.coach) { go('coach', d.coach); return; }
  if (d.slots) { S.day = 0; S.pick = null; go('slots', d.slots); return; }
  if (d.day) { S.day = +d.day; S.pick = null; rerender(); return; }
  if (d.slot) { S.pick = d.slot; rerender(); return; }
  if (d.confirm) {
    const v = venueById(d.confirm), day = addDays(today(), S.day);
    const slot = slots(v, day, new Set([...seedBusy(v, day), ...S.booked]), new Date()).find(s => s.key === S.pick);
    const r = book(S.booked, v, slot);
    if (!r.ok) { toast(r.reason); return; }
    S.booked = r.booked;
    S.bookings.push({ venue: v.id, when: `${day.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · ${slot.label}`, ref: r.ref });
    S.pick = null; save(); toast(`Booked. Ref ${r.ref}`); S.stack = []; S.cur = null; go('bookings'); return;
  }
  if (d.reg) { S.registered.has(d.reg) ? S.registered.delete(d.reg) : S.registered.add(d.reg); save(); rerender(); toast(S.registered.has(d.reg) ? 'You are in. See it under bookings.' : 'Registration cancelled'); return; }
  if (d.thread) { go('thread', d.thread); return; }
});
document.addEventListener('input', e => {
  if (e.target.id !== 'q') return;
  S.q = e.target.value; const pos = e.target.selectionStart; rerender();
  const q = $('#q'); q.focus(); q.setSelectionRange(pos, pos);
});
document.addEventListener('submit', e => {
  const f = e.target.closest('[data-send]'); if (!f) return; e.preventDefault();
  const id = f.dataset.send, text = new FormData(f).get('t').trim(); if (!text) return;
  const c = coachById(id), t = (S.chats[id] ||= []);
  t.push({ me: true, t: text });
  t.push({ me: false, t: /price|fee|cost/i.test(text) ? `It's ${inr(c.fee)} a session. First one is a free assessment.` : /when|time|slot|free/i.test(text) ? `I'm usually free ${c.windows.hours.map(fmtHour).slice(0, 3).join(', ')}. Book a slot and I'll confirm.` : `Great. Book a slot at ${venueById(c.venue).name} and we'll start with an assessment.` });
  save(); rerender(); const m = $('.msgs'); if (m) m.scrollTop = m.scrollHeight;
});

go('home');
