// Sample data for the prototype. Names, venues, addresses, reviews and prices are illustrative, not real businesses.
// Photos are crops from the Athlevo case study boards; anything without a sharp source uses a drawn placeholder.
export const HOME = { area: 'Navalur', lat: 12.8452, lng: 80.2266 };

export const SPORTS = ['Athletics', 'Fitness', 'Football', 'Badminton', 'Swimming', 'Cricket'];

// open/close in 24h hours, slot length 60 min; booked = "YYYY-MM-DD HH" keys created at runtime
export const VENUES = [
  { id: 'pulse', address: 'Old Mahabalipuram Road, Navalur', name: 'Pulse Sports Hub', area: 'Navalur', km: 1.2, sports: ['Athletics', 'Football'], rating: 4.8, reviews: 214, price: 500, per: 'month', open: 5, close: 21, img: 'assets/pulse.webp', amenities: ['400m synthetic track', 'Floodlights', 'Changing rooms', 'Parking'] },
  { id: 'irongrid', address: 'Rajiv Gandhi Salai, Sholinganallur', name: 'Iron Grid Fitness', area: 'Sholinganallur', km: 4.6, sports: ['Fitness'], rating: 4.6, reviews: 388, price: 1200, per: 'month', open: 6, close: 23, img: 'assets/irongrid.webp', amenities: ['Free weights', 'Strength coaching', 'Showers', 'Lockers'] },
  { id: 'velocity', address: 'SIPCOT main road, Siruseri', name: 'Velocity Track Arena', area: 'Siruseri', km: 7.9, sports: ['Athletics'], rating: 4.7, reviews: 142, price: 150, per: 'session', open: 5, close: 10, img: 'assets/velocity.webp', amenities: ['Starting blocks', 'Timing gates', 'Hurdles'] },
  { id: 'shuttle', address: 'Kovalam link road, Kelambakkam', name: 'Shuttle Court Co.', area: 'Kelambakkam', km: 9.3, sports: ['Badminton'], rating: 4.4, reviews: 96, price: 300, per: 'hour', open: 6, close: 22, img: null, amenities: ['4 wooden courts', 'Racket rental', 'AC hall'] },
  { id: 'bluelane', address: 'Old Mahabalipuram Road, Padur', name: 'Blue Lane Aquatics', area: 'Padur', km: 5.8, sports: ['Swimming'], rating: 4.5, reviews: 171, price: 2000, per: 'month', open: 6, close: 20, img: null, amenities: ['25m pool', 'Lifeguards', 'Coaching lanes'] },
];

// windows: days (0=Sun) and hours when the coach is available
export const COACHES = [
  { id: 'albert', img: 'assets/albert.webp', tint: '#EB7528', reviews: 186, bio: 'I am a sprint coach who works on starts, drive phase and race rhythm, from first blocks session to race day.', name: 'Albert Joseph', sport: 'Athletics', focus: 'Sprints and starts', years: 11, rating: 4.9, sessions: 620, fee: 800, venue: 'pulse',
    creds: [{ t: 'World Athletics CECS Level 2', verified: true }, { t: 'Former state 100m finalist', verified: true }, { t: 'First aid and CPR', verified: true }],
    windows: { days: [1, 2, 3, 4, 5, 6], hours: [5, 6, 7, 17, 18] } },
  { id: 'rajesh', img: 'assets/rajesh.webp', tint: '#3F5873', reviews: 240, bio: 'I build strength and conditioning plans around your sport, with clear progress checks every four weeks.', name: 'Rajesh Kumar', sport: 'Fitness', focus: 'Strength and conditioning', years: 8, rating: 4.8, sessions: 940, fee: 700, venue: 'irongrid',
    creds: [{ t: 'NSCA CSCS', verified: true }, { t: 'B.P.Ed, physical education', verified: true }, { t: 'Nutrition certificate', verified: false }],
    windows: { days: [1, 3, 5, 6], hours: [6, 7, 19, 20, 21] } },
  { id: 'priya', img: null, tint: '#016F68', reviews: 121, bio: 'I teach adults to swim with calm, technique first sessions: breathing, body line and an easy freestyle.', name: 'Priya Raman', sport: 'Swimming', focus: 'Technique for adults', years: 6, rating: 4.9, sessions: 410, fee: 900, venue: 'bluelane',
    creds: [{ t: 'Swimming Federation Level 1', verified: true }, { t: 'Lifeguard certified', verified: true }],
    windows: { days: [0, 6], hours: [7, 8, 9, 16, 17] } },
  { id: 'karthik', img: null, tint: '#582922', reviews: 28, bio: 'Club player sharing footwork drills and doubles rotation for beginners and returning players.', name: 'Karthik S', sport: 'Badminton', focus: 'Footwork and doubles', years: 3, rating: 4.3, sessions: 120, fee: 500, venue: 'shuttle',
    creds: [{ t: 'Club player', verified: false }],
    windows: { days: [2, 4], hours: [19, 20] } },
];

export const EVENTS = [
  { id: 'e100', img: 'assets/ev-100.webp', dist: '100', unit: 'm', name: 'Sprint Series 100m', venue: 'pulse', inDays: 6, fee: 250, spots: 24, color: '#FF7A45' },
  { id: 'e400', img: 'assets/ev-400.webp', dist: '400', unit: 'm', name: 'One Lap Challenge', venue: 'velocity', inDays: 13, fee: 250, spots: 16, color: '#AFB0FF' },
  { id: 'e1500', img: 'assets/ev-1500.webp', dist: '1500', unit: 'm', name: 'Metric Mile Night', venue: 'pulse', inDays: 20, fee: 300, spots: 40, color: '#39C27A' },
  { id: 'e5000', img: 'assets/ev-5000.webp', dist: '5000', unit: 'm', name: 'OMR 5K Community Run', venue: 'velocity', inDays: 27, fee: 400, spots: 120, color: '#FFDE21' },
  { id: 'e110', img: 'assets/ev-110.webp', dist: '110', unit: 'mh', name: 'Hurdles Clinic and Meet', venue: 'velocity', inDays: 34, fee: 350, spots: 12, color: '#FF5C8A' },
];

// Event categories shown on Home and the Events tab. Only Track has sample meets.
export const CATEGORIES = [
  { id: 'track', name: 'Track', title: 'Track Events', color: '#EB7528' },
  { id: 'field', name: 'Field', title: 'Field Events', color: '#AFB0FF' },
  { id: 'swimming', name: 'Swimming', title: 'Swimming', color: '#7CDC89' },
  { id: 'hockey', name: 'Hockey', title: 'Hockey', color: '#FD3F3F' },
  { id: 'cycling', name: 'Cycling', title: 'Cycling', color: '#1D7F97' },
];

// The signed-in athlete is a sample profile.
export const ME = { name: 'Nova Crispin', handle: '@novacrispin', sport: 'Sprinting', level: 'Intermediate' };
