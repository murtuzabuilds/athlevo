import { HOME, SPORTS, VENUES, COACHES, EVENTS, CATEGORIES, ME } from './src/data.js';
import { WINDOWS, slots, seedBusy, fits, rankVenues, rankCoaches, book, addDays, directions, fmtHour, openInWindow, trustParts, coachOpenSlots, coachWorks } from './src/booking.js';

const $ = s => document.querySelector(s);
const KEY = 'athlevo.v2';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const saved = load();
const S = {
  window: saved.window || 'any', sport: null, q: '', eq: '', onlyMine: false,
  booked: new Set(saved.booked || []), bookings: saved.bookings || [], registered: new Set(saved.registered || []),
  chats: saved.chats || {}, read: new Set(saved.read || []), favs: new Set(saved.favs || []),
  stack: [], cur: null, day: 0, pick: null, deck: 0, seg: 'coaches', bseg: 'slots', flow: null, pay: 'recent',
};
const save = () => { try { localStorage.setItem(KEY, JSON.stringify({ window: S.window, booked: [...S.booked], bookings: S.bookings, registered: [...S.registered], chats: S.chats, read: [...S.read], favs: [...S.favs] })); } catch {} };
const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const inr = n => '₹ ' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
const initials = n => n.split(' ').map(w => w[0]).join('').slice(0, 2);
const first = n => n.split(' ')[0];
const venueById = id => VENUES.find(v => v.id === id);
const coachById = id => COACHES.find(c => c.id === id);
const SERVICE_RATE = 0.01093; // sample platform fee, the rate implied by the bill on the case study board

/* ---------- icons: the outline set from the case study, 1.5px strokes on a 24px grid ---------- */
const I = {
  home: '<path class="f" d="M4.5 10.6 11 5.2a1.6 1.6 0 0 1 2 0l6.5 5.4v6.9a2.5 2.5 0 0 1-2.5 2.500H7a2.5 2.5 0 0 1-2.5-2.5z"/><path class="d" d="M12 15v2"/>',
  events: '<circle class="f" cx="12" cy="7.2" r="1.9"/><path d="M9.6 13.200V11L7.9 5.400M14.4 13.200V11l1.7-5.600M9.6 11c1.5.9 3.3.9 4.8 0"/><path class="f" d="M5.2 14.600c4.4-1.5 9.2-1.5 13.6 0v3.500c-4.4-1.5-9.2-1.5-13.6 0z"/><path d="M5.2 16.4 3.4 17l.9 1.5-.9 1.600h2.900M18.8 16.400l1.8.6-.9 1.5.9 1.600h-2.900M5.3 5.200v2.200M4.2 6.300h2.200M18.6 3.600v2.200M17.5 4.700h2.2"/>',
  whistle: '<circle cx="10.4" cy="14.6" r="5.1"/><circle cx="10.4" cy="14.6" r="2.3"/><path d="M13.7 10.7 18.2 6.200l2.3 2.3-4.1 4.4"/><circle cx="5.5" cy="19.7" r="1.1"/><path d="M9.6 6.6 8.9 4.600M12.4 6.200l.2-2M7 8.3 5.4 7"/>',
  stadium: '<ellipse cx="12" cy="10.6" rx="8" ry="3.3"/><ellipse class="f" cx="12" cy="10.9" rx="5" ry="1.7"/><path d="M4 10.600v5c0 1.8 3.6 3.3 8 3.300s8-1.5 8-3.300v-5M4 13.200c0 1.8 3.6 3.3 8 3.300s8-1.5 8-3.300M10.2 7.300V4.800h3.600v2.500M5.4 8.300V4.400l1.8.9-1.8.9M18.6 8.300V4.400l-1.8.9 1.8.9"/>',
  chat: '<path class="f" d="M7 4.500h10A3.5 3.5 0 0 1 20.5 8v6a3.5 3.5 0 0 1-3.5 3.500h-2.600L12 19.800l-2.4-2.300H7A3.5 3.5 0 0 1 3.5 14V8A3.5 3.5 0 0 1 7 4.500z"/><path class="d" stroke-width="2" d="M8.6 11h.01M12 11h.01M15.4 11h.01"/>',
  search: '<circle cx="11.2" cy="11.2" r="7"/><path d="m17.8 18 1.5 1.5"/>',
  bell: '<path d="M6.5 16.500V11a5.5 5.5 0 0 1 11 0v5.500l1.3 1.600H5.200zM10.4 20.300a1.8 1.8 0 0 0 3.2 0M12 8.200v1.6"/>',
  pin: '<path d="M12 21s6.5-5.6 6.5-10.600a6.5 6.5 0 0 0-13 0C5.5 15.4 12 21 12 21z"/><circle cx="12" cy="10.3" r="2.2"/>',
  heart: '<path class="f" d="M12 19.800s-7.5-4.4-7.5-9.700A4.3 4.3 0 0 1 12 7.600a4.3 4.3 0 0 1 7.5 2.500c0 5.3-7.5 9.7-7.5 9.700z"/>',
  hourglass: '<path d="M7.5 4h9v2.600c0 1.6-.9 3-2.3 3.800L12 12l-2.2-1.600A4.4 4.4 0 0 1 7.5 6.600zM7.5 20h9v-2.600c0-1.6-.9-3-2.3-3.800L12 12l-2.2 1.600a4.4 4.4 0 0 0-2.3 3.800z"/>',
  filter: '<path d="M5.7 4.500h12.600a1 1 0 0 1 .8 1.600l-4.5 5.800v5.900a1 1 0 0 1-.6.900l-2.2 1a1 1 0 0 1-1.4-.9v-6.900L4.9 6.100a1 1 0 0 1 .8-1.600zM7.2 5l3.4 4.6"/>',
  send: '<path d="M20 4 9.8 13.400M20 4l-6.2 16-4-6.6-6.2-3.600z"/>',
  emoji: '<rect x="4" y="4" width="16" height="16" rx="4.5"/><path stroke-width="2" d="M9 9.500h.01M15 9.500h.01"/><path d="M8.5 13.200h7a3.5 3.5 0 0 1-7 0z"/>',
  star: '<path d="m12 3.6 2.5 5.2 5.7.8-4.1 4 1 5.700L12 16.600l-5.1 2.7 1-5.7-4.1-4 5.7-.8z"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.800v5"/><path stroke-width="2" d="M12 16.200h.01"/>',
  settings: '<path d="M12 3.2 19.4 7.500v9L12 20.800l-7.4-4.300v-9z"/><circle cx="12" cy="12" r="2.6"/>',
  edit: '<path d="m14.6 5.4 4 4L10 18l-4.6.8.8-4.600zM13 7l4 4M5 21h14"/>',
  shield: '<path class="f" d="M12 3.4 19 6v5.400c0 4.3-2.9 7.6-7 9.2-4.1-1.6-7-4.9-7-9.200V6z"/><path class="d" d="m9 12 2.2 2.2 4-4.2"/>',
  shieldq: '<path d="M12 3.4 19 6v5.400c0 4.3-2.9 7.6-7 9.2-4.1-1.6-7-4.9-7-9.200V6z"/><path d="M12 8.600v4"/><path stroke-width="2" d="M12 15.600h.01"/>',
  card: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="M3.5 10h17M7 14.500h2.500M12 14.500h2"/>',
  bank: '<path d="M4 9.5 12 4.500l8 5zM6.5 9.500V17M10 9.500V17M14 9.500V17M17.5 9.500V17M4.5 17h15M4 19.500h16"/>',
  upi: '<path d="M6 17 9 7l5 5-5 5zM13 17l3-10 3 5-3 5z"/>',
  wallet: '<rect x="3.5" y="6" width="17" height="12.5" rx="3"/><path d="M3.5 10h17M15.5 14.200h2"/>',
  back: '<path d="m14.5 6-6 6 6 6"/>',
  chev: '<path d="m9.5 6 6 6-6 6"/>',
  down: '<path d="m6.5 9.5 5.5 5.5 5.5-5.5"/>',
  plus: '<rect x="4" y="4" width="16" height="16" rx="4.5"/><path d="M12 8.500v7M8.5 12h7"/>',
  check: '<path d="m5.5 12.5 4.2 4.2 8.8-9"/>',
  close: '<path d="m6.5 6.5 11 11M17.5 6.500l-11 11"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="3"/><path d="M4 10h16M8.5 3.500v4M15.5 3.500v4"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
};
const ic = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;
// Sport pictograms for the Athletic Events row, drawn in the round button style of the home board.
const P = {
  track: '<circle class="h" cx="20.5" cy="6.5" r="2.6"/><path d="M19 11.5 14 14l-4-1M19 11.500l-2 6 5 3v5M17 17.500l-4 3.5-5-.5M19 11.500l4.5 2.5 3-2"/>',
  field: '<circle class="h" cx="17" cy="7" r="2.6"/><path d="M16.5 12v7.500l-4 6M16.5 19.500l4.5 5.500M16.5 13.500l-6 2.500M16.5 13.500l6.5-3.5"/><path stroke-width="1.6" d="M5 9.5 28 4"/>',
  swimming: '<circle class="h" cx="22.5" cy="12.5" r="2.6"/><path d="M4.5 17.5 12 13l5 4h4"/><path stroke-width="1.8" d="M3 23c2-1.6 4-1.6 6 0s4 1.6 6 0 4-1.6 6 0 4 1.6 6 0"/>',
  hockey: '<circle class="h" cx="14.5" cy="6.5" r="2.6"/><path d="M14.5 11.500v7l-3.5 7M14.5 18.500l5 6M14.5 13l5.5 4"/><path stroke-width="1.8" d="M19.5 16.5 23.5 25h3.5"/>',
  cycling: '<circle cx="8" cy="22" r="5"/><circle cx="24" cy="22" r="5"/><path d="M8 22l5-9h7l4 9M13 13l4 9M20 13l-1.5-3.500h3"/><circle class="h" cx="16.5" cy="5.5" r="2.3"/>',
};
const pic = n => `<svg class="pic" viewBox="0 0 32 32" aria-hidden="true">${P[n]}</svg>`;
const star = `<svg class="st" viewBox="0 0 24 24" aria-hidden="true">${I.star}</svg>`;
const backBtn = '<button type="button" class="rb lav" data-back aria-label="Back">' + ic('back') + '</button>';
const stadiumArt = '<svg class="art" viewBox="0 0 120 96" aria-hidden="true"><ellipse cx="60" cy="58" rx="54" ry="28" fill="#8F8B7C"/><path d="M6 46v12c0 15.5 24.2 28 54 28s54-12.5 54-28V46z" fill="#A8A493"/><ellipse cx="60" cy="46" rx="54" ry="28" fill="#D5D1C0"/><ellipse cx="60" cy="47" rx="43" ry="21" fill="#B6583A"/><ellipse cx="60" cy="48" rx="31" ry="14" fill="#5FA052"/><ellipse cx="60" cy="48" rx="31" ry="14" fill="none" stroke="#F6F6F6" stroke-width="1"/><path d="M60 34v28" stroke="#F6F6F6" stroke-width="1"/><circle cx="60" cy="48" r="4.5" fill="none" stroke="#F6F6F6" stroke-width="1"/><path d="M14 60v9M26 68v9M42 74v9M60 76v9M78 74v9M94 68v9M106 60v9" stroke="#8F8B7C" stroke-width="2"/><path d="M92 16v14M92 16h9v6h-9M24 20v12M24 20h8v5h-8" stroke="#6C6C6C" stroke-width="1.6" fill="#D5D1C0"/></svg>';

function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2400); }

/* ---------- matching copy: one place that says why something is ranked where it is ---------- */
const WIN = { morning: 'mornings', evening: 'evenings', weekend: 'weekends' };
const WIN_HINT = { any: 'No preference', morning: '5 to 10 AM', evening: '4 to 9 PM', weekend: 'Sat and Sun' };
const inYour = () => S.window === 'any' ? 'this week' : `in your ${WIN[S.window]}`;
const slotReason = n => n > 0 ? `${n} open slot${n === 1 ? '' : 's'} ${inYour()}` : `No open slots ${inYour()}`;
const rankedVenues = (o = {}) => rankVenues(VENUES, { sport: S.sport, window: S.window, from: today(), booked: S.booked, q: S.q, ...o });
const withSlots = c => { const v = venueById(c.venue); return { ...c, km: v.km, open: coachOpenSlots(c, v, S.window, today(), S.booked) }; };
const rankedCoaches = (o = {}) => rankCoaches(COACHES, { sport: S.sport, window: S.window, q: S.q, ...o }).map(withSlots);
const oneCoach = id => withSlots(rankCoaches([coachById(id)], { window: S.window })[0]);
const oneVenue = id => rankVenues([venueById(id)], { window: S.window, from: today(), booked: S.booked })[0];

/* ---------- router ---------- */
const TAB = { home: 'home', events: 'events', eventlist: 'events', event: 'events', coaches: 'coaches', coachlist: 'coaches', coach: 'coaches', venuehome: 'venuehome', venues: 'venuehome', venue: 'venuehome', chat: 'chat', thread: 'chat' };
const ROOTS = new Set(['home', 'events', 'coaches', 'venuehome', 'chat']);
const NAV = [['home', 'Home', 'home'], ['events', 'Events', 'events'], ['coaches', 'Coaches', 'whistle'], ['venuehome', 'Venue', 'stadium'], ['chat', 'Chats', 'chat']];
function drawTabs(active) {
  $('#tabs').innerHTML = NAV.map(([t, label, icon], i) => `<button type="button" data-tab="${t}" class="${i === 2 ? 'mid ' : ''}${active === t ? 'on' : ''}" aria-label="${label}"${active === t ? ' aria-current="page"' : ''}>${ic(icon)}${i === 2 ? '' : `<span>${label}</span>`}</button>`).join('');
}
function go(name, arg, push = true) {
  if (push && S.cur) S.stack.push(S.cur);
  S.cur = { name, arg };
  const v = $('#view');
  v.className = 'view v-' + name + (ROOTS.has(name) ? ' root' : '');
  v.innerHTML = VIEWS[name](arg);
  v.scrollTop = 0;
  $('#tabs').hidden = !ROOTS.has(name);
  drawTabs(TAB[name]);
  closeSheet();
  const pr = $('#promo');
  if (pr) {
    pr.scrollLeft = (pr.scrollWidth - pr.clientWidth) / 2;
    pr.addEventListener('scroll', () => { const i = Math.round(pr.scrollLeft / ((pr.scrollWidth - pr.clientWidth) / 2 || 1)); document.querySelectorAll('.dots i').forEach((d, k) => d.classList.toggle('on', k === i)); }, { passive: true });
  }
}
const rerender = () => { const y = $('#view').scrollTop; go(S.cur.name, S.cur.arg, false); $('#view').scrollTop = y; };

/* ---------- shared pieces ---------- */
const photo = (o, cls = '') => o.img ? `<span class="ph ${cls}" style="background-image:url(${o.img})"></span>` : `<span class="ph none ${cls}" style="--tint:${o.tint || '#363648'}">${o.sports ? pic(o.sports[0] === 'Swimming' ? 'swimming' : 'field') : `<b>${initials(o.name)}</b>`}</span>`;
const me = () => `<button type="button" class="avatar" data-go="profile" aria-label="Your Athlevo ID">${initials(ME.name)}</button>`;
const topbar = (bell = false) => `<header class="top"><button type="button" class="loc" data-toast="Sample location. The prototype is set in ${HOME.area}, Chennai."><small>Your location</small><b>${ic('pin')}${HOME.area}${ic('down')}</b></button>
  <span class="top-r">${bell ? `<button type="button" class="rb lav${S.bookings.length || S.registered.size ? ' dot' : ''}" data-go="bookings" aria-label="Your bookings">${ic('bell')}</button>` : ''}${me()}</span></header>`;
const filterOn = () => S.window !== 'any' || S.sport;
const search = (ph, id = 'q', val = S.q) => `<label class="search">${ic('search')}<input id="${id}" placeholder="${ph}" value="${esc(val)}" autocomplete="off">${id === 'q' ? `<button type="button" class="fbtn${filterOn() ? ' on' : ''}" data-sheet="filter" aria-label="Filter and schedule">${ic('filter')}</button>` : ''}</label>`;
const freeline = () => `<button type="button" class="freeline${S.window === 'any' ? '' : ' on'}" data-sheet="filter">${ic('hourglass')}<span>${S.window === 'any' ? 'When are you free? Say it once' : `Free ${WIN[S.window]} · ranked by open slots`}</span><i>${S.window === 'any' ? 'Set' : 'Change'}</i></button>`;
const head = (t, attr = '') => `<div class="h"><h2>${t}</h2>${attr ? `<button type="button" ${attr}>View all ${ic('chev')}</button>` : ''}</div>`;
const heart = (key, cls = 'rb ghost') => `<button type="button" class="${cls}${S.favs.has(key) ? ' fav' : ''}" data-fav="${key}" aria-label="Save" aria-pressed="${S.favs.has(key)}">${ic('heart')}</button>`;
const why = (n, cls = '') => `<span class="why ${n ? '' : 'none'} ${cls}">${ic('hourglass')}${slotReason(n)}</span>`;
const trustTag = c => `<span class="trust-tag" title="Trust score">${ic(c.verified ? 'shield' : 'shieldq')}Trust ${c.trust}</span>`;

const spotCard = (v, c) => `<button type="button" class="spot" data-venue="${v.id}">${photo(v)}${c && c.id ? `<span class="by">${photo(c, 'round')}${esc(first(c.name))} trains here</span>` : ''}${S.favs.has('v:' + v.id) ? `<i class="favmark">${ic('heart')}</i>` : ''}
  <span class="row"><b>${esc(v.name)}</b><span>${v.rating} ${star}</span></span>
  <span class="meta"><span>${ic('pin')}${v.km} kms away</span><span>${ic('hourglass')}${v.open} open</span></span></button>`;
const venueCard = v => `<article class="lcard" data-venue="${v.id}">${photo(v)}<div><b>${esc(v.name)}</b>
  <span class="rate">${v.rating} ${star} <i>•</i> ${v.reviews} reviews</span>
  <span class="meta"><span>${ic('pin')}${v.km} kms away</span><span>${ic('hourglass')}${v.open} open</span></span>
  <span class="act"><button type="button" class="btn sm" data-slots="${v.id}">Book Venue ${ic('chev')}</button></span></div>${heart('v:' + v.id, 'rb ghost sm')}
  <p class="match">${slotReason(v.open)}</p></article>`;
const coachCard = c => `<article class="lcard" data-coach="${c.id}">${photo(c)}<div><b>${esc(c.name)}</b>
  <span class="rate">${c.rating} ${star} <i>•</i> ${c.reviews} reviews</span>
  <span class="meta"><span>${ic('pin')}${c.km} kms away</span>${trustTag(c)}</span>
  <span class="act"><button type="button" class="btn sm" data-book="${c.id}">Book Coach ${ic('chev')}</button></span></div>${heart('c:' + c.id, 'rb ghost sm')}
  <p class="match">${slotReason(c.open)}</p></article>`;
const miniCoach = c => `<button type="button" class="mini" data-coach="${c.id}">${photo(c, 'round')}<b>${esc(first(c.name))}</b><small>${c.rating} ${star} <i>•</i> ${esc(c.sport)}</small></button>`;
const catRow = () => `<div class="cats">${CATEGORIES.map(c => `<button type="button" data-cat="${c.id}">${pic(c.id)}<span>${c.name}</span></button>`).join('')}</div>`;

function promos(coaches) {
  const fit = coaches.filter(c => c.open > 0).length;
  const slides = [
    ['white', 'Verified Coaches', 'Credentials checked,<br>or marked self-reported.', 'shield', 'data-go="coachlist"'],
    ['yellow', S.window === 'any' ? 'When Are You Free?' : `Fits Your ${WIN[S.window][0].toUpperCase() + WIN[S.window].slice(1)}`, S.window === 'any' ? 'Say it once.<br>Every list ranks by open slots.' : `${fit} of ${coaches.length} coach${coaches.length === 1 ? ' has' : 'es have'}<br>open slots in your window.`, 'hourglass', 'data-sheet="filter"'],
    ['red', 'First Session Free', 'Every coach starts<br>with an assessment.', 'whistle', 'data-go="coachlist"'],
  ];
  return `<div class="promo" id="promo">${slides.map(([c, t, s, i, a]) => `<button type="button" class="pcard ${c}" ${a}><span><b>${t}</b><small>${s}</small></span>${ic(i, 'pico')}</button>`).join('')}</div>
  <div class="dots" aria-hidden="true"><i></i><i class="on"></i><i></i></div>`;
}
const SEAT = [0, 1, -1, 2, -2, 3, -3];
function deck(coaches) {
  if (!coaches.length) return '<p class="empty">No coaches match. Try another category.</p>';
  const a = Math.min(S.deck, coaches.length - 1);
  return `<div class="deck" id="deck">${coaches.map((c, i) => `<article class="cc p${Math.max(-2, Math.min(2, SEAT[i] - SEAT[a]))}${i === a ? ' cur' : ''}" data-deck="${i}" data-seat="${SEAT[i]}" data-id="${c.id}" style="--tint:${c.tint}" tabindex="0" aria-label="${esc(c.name)}">
    ${c.img ? `<span class="cc-img" style="background-image:url(${c.img})"></span>` : `<span class="cc-img none"><b>${initials(c.name)}</b></span>`}
    <button type="button" class="rb frost" data-thread="c:${c.id}" aria-label="Chat with ${esc(first(c.name))}">${ic('chat')}</button>${heart('c:' + c.id, 'rb frost r')}
    <span class="cc-cap"><b>${esc(c.name)}</b><small>${esc(c.focus)}</small><small>${c.rating} ${star} <i>•</i> ${c.km} kms away</small><span class="cc-tags">${why(c.open)}${trustTag(c)}</span></span></article>`).join('')}</div>`;
}

/* ---------- views ---------- */
const VIEWS = {
  home() {
    const coaches = rankedCoaches(), venues = rankedVenues();
    if (S.q.trim()) return `${topbar(true)}${search('Search for Coaches, Venues')}${freeline()}
      ${head('Coaches')}<div class="stack">${coaches.map(coachCard).join('') || '<p class="empty">No coaches match that search.</p>'}</div>
      ${head('Venues')}<div class="stack">${venues.map(venueCard).join('') || '<p class="empty">No venues match that search.</p>'}</div>`;
    return `${topbar(true)}${search('Search for Coaches, Venues')}${freeline()}
    <button type="button" class="big yellow" data-tab="coaches"><span><b>Book a Coach</b><small>Find your best Coach to<br>get trained</small></span><img src="assets/coach-cut.webp" alt="" width="104" height="126"></button>
    <button type="button" class="big lavc" data-tab="venuehome"><span><b>Book a Venue</b><small>Find your best Venue to<br>train at</small></span>${stadiumArt}</button>
    ${head('Athletic Events', 'data-tab="events"')}${catRow()}
    ${head('Recommended Packages', 'data-go="coachlist"')}
    <div class="rail">${coaches.slice(0, 4).map(c => { const v = venueById(c.venue); return `<button type="button" class="pack" data-coach="${c.id}"><span class="pk">${photo(c, 'round')}${photo(v, 'round')}</span><b>${esc(first(c.name))} + ${esc(v.name)}</b><small>${c.rating} ${star} <i>•</i> ${v.km} kms away</small>${why(c.open)}</button>`; }).join('')}</div>`;
  },
  coaches() {
    const coaches = rankedCoaches();
    const sports = SPORTS.filter(s => COACHES.some(c => c.sport === s));
    return `${topbar()}${search('Search for Coaches')}${freeline()}
    ${head('Category', 'data-go="coachlist"')}
    <div class="chips"><button type="button" data-sport="" class="${!S.sport ? 'on' : ''}">All</button>${sports.map(s => `<button type="button" data-sport="${s}" class="${S.sport === s ? 'on' : ''}">${s}</button>`).join('')}</div>
    ${promos(coaches)}
    ${head('Top Coaches', 'data-go="coachlist"')}${deck(coaches)}`;
  },
  coachlist() {
    const list = rankedCoaches();
    return `<header class="bar">${backBtn}${search('Search for Coaches')}</header>
    <div class="h tight"><h2>Coaches</h2><button type="button" class="btn sm" data-sheet="filter">${ic('filter')}Filter</button></div>
    <p class="note">Ranked by ${S.window === 'any' ? 'trust score' : `open slots in your ${WIN[S.window]}, then trust score`}.</p>
    <div class="stack">${list.map(coachCard).join('') || '<p class="empty">No coaches match.</p>'}</div>`;
  },
  coach(id) {
    const c = oneCoach(id), v = oneVenue(c.venue), p = trustParts(c);
    const dn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `<header class="bar">${backBtn}<div class="ttl"><b>${esc(c.name)}</b><small>${esc(c.focus)} <i>•</i> ${esc(v.area)}</small></div>
      <button type="button" class="rb ghost" data-thread="c:${c.id}" aria-label="Chat">${ic('chat')}</button>${heart('c:' + c.id)}</header>
    <div class="hero ${c.img ? (c.id === 'albert' ? 'inset' : '') : 'none'}" style="--tint:${c.tint}">${c.img ? `<img src="${c.img}" alt="">` : `<b>${initials(c.name)}</b>`}</div>
    <section class="glass" style="--glow:${c.tint}"><span class="pill lav">${esc(c.sport)}</span>
      <div class="stats four"><div><small>Experience</small><b>${c.years}+</b></div><div><small>Ratings</small><b>${c.rating} ${star}</b></div><div><small>Reviews</small><b>${c.reviews}</b></div>
      <button type="button" data-sheet="trust:${c.id}" aria-label="Trust score ${c.trust} of 100, see what is verified"><small>Trust ${ic('info')}</small><b>${c.trust}</b></button></div></section>
    <section class="glass" style="--glow:${c.tint}"><span class="pill">Who I am</span><p>${esc(c.bio)}</p></section>
    <section class="glass" style="--glow:${c.tint}"><span class="pill">Trust score</span>
      <button type="button" class="trustrow" data-sheet="trust:${c.id}"><span class="ring" style="--p:${c.trust}"><b>${c.trust}</b></span>
      <span><b>${p.verified} of ${c.creds.length} credentials verified</b><small>${p.selfReported ? `${p.selfReported} self-reported, counted against the score.` : 'Nothing self-reported.'} See what is verified ${ic('chev')}</small></span></button></section>
    <section class="glass" style="--glow:${c.tint}"><span class="pill">Availability</span>
      <p>${c.windows.days.map(d => dn[d]).join(', ')} <i>•</i> ${c.windows.hours.map(fmtHour).join(', ')}</p>${why(c.open, 'center')}</section>
    ${head('Reviews')}<div class="pad"><div class="rev"><p>“Clear plan from the first session, and the timings worked around my week.”</p><small>Sample review</small></div></div>
    ${head('Trains at')}<div class="stack">${venueCard(v)}</div>
    <div class="buy"><div><small>Price</small><b>${inr(c.fee)}</b><i>/ session</i></div><button type="button" class="btn lg" data-book="${c.id}">Book Now</button></div>`;
  },
  slots({ venue, coach }) {
    const v = venueById(venue), c = coach ? coachById(coach) : null, days = [...Array(7)].map((_, i) => addDays(today(), i));
    const d = days[S.day], busy = new Set([...seedBusy(v, d), ...S.booked]);
    const all = slots(v, d, busy, new Date());
    const cell = s => { const off = c && !coachWorks(c, d.getDay(), s.hour), f = S.window !== 'any' && fits(S.window, d.getDay(), s.hour) && !off;
      return `<button type="button" data-slot="${s.key}" ${s.taken || s.past || off ? 'disabled' : ''} class="${S.pick === s.key ? 'on' : ''}${f ? ' f' : ''}${off ? ' off' : ''}">${s.label}</button>`; };
    return `<header class="bar">${backBtn}<div class="ttl"><b>Slot Booking</b><small>${c ? `${esc(c.name)} <i>•</i> ` : ''}${esc(v.name)}</small></div></header>
    <div class="pad"><h3>${d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h3>
    <div class="days">${days.map((x, i) => `<button type="button" data-day="${i}" class="${i === S.day ? 'on' : ''}"><small>${x.toLocaleDateString('en-IN', { weekday: 'short' })}</small><b>${x.getDate()}</b></button>`).join('')}</div>
    <h3>When are you free?</h3><div class="chips wrap">${Object.entries(WINDOWS).map(([k, w]) => `<button type="button" data-window="${k}" class="${S.window === k ? 'on' : ''}">${w.label}</button>`).join('')}</div>
    <div class="legend"><span><i class="lgd fitc"></i>Fits you</span><span><i class="lgd"></i>Open</span><span><i class="lgd tk"></i>Taken${c ? ' or coach off' : ''}</span></div>
    <div class="grid">${all.map(cell).join('')}</div></div>
    <div class="buy"><div><small>${S.pick ? d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : '60 minute slot'}</small><b>${S.pick ? fmtHour(+S.pick.slice(-2)) : 'Pick a time'}</b></div><button type="button" class="btn lg" data-review ${S.pick ? '' : 'disabled'}>Continue</button></div>`;
  },
  review() {
    const f = S.flow, b = bill(f);
    return `<header class="bar">${backBtn}<div class="ttl"><b>Review Booking</b></div></header>
    <div class="pad"><h3>Booking Details</h3>${detailCard(f)}<hr>
    <h3>Bill Details</h3><dl class="bill">${b.coach ? `<div><dt>Coach Fee</dt><dd>${inr(b.coach)}</dd></div>` : ''}<div><dt>Venue Slot Fee</dt><dd>${inr(b.venue)}</dd></div><div><dt>Service Fee</dt><dd>${inr(b.service)}</dd></div></dl>
    <hr class="dash"><dl class="bill"><div><dt>Total</dt><dd>${inr(b.total)}</dd></div></dl><hr>
    <h3>Refund Policy</h3><p class="grey">Cancellations made at least 48 hours prior to the scheduled session are eligible for a full refund. Refunds for late cancellations or no-shows are subject to the coach or venue's specific policy.</p>
    <h3>Cancellation Policy</h3><p class="grey"><b>Personal Coach Booking:</b> Cancellations must be made at least 24 hours in advance to receive a full refund.</p>
    <p class="grey fineprint">Sample prices and policies. Nothing is charged in this prototype.</p></div>
    <div class="buy"><div><small>Total</small><b>${inr(b.total)}</b></div><button type="button" class="btn lg" data-go="pay">Pay Now</button></div>`;
  },
  pay() {
    const b = bill(S.flow);
    const row = (k, icon, name, sub = '', radio = true) => `<button type="button" class="payrow${S.pay === k ? ' on' : ''}" data-pay="${k}">${ic(icon)}<span><b>${name}</b>${sub ? `<small>${sub}</small>` : ''}</span>${radio ? '<i class="radio"></i>' : ''}</button>`;
    return `<header class="bar">${backBtn}<div class="ttl"><b>Payment Options</b><small>${inr(b.total)}</small></div></header>
    <div class="pad"><h3>Recently Used</h3>${row('recent', 'wallet', 'UPI app')}
    <h3>UPI</h3>${row('upi1', 'wallet', 'UPI app')}${row('upi2', 'upi', 'Second UPI app')}${row('upinew', 'plus', 'Add New UPI ID', 'You need to have a registered UPI ID')}
    <h3>Credit &amp; Debit cards</h3>${row('card', 'card', 'Add New Card', 'Save and pay via cards.')}
    <h3>More Options</h3>${row('bank', 'bank', 'Net Banking')}
    <p class="grey fineprint">Simulated payment. No money moves, the slot is still booked for real in this prototype.</p></div>
    <div class="buy"><div><small>Total</small><b>${inr(b.total)}</b></div><button type="button" class="btn lg" data-confirm>Confirm</button></div>`;
  },
  done(bk) {
    return `<header class="bar"><div class="ttl"><b>Booked Successfully</b></div></header>
    <div class="pad"><h3>Booking Details</h3>${detailCard(bk)}
    <div class="okart"><span class="okring">${ic('check')}</span><i></i><i></i><i></i><i></i></div>
    <p class="center"><b class="ref">${bk.ref}</b></p><p class="grey center">Your slot is held. You will find it under your bookings.</p>
    <div class="row2"><button type="button" class="btn" data-go="bookings">View bookings</button><button type="button" class="rb lav" data-tab="home" aria-label="Done">${ic('check')}</button></div></div>`;
  },
  venuehome() {
    const venues = rankedVenues();
    const choice = rankedCoaches().filter((c, i, a) => a.findIndex(x => x.venue === c.venue) === i).map(c => [venues.find(v => v.id === c.venue), c]).filter(([v]) => v);
    return `${topbar()}${search('Search for Venues')}${freeline()}
    ${head('Spotlight', 'data-go="venues"')}<div class="rail">${venues.map(v => spotCard(v)).join('') || '<p class="empty">No venues match. Try another sport.</p>'}</div>
    <div class="band">${head('Coach Choice', 'data-go="venues"')}<div class="rail">${choice.map(([v, c]) => spotCard(v, c)).join('') || '<p class="empty">No venues match.</p>'}</div></div>
    ${head('Athletic Events', 'data-tab="events"')}${catRow()}`;
  },
  venues() {
    const venues = rankedVenues();
    return `<header class="bar">${backBtn}${search('Search for Venues')}</header>
    <div class="h tight"><h2>Venues</h2><button type="button" class="btn sm" data-sheet="filter">${ic('filter')}Filter</button></div>
    <p class="note">Ranked by open slots ${inYour()}, then rating, then distance.</p>
    <div class="stack">${venues.map(venueCard).join('') || '<p class="empty">No venues match.</p>'}</div>`;
  },
  venue(id) {
    const v = oneVenue(id), coaches = rankedCoaches({ sport: null, q: '' }).filter(c => c.venue === id);
    return `<header class="bar">${backBtn}<div class="ttl"><b>${esc(v.name)}</b><small>${esc(v.area)}, Chennai</small></div>
      <button type="button" class="rb ghost" data-thread="v:${v.id}" aria-label="Chat">${ic('chat')}</button>${heart('v:' + v.id)}</header>
    <div class="hero ${v.img ? '' : 'none'}" style="--tint:#363648">${v.img ? `<img src="${v.img}" alt="">` : pic(v.sports[0] === 'Swimming' ? 'swimming' : 'field')}</div>
    <section class="glass first" style="--glow:#6F6BD0"><div class="stats"><div><small>Location</small><b>${esc(v.area)}</b></div><div><small>Ratings</small><b>${v.rating} ${star}</b></div><div><small>Reviews</small><b>${v.reviews}</b></div></div></section>
    <section class="glass" style="--glow:#6F6BD0"><span class="pill">Address</span><p>${esc(v.address)} <i>•</i> ${v.km} kms away</p>
      <div class="center"><a class="btn sm" href="${directions(v)}" target="_blank" rel="noopener">Get Directions</a></div></section>
    <section class="glass" style="--glow:#6F6BD0"><span class="pill">About</span><p>${v.sports.join(', ')} <i>•</i> open ${fmtHour(venueById(id).open)} to ${fmtHour(v.close)}</p><div class="amen">${v.amenities.map(a => `<span>${esc(a)}</span>`).join('')}</div>${why(v.open, 'center')}</section>
    ${coaches.length ? `${head('Coaches here')}<div class="rail">${coaches.map(miniCoach).join('')}</div>` : ''}
    ${head('Reviews')}<div class="pad"><div class="rev"><p>“Track surface is excellent and the morning slots are rarely crowded.”</p><small>Sample review</small></div></div>
    <div class="buy"><div><small>Price</small><b>${inr(v.price)}</b><i>/ ${v.per}</i></div><button type="button" class="btn lg" data-slots="${v.id}">Book Now</button></div>`;
  },
  events() {
    return `<header class="bar plain"><h1>Events</h1><span class="top-r">${me()}</span></header>
    <div class="stack">${CATEGORIES.map(c => { const n = c.id === 'track' ? EVENTS.length : 0; return `<button type="button" class="catcard" data-cat="${c.id}" style="--c:${c.color}">${pic(c.id)}<span><b>${c.title}</b><small>${n ? `${n} meets near ${HOME.area}` : 'No meets listed yet'}</small></span></button>`; }).join('')}</div>`;
  },
  eventlist(cat) {
    const c = CATEGORIES.find(x => x.id === cat), needle = S.eq.trim().toLowerCase();
    const list = (cat === 'track' ? EVENTS : []).filter(e => !needle || (e.name + ' ' + e.dist).toLowerCase().includes(needle)).filter(e => !S.onlyMine || S.registered.has(e.id));
    return `<header class="bar">${backBtn}${search('Search for Events', 'eq', S.eq)}</header>
    <div class="h tight"><h2>${c.title}</h2><div class="chips mini"><button type="button" data-mine="0" class="${S.onlyMine ? '' : 'on'}">All</button><button type="button" data-mine="1" class="${S.onlyMine ? 'on' : ''}">Registered</button></div></div>
    <div class="tiles">${list.map(e => `<button type="button" class="tile" data-event="${e.id}" style="background-image:url(${e.img})"><b>${e.dist}<i>${e.unit === 'mh' ? 'm Hurdles' : 'mtr'}</i></b>${S.registered.has(e.id) ? `<em>${ic('check')}</em>` : ''}</button>`).join('')}</div>
    ${list.length ? '' : `<div class="emptybig"><b>${S.onlyMine ? 'Nothing registered yet' : 'No meets listed yet'}</b><p>${cat === 'track' ? 'Try another search.' : 'The sample data only has track meets.'}</p></div>`}`;
  },
  event(id) {
    const e = EVENTS.find(x => x.id === id), r = S.registered.has(id), v = venueById(e.venue);
    const coaches = rankedCoaches({ sport: 'Athletics', q: '' }).concat(rankedCoaches({ sport: null, q: '' }).filter(c => c.sport !== 'Athletics')).slice(0, 4);
    const venues = rankedVenues({ sport: 'Athletics', q: '' }).sort((a, b) => (b.id === e.venue) - (a.id === e.venue));
    return `<div class="evhero" style="background-image:url(${v.img})"><header class="bar">${backBtn}<span class="grow"></span>${heart('e:' + id)}</header><b>${e.dist}<i>${e.unit === 'mh' ? 'm Hurdles' : 'mtr'}</i></b></div>
    <div class="pad"><h3>${esc(e.name)}</h3><p class="grey">${e.unit === 'mh' ? `${e.dist} metres hurdles` : `${e.dist} metres`} at ${esc(v.name)}, in ${e.inDays} days. Entry ${inr(e.fee)}, ${e.spots - (r ? 1 : 0)} spots left. Coaches and venues below are ranked for this event and ${S.window === 'any' ? 'your week' : `your ${WIN[S.window]}`}.</p></div>
    ${head('Recommended Coaches', 'data-go="coachlist"')}<div class="rail">${coaches.map(miniCoach).join('')}</div>
    ${head('Recommended Venues', 'data-go="venues"')}<div class="rail">${venues.map(v => spotCard(v)).join('')}</div>
    <div class="buy"><div><small>Entry</small><b>${inr(e.fee)}</b></div><button type="button" class="btn lg${r ? ' off' : ''}" data-reg="${e.id}">${r ? 'Registered' : 'Register'}</button></div>`;
  },
  chat() {
    const rows = S.seg === 'coaches' ? COACHES.map(c => ['c:' + c.id, c, c.name]) : VENUES.map(v => ['v:' + v.id, v, v.name]);
    return `<header class="bar plain"><h1>Chats</h1><span class="top-r"><button type="button" class="rb lav" data-toast="Search across chats is not part of this prototype." aria-label="Search chats">${ic('search')}</button>${me()}</span></header>
    <div class="seg"><button type="button" data-seg="coaches" class="${S.seg === 'coaches' ? 'on' : ''}">Coaches</button><button type="button" data-seg="venues" class="${S.seg === 'venues' ? 'on' : ''}">Venues</button></div>
    <div class="threads">${rows.map(([k, o, name]) => { const t = thread(k), last = t[t.length - 1], unread = !S.read.has(k); return `<button type="button" data-thread="${k}">${photo(o, 'round')}<span><b>${esc(name)}</b><small>${esc(last.t)}</small></span><em>${t.length > 1 ? 'now' : 'new'}${unread ? '<i>1</i>' : ''}</em></button>`; }).join('')}</div>`;
  },
  thread(k) {
    const o = party(k), t = thread(k);
    return `<header class="thead"><button type="button" class="plainb" data-back aria-label="Back">${ic('back')}</button>${photo(o, 'round')}<div><b>${esc(o.name)}</b><small>Simulated replies</small></div>
      <button type="button" class="plainb" data-toast="Replies are rule based and run in your browser. No one is on the other end." aria-label="About this chat">${ic('info')}</button></header>
    <div class="msgs">${t.map(m => `<p class="m ${m.me ? 'me' : ''}">${esc(m.t)}</p>`).join('')}</div>
    <form class="compose" data-send="${k}">${ic('plus')}<input name="t" placeholder="Message..." autocomplete="off" required><button aria-label="Send">${ic('send')}</button></form>`;
  },
  profile() {
    return `<header class="bar">${backBtn}<div class="ttl"><b>Athlevo ID</b></div><button type="button" class="rb lav" data-sheet="filter" aria-label="Schedule and filters">${ic('settings')}</button></header>
    <div class="pad center"><span class="avatar xl">${initials(ME.name)}<i>${ic('edit')}</i></span><h2 class="name">${ME.name}</h2><p class="grey">${ME.handle}</p>
    <p class="counts"><b>${S.bookings.length}</b> Slots <i>•</i> <b>${S.registered.size}</b> Events <i>•</i> <b>${S.favs.size}</b> Saved</p>
    <div class="row2"><button type="button" class="rb lav" data-toast="Sharing is not part of this prototype." aria-label="Share profile">${ic('send')}</button><button type="button" class="btn" data-toast="Sample profile. Editing is not part of this prototype.">${ic('edit')}Edit Profile</button></div></div>
    <div class="stack rows"><div><span>Sport</span><b>${ME.sport}</b></div><div><span>Skill Level</span><b>${ME.level}</b></div>
    <button type="button" data-sheet="filter"><span>Free Window</span><b>${WINDOWS[S.window].label} ${ic('chev')}</b></button>
    <button type="button" data-go="bookings"><span>Slot Booked</span><b>${S.bookings.length} ${ic('chev')}</b></button></div>
    <p class="note center">Sample profile. Bookings and your free window are saved on this device.</p>`;
  },
  bookings() {
    const up = S.bookings.slice().reverse(), ev = [...S.registered].map(id => EVENTS.find(x => x.id === id));
    return `<header class="bar">${backBtn}<div class="ttl"><b>My Bookings</b></div></header>
    <div class="seg"><button type="button" data-bseg="slots" class="${S.bseg === 'slots' ? 'on' : ''}">Slots</button><button type="button" data-bseg="events" class="${S.bseg === 'events' ? 'on' : ''}">Events</button></div>
    <div class="stack">${S.bseg === 'slots'
      ? (up.map(b => `<div class="bk"><span class="chipdate">${esc(b.month || 'Booked')}</span><b>${b.coach ? esc(first(coachById(b.coach).name)) + ' <i>•</i> ' : ''}${esc(venueById(b.venue).name)}</b><small>${esc(b.when)}</small><small class="ref">${b.ref}</small><button type="button" class="btn sm" data-slots="${b.venue}"${b.coach ? ` data-coachctx="${b.coach}"` : ''}>Rebook</button></div>`).join('') || `<div class="emptybig"><b>No bookings yet</b><p>Find a coach or venue that fits your schedule and grab a slot.</p><button type="button" class="btn" data-tab="coaches">Browse coaches</button></div>`)
      : (ev.map(e => `<div class="bk"><span class="chipdate">in ${e.inDays} days</span><b>${esc(e.name)}</b><small>${esc(venueById(e.venue).name)}</small><button type="button" class="btn sm" data-event="${e.id}">View</button></div>`).join('') || `<div class="emptybig"><b>No events yet</b><p>Register for a meet and it shows up here.</p><button type="button" class="btn" data-tab="events">Browse events</button></div>`)}</div>`;
  },
};

/* ---------- booking flow helpers ---------- */
function bill(f) {
  const v = venueById(f.venue), c = f.coach ? coachById(f.coach) : null;
  const coach = c ? c.fee : 0, venue = v.price, service = Math.round((coach + venue) * SERVICE_RATE * 100) / 100;
  return { coach, venue, service, total: Math.round((coach + venue + service) * 100) / 100 };
}
function detailCard(f) {
  const v = venueById(f.venue), c = f.coach ? coachById(f.coach) : null;
  return `<div class="detail">${c ? `<b>${esc(c.name)}</b><small>Per session <i>•</i> ${esc(c.focus)}</small>` : ''}<b>${esc(v.name)}</b><small>${esc(f.when)}${c ? '' : ` <i>•</i> per ${v.per}`}</small></div>`;
}

/* ---------- chat: rule based replies that read the same slot engine ---------- */
const party = k => k[0] === 'c' ? coachById(k.slice(2)) : venueById(k.slice(2));
function thread(k) {
  if (S.chats[k]) return S.chats[k];
  const o = party(k);
  return [{ me: false, t: k[0] === 'c' ? `Hi! I'm ${first(o.name)}. What are you training for?` : `Hi, this is ${o.name}. Ask us about open slots, price or directions.` }];
}
function reply(k, text) {
  const o = party(k), w = /weekend|saturday|sunday/i.test(text) ? 'weekend' : /morning/i.test(text) ? 'morning' : /evening|after work/i.test(text) ? 'evening' : S.window;
  const span = w === 'any' ? 'this week' : `on ${WIN[w]}`;
  const price = /price|fee|cost|how much/i.test(text), when = /when|time|slot|free|available|weekend|morning|evening/i.test(text);
  if (k[0] === 'c') {
    const v = venueById(o.venue), n = coachOpenSlots(o, v, w, today(), S.booked);
    if (price) return `It's ${inr(o.fee)} a session. First one is a free assessment.`;
    if (when) return n ? `I have ${n} open slot${n === 1 ? '' : 's'} ${span} at ${v.name}. Book one and I'll confirm.` : `Nothing open ${span}. I coach at ${o.windows.hours.map(fmtHour).slice(0, 3).join(', ')}.`;
    return `Great. Book a slot at ${v.name} and we'll start with an assessment.`;
  }
  const n = openInWindow(o, w, today(), S.booked);
  if (price) return `It's ${inr(o.price)} per ${o.per}.`;
  if (/where|address|direction|reach/i.test(text)) return `We are at ${o.address}, ${o.km} kms from ${HOME.area}.`;
  if (when) return n ? `Yes, ${n} slot${n === 1 ? ' is' : 's are'} open ${span}. We are open ${fmtHour(o.open)} to ${fmtHour(o.close)}.` : `Sorry, nothing is open ${span}.`;
  return `Thanks for writing. You can book a slot from our page, or ask about slots, price or directions.`;
}

/* ---------- sheets ---------- */
function openSheet(name) {
  const [kind, id] = name.split(':'), el = $('#sheet');
  S.sheet = name;
  if (kind === 'filter') {
    el.innerHTML = `<div class="sheet" role="dialog" aria-label="Filter"><i class="grab"></i><div class="sh-h"><b>Filter</b><button type="button" class="rb ghost sm" data-close aria-label="Close">${ic('close')}</button></div>
    <h3>When are you free?</h3><p class="grey">Say it once. Coaches and venues are ranked by open slots in that window, and the slot grid highlights the times that fit.</p>
    <div class="opts">${Object.entries(WINDOWS).map(([k, w]) => `<button type="button" data-window="${k}" class="${S.window === k ? 'on' : ''}"><b>${w.label}</b><small>${WIN_HINT[k]}</small></button>`).join('')}</div>
    <h3>Sport</h3><div class="chips wrap"><button type="button" data-sport="" class="${!S.sport ? 'on' : ''}">All</button>${SPORTS.map(s => `<button type="button" data-sport="${s}" class="${S.sport === s ? 'on' : ''}">${s}</button>`).join('')}</div>
    <p class="grey fineprint">Order: schedule fit first, then ${S.cur && TAB[S.cur.name] === 'venuehome' ? 'rating and distance' : 'trust score for coaches, rating and distance for venues'}. Fixed rules, no model.</p>
    <button type="button" class="btn lg wide" data-close>Show results</button></div>`;
  } else {
    const c = oneCoach(id), p = trustParts(c), n = v => Math.round(v * 10) / 10;
    const part = (label, how, val, max) => `<div class="tp"><span><b>${label}</b><small>${how}</small></span><em>${val < 0 ? '' : '+'}${n(val)}</em>${max ? `<i style="--p:${Math.max(0, val) / max * 100}"></i>` : ''}</div>`;
    el.innerHTML = `<div class="sheet" role="dialog" aria-label="Trust score"><i class="grab"></i><div class="sh-h"><b>Trust score</b><button type="button" class="rb ghost sm" data-close aria-label="Close">${ic('close')}</button></div>
    <div class="trustrow static"><span class="ring" style="--p:${c.trust}"><b>${c.trust}</b></span><span><b>${esc(c.name)}</b><small>Out of 100, from things you can check. Self-reported claims lower it until Athlevo verifies them.</small></span></div>
    <h3>How it adds up</h3>
    ${part('Verified credentials', `${p.verified} × 15, up to 40`, p.creds, 40)}${part('Years coaching', `${c.years} × 2, up to 20`, p.years, 20)}${part('Rating', `${c.rating} stars, up to 20`, p.rating, 20)}${part('Sessions delivered', `${c.sessions} sessions, up to 20`, p.sessions, 20)}${part('Self-reported claims', `${p.selfReported} × 3 taken off`, -p.penalty, 0)}
    <h3>Credentials</h3><ul class="creds">${c.creds.map(x => `<li class="${x.verified ? 'v' : 'u'}">${ic(x.verified ? 'shield' : 'shieldq')}<span><b>${esc(x.t)}</b><small>${x.verified ? 'Verified by Athlevo' : 'Self-reported'}</small></span></li>`).join('')}</ul>
    <p class="grey fineprint">Sample data. The score is a fixed formula, not a prediction.</p></div>`;
  }
  el.hidden = false; requestAnimationFrame(() => el.classList.add('on'));
}
function closeSheet() { const el = $('#sheet'); if (el.hidden) return; S.sheet = null; el.classList.remove('on'); el.hidden = true; el.innerHTML = ''; }

/* ---------- events ---------- */
document.addEventListener('click', e => {
  if (e.target.id === 'sheet') { closeSheet(); return; }
  const t = e.target.closest('button,a,[data-back],[data-deck],[data-venue],[data-coach]'); if (!t || t.tagName === 'A') return;
  const d = t.dataset;
  if ('close' in d) { closeSheet(); return; }
  if ('back' in d) { const p = S.stack.pop(); if (p) go(p.name, p.arg, false); else go('home', undefined, false); return; }
  if (d.toast) { toast(d.toast); return; }
  if (d.fav) { S.favs.has(d.fav) ? S.favs.delete(d.fav) : S.favs.add(d.fav); save(); rerender(); return; }
  if (d.thread) { S.read.add(d.thread); save(); go('thread', d.thread); const m = $('.msgs'); m.scrollTop = m.scrollHeight; return; }
  if (d.sheet) { openSheet(d.sheet); return; }
  if (d.window) { S.window = d.window; S.pick = null; save(); const sh = S.sheet; rerender(); if (sh) openSheet(sh); return; }
  if (d.sport !== undefined) { S.sport = d.sport || null; S.deck = 0; const sh = S.sheet; rerender(); if (sh) openSheet(sh); return; }
  if (d.tab) { S.stack = []; S.cur = null; S.pick = null; S.q = ''; go(d.tab); return; }
  if (d.go) { go(d.go); return; }
  if (d.cat) { S.eq = ''; S.onlyMine = false; go('eventlist', d.cat); return; }
  if (d.mine) { S.onlyMine = d.mine === '1'; rerender(); return; }
  if (d.event) { go('event', d.event); return; }
  if (d.seg) { S.seg = d.seg; rerender(); return; }
  if (d.bseg) { S.bseg = d.bseg; rerender(); return; }
  if (d.pay) { S.pay = d.pay; rerender(); return; }
  if (d.book) { const c = coachById(d.book); S.day = 0; S.pick = null; go('slots', { venue: c.venue, coach: c.id }); return; }
  if (d.slots) { S.day = 0; S.pick = null; go('slots', { venue: d.slots, coach: d.coachctx || null }); return; }
  if (d.day) { S.day = +d.day; S.pick = null; rerender(); return; }
  if (d.slot) { S.pick = d.slot; rerender(); return; }
  if ('review' in d) {
    const a = S.cur.arg, day = addDays(today(), S.day), hour = +S.pick.slice(-2);
    S.flow = { ...a, day: S.day, pick: S.pick, month: day.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }), when: `${day.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} • ${fmtHour(hour)} to ${fmtHour(hour + 1)}` };
    go('review'); return;
  }
  if ('confirm' in d) {
    const f = S.flow, v = venueById(f.venue), day = addDays(today(), f.day);
    const slot = slots(v, day, new Set([...seedBusy(v, day), ...S.booked]), new Date()).find(s => s.key === f.pick);
    const r = book(S.booked, v, slot);
    if (!r.ok) { toast(r.reason); return; }
    S.booked = r.booked;
    const bk = { venue: v.id, coach: f.coach || null, when: f.when, month: f.month, ref: r.ref };
    S.bookings.push(bk); S.pick = null; S.flow = null; save(); S.stack = []; S.cur = null; go('done', bk); return;
  }
  if (d.reg) { S.registered.has(d.reg) ? S.registered.delete(d.reg) : S.registered.add(d.reg); save(); rerender(); toast(S.registered.has(d.reg) ? 'You are in. See it under your bookings.' : 'Registration cancelled'); return; }
  if (d.deck !== undefined) { if (+d.deck === S.deck) go('coach', d.id); else { S.deck = +d.deck; rerender(); } return; }
  if (d.venue) { go('venue', d.venue); return; }
  if (d.coach) { go('coach', d.coach); return; }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSheet();
  const c = e.target.closest && e.target.closest('[data-deck]');
  if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); c.click(); }
});
document.addEventListener('input', e => {
  const id = e.target.id; if (id !== 'q' && id !== 'eq') return;
  S[id] = e.target.value; const pos = e.target.selectionStart; S.deck = 0; rerender();
  const q = $('#' + id); q.focus(); q.setSelectionRange(pos, pos);
});
document.addEventListener('submit', e => {
  const f = e.target.closest('[data-send]'); if (!f) return; e.preventDefault();
  const k = f.dataset.send, text = new FormData(f).get('t').trim(); if (!text) return;
  const t = (S.chats[k] ||= thread(k).slice());
  t.push({ me: true, t: text }); t.push({ me: false, t: reply(k, text) });
  save(); rerender(); const m = $('.msgs'); if (m) m.scrollTop = m.scrollHeight; const i = $('.compose input'); if (i) i.focus();
});
// Swipe the Top Coaches deck.
let sx = null;
document.addEventListener('pointerdown', e => { sx = e.target.closest('#deck') ? e.clientX : null; });
document.addEventListener('pointerup', e => {
  if (sx === null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) < 36) return;
  const want = SEAT[S.deck] + (dx < 0 ? 1 : -1), el = document.querySelector(`#deck .cc[data-seat="${want}"]`);
  if (el) { S.deck = +el.dataset.deck; S.swiped = Date.now(); rerender(); }
});
document.addEventListener('click', e => { if (S.swiped && Date.now() - S.swiped < 350 && e.target.closest('#deck')) e.stopImmediatePropagation(); }, true);

go('home');
// Deep link for screenshots and sharing: #coach/albert, #venue/pulse, #coaches ...
const h = location.hash.slice(1).split('/');
if (VIEWS[h[0]] && ['home', 'events', 'coaches', 'venuehome', 'chat', 'coach', 'venue', 'event', 'eventlist', 'venues', 'coachlist', 'profile', 'bookings'].includes(h[0])) go(h[0], h[1]);
