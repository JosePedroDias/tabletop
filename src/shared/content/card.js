const defaultObject = require('./default');

// CONSTS

const KIND = 'card';

const SUITS = 'hdcs'.split('');

const VALUES = '2 3 4 5 6 7 8 9 10 j q k a'.split(' ');

const BACKS = 'blue green red'.split(' ');

// FACTORY

function factory(random) {
  function create(
    { suit, value, backColor, isFlipped = false, isJoker = false } = {}
  ) {
    if (suit === undefined) {
      suit = isJoker ? '' : random.fromArray(SUITS);
    }

    if (value === undefined) {
      value = isJoker ? 'joker' : random.fromArray(VALUES);
    }

    if (backColor === undefined) {
      backColor = random.fromArray(BACKS);
    }

    const fn = isJoker ? 'joker' : `${suit}${value}`;
    const backImage = `assets/gfx/cards/back_${backColor}.png`;
    const mainImage = `assets/gfx/cards/${fn}.png`;

    const o = {
      kind: KIND,
      image: isFlipped ? backImage : mainImage,
      image2: isFlipped ? mainImage : backImage,
      dimensions: [140, 190],
      data: {
        suit,
        value,
        isJoker,
        isFlipped
      }
    };
    o.__proto__ = defaultObject;

    return o;
  }

  // ACTIONS

  function flip(o) {
    return {
      image: o.image2,
      image2: o.image,
      data: {
        suit: o.data.suit,
        value: o.data.value,
        isJoker: o.data.isJoker,
        isFlipped: !o.data.isFlipped
      }
    };
  }

  // OPTIONS

  function newOptions() {
    return [
      'add card',
      [
        'joker',
        [
          'with suit',
          [
            ['hearts', VALUES],
            ['diamonds', VALUES],
            ['clubs', VALUES],
            ['spades', VALUES]
          ]
        ]
      ]
    ];
  }

  function existingOptions(objs) {
    if (objs.every(o => o.kind === KIND)) {
      const opts = ['flip'];
      if (objs.length > 1 && objs[0].kind === KIND) {
        if (objs[0].partOf) {
          opts.push('ungroup');
        } else {
          opts.push('group');
        }
      }
      return opts;
    }
  }

  // ON OPTIONS

  function onMenuNew(a, b, c, d) {
    if (a === 'add card') {
      if (b === 'joker') {
        return create({ isJoker: true });
      }
      return create({
        suit: c[0],
        value: d.toLowerCase()
      });
    }
  }

  function onMenuExisting(o, a /* , b */) {
    if (o.kind === KIND) {
      if (a === 'flip') {
        return flip(o);
      }
    }
  }

  return {
    create,
    flip,
    newOptions,
    existingOptions,
    onMenuNew,
    onMenuExisting,
    BACKS,
    SUITS,
    VALUES
  };
}

module.exports = factory;
