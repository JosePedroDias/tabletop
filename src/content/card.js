const defaultObject = require('./default');

const SUITS = 'hdcs'.split('');

const VALUES = '2 3 4 5 6 7 8 9 10 j q k a'.split(' ');

const BACKS = 'blue green red'.split(' ');

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
      kind: 'card',
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

  function flip(o) {
    return {
      image: o.image2,
      image2: o.image,
      data: {
        suite: o.data.suite,
        value: o.data.value,
        isJoker: o.data.isJoker,
        isFlipped: !o.data.isFlipped
      }
    };
  }

  return {
    create,
    flip,
    BACKS,
    SUITS,
    VALUES
  };
}

module.exports = factory;
