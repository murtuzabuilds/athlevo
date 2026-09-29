// Sample data for the prototype. Names, venues and prices are illustrative, not real businesses.
export const HOME = { area: 'Navalur', lat: 12.8452, lng: 80.2266 };

export const SPORTS = ['Athletics', 'Fitness', 'Football', 'Badminton', 'Swimming', 'Cricket'];

// open/close in 24h hours, slot length 60 min; booked = "YYYY-MM-DD HH" keys created at runtime
export const VENUES = [
  { id: 'pulse', name: 'Pulse Sports Hub', area: 'Navalur', km: 1.2, sports: ['Athletics', 'Football'], rating: 4.8, reviews: 214, price: 500, per: 'month', open: 5, close: 21, img: 'assets/track.webp', amenities: ['400m synthetic track', 'Floodlights', 'Changing rooms', 'Parking'] },
  { id: 'irongrid', name: 'Iron Grid Fitness', area: 'Sholinganallur', km: 4.6, sports: ['Fitness'], rating: 4.6, reviews: 388, price: 1200, per: 'month', open: 6, close: 23, img: 'assets/gym.webp', amenities: ['Free weights', 'Strength coaching', 'Showers', 'Lockers'] },
  { id: 'velocity', name: 'Velocity Track Arena', area: 'Siruseri', km: 7.9, sports: ['Athletics'], rating: 4.7, reviews: 142, price: 150, per: 'session', open: 5, close: 10, img: 'assets/track-lanes.webp', amenities: ['Starting blocks', 'Timing gates', 'Hurdles'] },
  { id: 'shuttle', name: 'Shuttle Court Co.', area: 'Kelambakkam', km: 9.3, sports: ['Badminton'], rating: 4.4, reviews: 96, price: 300, per: 'hour', open: 6, close: 22, img: null, amenities: ['4 wooden courts', 'Racket rental', 'AC hall'] },
  { id: 'bluelane', name: 'Blue Lane Aquatics', area: 'Padur', km: 5.8, sports: ['Swimming'], rating: 4.5, reviews: 171, price: 2000, per: 'month', open: 6, close: 20, img: null, amenities: ['25m pool', 'Lifeguards', 'Coaching lanes'] },
];

// windows: days (0=Sun) and hours when the coach is available
export const COACHES = [
  { id: 'albert', name: 'Albert Joseph', sport: 'Athletics', focus: 'Sprints and starts', years: 11, rating: 4.9, sessions: 620, fee: 800, venue: 'pulse',
    creds: [{ t: 'World Athletics CECS Level 2', verified: true }, { t: 'Former state 100m finalist', verified: true }, { t: 'First aid and CPR', verified: true }],
    windows: { days: [1, 2, 3, 4, 5, 6], hours: [5, 6, 7, 17, 18] } },
  { id: 'rajesh', name: 'Rajesh Kumar', sport: 'Fitness', focus: 'Strength and conditioning', years: 8, rating: 4.8, sessions: 940, fee: 700, venue: 'irongrid',
    creds: [{ t: 'NSCA CSCS', verified: true }, { t: 'B.P.Ed, physical education', verified: true }, { t: 'Nutrition certificate', verified: false }],
    windows: { days: [1, 3, 5, 6], hours: [6, 7, 19, 20, 21] } },
  { id: 'priya', name: 'Priya Raman', sport: 'Swimming', focus: 'Technique for adults', years: 6, rating: 4.9, sessions: 410, fee: 900, venue: 'bluelane',
    creds: [{ t: 'Swimming Federation Level 1', verified: true }, { t: 'Lifeguard certified', verified: true }],
    windows: { days: [0, 6], hours: [7, 8, 9, 16, 17] } },
  { id: 'karthik', name: 'Karthik S', sport: 'Badminton', focus: 'Footwork and doubles', years: 3, rating: 4.3, sessions: 120, fee: 500, venue: 'shuttle',
    creds: [{ t: 'Club player', verified: false }],
    windows: { days: [2, 4], hours: [19, 20] } },
];

export const EVENTS = [
  { id: 'e100', dist: '100', unit: 'm', name: 'Sprint Series 100m', venue: 'pulse', inDays: 6, fee: 250, spots: 24, color: '#FF7A45' },
  { id: 'e400', dist: '400', unit: 'm', name: 'One Lap Challenge', venue: 'velocity', inDays: 13, fee: 250, spots: 16, color: '#AFB0FF' },
  { id: 'e1500', dist: '1500', unit: 'm', name: 'Metric Mile Night', venue: 'pulse', inDays: 20, fee: 300, spots: 40, color: '#39C27A' },
  { id: 'e5000', dist: '5000', unit: 'm', name: 'OMR 5K Community Run', venue: 'velocity', inDays: 27, fee: 400, spots: 120, color: '#FFDE21' },
  { id: 'e110', dist: '110', unit: 'mh', name: 'Hurdles Clinic and Meet', venue: 'velocity', inDays: 34, fee: 350, spots: 12, color: '#FF5C8A' },
];
