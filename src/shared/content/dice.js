const defaultObject = require('./default');

// CONSTS

const KIND = 'dice';

const FACES = '1 2 3 4 5 6'.split(' ');

const COLORS = 'red white'.split(' ');

// FACTORY

function factory(random) {
  function create({ face, color } = {}) {
    if (face === undefined) {
      face = random.fromArray(FACES);
    }

    if (color === undefined) {
      color = random.fromArray(COLORS);
    }

    const o = {
      kind: KIND,
      image: `assets/gfx/dices/${color}/${face}.png`,
      dimensions: [64, 64],
      data: {
        face,
        color
      }
    };
    o.__proto__ = defaultObject;

    return o;
  }

  // ACTIONS

  function setFace(o, face) {
    return {
      image: o.image.replace(`/${o.data.face}.png`, `/${face}.png`),
      data: { face, color: o.data.color }
    };
  }

  function roll(o) {
    return setFace(o, random.fromArray(FACES));
  }

  // OPTIONS

  function newOptions() {
    return ['add dice', ['roll', ['with value', FACES]]];
  }

  function existingOptions(objs) {
    if (objs.every(o => o.kind === KIND)) {
      return ['roll', ['set value', FACES]];
    }
  }

  // ON OPTIONS

  function onMenuNew(a, b, c /* , d */) {
    if (a === 'add dice') {
      if (b === 'roll') {
        return create();
      }
      return create({ face: c });
    }
  }

  function onMenuExisting(o, a, b) {
    if (o.kind === KIND) {
      if (a === 'roll') {
        return roll(o);
      }
      return setFace(o, b);
    }
  }

  return {
    create,
    roll,
    setFace,
    newOptions,
    existingOptions,
    onMenuNew,
    onMenuExisting,
    COLORS,
    FACES
  };
}

module.exports = factory;
