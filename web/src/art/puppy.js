// Puppy husky parts, side view, facing right. One character = one pixel
// (see palette.js); '.' is transparent. `anchor` is the joint pixel.
//
// Parts are drawn in this order by rig.js: far legs, tail, torso, near legs,
// head, ears, eyes, mouth. Far-side parts are tinted darker by the rig.

export const PUPPY = {
  // ---------------------------------------------------------------- torso
  torso_stand: {
    anchor: [10, 10],
    rows: [
      '.....KKKKKKKKKK.....',
      '...KKGGGGGGGGGGKK...',
      '..KDDDDDDDDDDDDDDKK.',
      '.KDDDDDDDDDDDDDDDDGK',
      'KDDDDDDDDDDDDDDDDGLK',
      'KGDDDDDDDDDDDDDDGLWK',
      'KGGDDDDDDDDDDDGGLWWK',
      'KLGGGGGGGGGGGGLLWWWK',
      'KWLLLLLLLLLLLLLWWWWK',
      '.KWWWWWWWWWWWWWWWWK.',
      '..KKKKKKKKKKKKKKKK..',
    ],
  },
  torso_sit: {
    anchor: [7, 15],
    rows: [
      '.......KKKKK....',
      '.....KKDDDGLK...',
      '....KDDDDGLWWK..',
      '...KDDDDDGLWWWK.',
      '...KDDDDGLWWWWK.',
      '..KDDDDDGLWWWWK.',
      '..KDDDDGGLWWWWK.',
      '.KDDDDDGLWWWWWK.',
      '.KDDDDGGLWWWWWK.',
      '.KDDDDGLWWWWWWK.',
      'KDDDDGGLWWWWWWK.',
      'KGDDDGLWWWWWWWK.',
      'KGGGGLWWWWWWWK..',
      'KWLLLWWWWWWWWK..',
      '.KWWWWWWwwwwK...',
      '..KKKKKKKKKKK...',
    ],
  },
  torso_curl: {
    anchor: [11, 11],
    rows: [
      '.......KKKKKKKK.........',
      '.....KKDDDDDDDDKK.......',
      '....KDDDDDDDDDDDDK......',
      '...KDDDDDDDDDDDDDDK.....',
      '..KDDDDDDDDDDDDDDDDK....',
      '..KGDDDDDDDDDDDDDDGK....',
      '.KGGDDDDDDDDDDDDDGGLK...',
      '.KLGGGGDDDDDDDGGGLLWK...',
      'KWLLLGGGGGGGGGGLLWWWK...',
      'KWWWLLLLLLLLLLLLWWWWK...',
      '.KWWWWWWWWWWWWWWWWWK....',
      '..KKKKKKKKKKKKKKKKK.....',
    ],
  },

  // ---------------------------------------------------------------- legs
  leg_straight: {
    anchor: [2, 0],
    rows: [
      '.WWW..',
      'KWWWK.',
      'KWWWK.',
      'KWWWK.',
      'KWWWK.',
      'KWWWK.',
      'KWWWWK',
      '.KKKK.',
    ],
  },
  leg_fwd: {
    anchor: [2, 0],
    rows: [
      '.WWW....',
      'KWWWK...',
      'KWWWK...',
      '.KWWWK..',
      '.KWWWK..',
      '..KWWWK.',
      '..KWWWWK',
      '...KKKK.',
    ],
  },
  leg_back: {
    anchor: [4, 0],
    rows: [
      '...WWW.',
      '..KWWWK',
      '..KWWWK',
      '.KWWWK.',
      '.KWWWK.',
      'KWWWK..',
      'KWWWWK.',
      '.KKKK..',
    ],
  },
  leg_lift: {
    anchor: [2, 0],
    rows: [
      '.WWW..',
      'KWWWK.',
      'KWWWWK',
      '.KWWWK',
      '..KWWK',
      '...KK.',
    ],
  },
  leg_long: {
    anchor: [2, 0],
    rows: [
      '.WWW..',
      'KWWWK.',
      'KWWWK.',
      'KWWWK.',
      'KWWWK.',
      'KWWWK.',
      'KWWWK.',
      'KWWWK.',
      'KWWWK.',
      'KWWWK.',
      'KWWWWK',
      '.KKKK.',
    ],
  },
  leg_front_lie: {
    anchor: [0, 1],
    rows: [
      '.KKKKKKKK.',
      'WWWWWWWWWK',
      'wwwwwwWWWK',
      '.KKKKKKKK.',
    ],
  },
  haunch: {
    anchor: [3, 7],
    rows: [
      '...KKKKK....',
      '..KGGGGGKK..',
      '.KGLLLLLGGK.',
      'KGLWWWWWLGK.',
      'KLWWWWWWWLK.',
      'KWWWWWWWWWKK',
      'KWWWWWWWWWWK',
      '.KKKKKKKKKK.',
    ],
  },

  // ---------------------------------------------------------------- tail
  tail_up: {
    anchor: [2, 10],
    rows: [
      '...KKKK...',
      '..KDDDDKK.',
      '.KDDLLLDDK',
      '.KDLWWWLLK',
      'KDDLWKKWLK',
      'KDDLK..KK.',
      'KDDK......',
      'KDDK......',
      '.KDDK.....',
      '.KDDK.....',
      '..KDK.....',
    ],
  },
  tail_up_b: {
    anchor: [2, 10],
    rows: [
      '..KKKK....',
      '.KDDDDKK..',
      'KDDLLLDDK.',
      'KDLWWWLLK.',
      'KDLWKKWLK.',
      'KDLK..KK..',
      'KDDK......',
      'KDDK......',
      '.KDDK.....',
      '.KDDK.....',
      '..KDK.....',
    ],
  },
  tail_mid: {
    anchor: [9, 2],
    rows: [
      '..KKKKK...',
      '.KLWWLDDK.',
      'KWWWLDDDDK',
      '.KKLGDDDK.',
      '...KKKKK..',
    ],
  },
  tail_down: {
    anchor: [4, 0],
    rows: [
      '...KKK',
      '..KDDK',
      '..KDDK',
      '.KDDK.',
      '.KDGK.',
      'KDGLK.',
      'KGLWK.',
      'KWWK..',
      '.KK...',
    ],
  },

  // ---------------------------------------------------------------- head
  head_side: {
    anchor: [5, 13],
    rows: [
      '......KKKKK........',
      '....KKDDDDDKK......',
      '...KDDDDDDDDDK.....',
      '..KDDDDDDDDDDDK....',
      '.KDDDDDDDDWWDDDK...',
      '.KDDDDDDDDDDDDDDK..',
      'KDDDDDDDGWWWWGGLLK.',
      'KGDDDDDGWWWWWWWLLLK',
      'KGDDDDGWWWWWWWWWWNK',
      'KGGDDGWWWWWWWWWWWNK',
      '.KGGGWWWWWWWWWWWKK.',
      '.KGGWWWWWWWWWKKK...',
      '..KGWWWWWWWWK......',
      '...KwwwwwwKK.......',
      '....KKKKKK.........',
    ],
  },

  // ---------------------------------------------------------------- more bodies
  torso_bow: {
    anchor: [11, 12],
    rows: [
      '.KKKKK................',
      'KGGGGGKK..............',
      'KDDDDDDDKK............',
      'KDDDDDDDDDKKK.........',
      'KDDDDDDDDDDDDKK.......',
      'KLDDDDDDDDDDDDDKK.....',
      'KWLGDDDDDDDDDDDDDKK...',
      'KWWLGGDDDDDDDDDDDGLK..',
      '.KWWLLGGGGDDDDDDGLWWK.',
      '..KWWWWLLLGGGGGGLWWWWK',
      '...KKWWWWWWWLLLLWWWWWK',
      '.....KKKKWWWWWWWWWWWK.',
      '.........KKKKKKKKKKK..',
    ],
  },
  leg_short: {
    anchor: [2, 0],
    rows: [
      '.WWW..',
      'KWWWK.',
      'KWWWK.',
      'KWWWK.',
      'KWWWWK',
      '.KKKK.',
    ],
  },
  tail_wrap: {
    anchor: [0, 3],
    rows: [
      '...KKKKKKK...',
      '..KDDDDDLWWK.',
      '.KDDDDLLWWWWK',
      '.KKKKKKKKKKK.',
    ],
  },

  // ---------------------------------------------------------------- more heads
  head_up: {
    anchor: [4, 16],
    rows: [
      '.............KK...',
      '............KNNK..',
      '...........KNWWK..',
      '..........KWWWWK..',
      '......KKKKWWWWWK..',
      '....KKDDDDGWWWWK..',
      '...KDDDDDDGWWWWK..',
      '..KDDDDDDDGWWWWK..',
      '.KDDDDDDDGWWWWK...',
      '.KDDDDDDDWWWWWK...',
      'KDDDDDDDWWWWWWK...',
      'KGDDDDDWWWWWWK....',
      'KGGDDDWWWWWWK.....',
      '.KGGGWWWWWWK......',
      '.KGGWWWWWWK.......',
      '..KGWWWWWK........',
      '...KwwwwK.........',
      '....KKKK..........',
    ],
  },
  head_down: {
    anchor: [5, 11],
    rows: [
      '......KKKKK.......',
      '....KKDDDDDKK.....',
      '...KDDDDDDDDDK....',
      '..KDDDDDDDDDDDK...',
      '.KDDDDDDDDWWDDDK..',
      '.KDDDDDDDDDDDDDK..',
      'KDDDDDDDGWWWWGDDK.',
      'KGDDDDDGWWWWWWGLK.',
      'KGDDDDGWWWWWWWWLLK',
      'KGGDDGWWWWWWWWWLLK',
      '.KGGGWWWWWWWWWWWLK',
      '..KGWWWWWWWWWWWWWK',
      '...KKWWWWWWWWWWWWK',
      '.....KKWWWWWWWWNNK',
      '.......KKWWWWWWNNK',
      '.........KKKKKKKK.',
      '..................',
    ],
  },
  head_front: {
    anchor: [8, 15],
    rows: [
      '.KK...........KK.',
      'KDDK.........KDDK',
      'KPDDK.......KDDPK',
      'KPPDDKKKKKKKDDPPK',
      '.KPDDDDDDDDDDDPK.',
      '.KDDDWWDDDWWDDDK.',
      'KDDDDDDDDDDDDDDDK',
      'KDDWWWWDDDWWWWDDK',
      'KDWWWWWWWWWWWWWDK',
      'KGWWWWWWWWWWWWWGK',
      'KGWWWWWWWWWWWWWGK',
      '.KWWWWWNNNWWWWWK.',
      '.KWWWWWWNWWWWWWK.',
      '..KWWWWKWKWWWWK..',
      '...KwwwwwwwwwK...',
      '....KKKKKKKKK....',
    ],
  },

  // ---------------------------------------------------------------- ears
  ear_up: {
    anchor: [3, 6],
    rows: [
      '...K...',
      '..KDK..',
      '..KDPK.',
      '.KDDPK.',
      '.KDDPPK',
      'KDDDPPK',
      'KDDDDDK',
    ],
  },
  ear_back: {
    anchor: [5, 3],
    rows: [
      'KKK....',
      'KDDKK..',
      '.KDDDKK',
      '..KKKKK',
    ],
  },

  // ---------------------------------------------------------------- eyes (overlay, top-left anchor)
  eye_open: { anchor: [0, 0], rows: ['.KK.', 'KbEK', 'KBBK', '.KK.'] },
  eye_half: { anchor: [0, 0], rows: ['....', 'KKKK', 'KbBK', '.KK.'] },
  eye_closed: { anchor: [0, 0], rows: ['....', '....', 'KKKK', '....'] },
  eye_happy: { anchor: [0, 0], rows: ['.KK.', 'K..K', '....', '....'] },

  // ---------------------------------------------------------------- mouth (overlay, top-left anchor)
  mouth_open: { anchor: [0, 0], rows: ['KKKKKK', '.KRRRK', '..KPPK', '...KK.'] },
  mouth_yawn: { anchor: [0, 0], rows: ['KKKKK', 'KRRRK', 'KRPRK', 'KRPPK', '.KKK.'] },
  mouth_chomp: { anchor: [0, 0], rows: ['KKKK', '.KK.'] },
  // front-facing mouths (used by head_front / head_tilt)
  mouthf_open: { anchor: [0, 0], rows: ['KRRRK', '.KPK.', '..K..'] },
  mouthf_yawn: { anchor: [0, 0], rows: ['KKKKK', 'KRRRK', 'KRPRK', '.KKK.'] },
  mouthf_chomp: { anchor: [0, 0], rows: ['.KKK.'] },
};

// Head tilt ("?" face) is the front head sheared so one ear rises: one pixel
// of shift every four rows, pivoting on the chin. Derived, so it always
// matches head_front.
function shear(rows, every) {
  const h = rows.length;
  const shifts = rows.map((_, r) => Math.floor((h - 1 - r) / every));
  const extra = Math.max(...shifts);
  return rows.map((row, r) => '.'.repeat(shifts[r]) + row + '.'.repeat(extra - shifts[r]));
}
PUPPY.head_tilt = { anchor: [PUPPY.head_front.anchor[0], PUPPY.head_front.anchor[1]], rows: shear(PUPPY.head_front.rows, 4) };
