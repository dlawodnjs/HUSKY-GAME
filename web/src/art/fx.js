// Small effect sprites (hearts, notes, zzz...). Anchor is the bottom centre.
export const FX = {
  heart: {
    anchor: [3, 5],
    rows: ['.KK.KK.', 'KHHKHHK', 'KHHHHhK', '.KHHhK.', '..KhK..', '...K...'],
  },
  note: {
    anchor: [2, 6],
    rows: ['..KKK', '..KYK', '..KYK', '..KK.', 'KKYK.', 'KYYK.', '.KK..'],
  },
  zzz_small: { anchor: [2, 3], rows: ['zzzz', '..z.', '.z..', 'zzzz'] },
  zzz_big: { anchor: [3, 6], rows: ['zzzzzz', 'zZZZZz', '...Zz.', '..Zz..', '.Zz...', 'zZZZZz', 'zzzzzz'] },
  sweat: { anchor: [1, 3], rows: ['.K.', 'KSK', 'KSK', '.K.'] },
  dust: { anchor: [2, 2], rows: ['.KKK.', 'KUUuK', '.KKK.'] },
  drop: { anchor: [0, 1], rows: ['S', 'S'] },
  question: {
    anchor: [2, 6],
    rows: ['.KKK.', 'KYYYK', 'K.KYK', '..KYK', '..KK.', '..KK.', '..KK.'],
  },
  exclaim: { anchor: [1, 6], rows: ['KKK', 'KYK', 'KYK', 'KYK', 'KKK', 'KYK', 'KKK'] },
  sparkle: { anchor: [2, 2], rows: ['..Y..', '.YEY.', 'YEEEY', '.YEY.', '..Y..'] },
  // The player's hand (cursor). Anchor is the fingertip that touches.
  hand_open: {
    anchor: [4, 0],
    rows: [
      '..K.K.K...',
      '.KFKFKFK..',
      '.KFKFKFK..',
      '.KFKFKFKK.',
      '.KFFFFFKFK',
      'KKFFFFFFFK',
      'KFKFFFFFK.',
      '.KFFFFFfK.',
      '..KFFFfK..',
      '...KKKK...',
    ],
  },
  hand_press: {
    anchor: [4, 1],
    rows: [
      '..........',
      '..KKKKK...',
      '.KFKFKFK..',
      '.KFKFKFKK.',
      '.KFFFFFKFK',
      'KKFFFFFFFK',
      'KFKFFFFFK.',
      '.KFFFFFfK.',
      '..KFFFfK..',
      '...KKKK...',
    ],
  },
  treat: { anchor: [3, 3], rows: ['.KK.KK.', 'KTTKTTK', 'KTttttK', '.KKKKK.'] },
};
