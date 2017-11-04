const defaultObject = require('./default');

function factory(random) {
  const FACES = '1 2 3 4 5 6'.split(' ');

  const COLORS = 'red white'.split(' ');

  function create({ face, color } = {}) {
    if (face === undefined) {
      face = random.fromArray(FACES);
    }

    if (color === undefined) {
      color = random.fromArray(COLORS);
    }

    const o = {
      kind: 'dice',
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

  function setFace(o, face) {
    return {
      image: o.image.replace(`/${o.data.face}.png`, `/${face}.png`),
      data: { face, color: o.data.color }
    };
  }

  function roll(o) {
    return setFace(o, random.fromArray(FACES));
  }

  return {
    create,
    roll,
    setFace,
    COLORS,
    FACES
  };
}

module.exports = factory;
