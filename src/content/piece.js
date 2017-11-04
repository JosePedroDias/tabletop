const defaultObject = require('./default');

const random = require('../random').default;
const utils = require('../utils');

const COLORS = 'black blue green purple red white'.split(' ');

const INDICES = utils.seq(19).map(n => utils.zeroPad(2, n));

function create({ color, index } = {}) {
  if (color === undefined) {
    color = random.fromArray(COLORS);
  }

  if (index === undefined) {
    index = random.fromArray(INDICES);
  }

  const o = {
    kind: 'piece',
    image: `assets/gfx/pieces/${color}/${index}.png`,
    dimensions: [64, 64],
    data: {
      color,
      index
    }
  };
  o.__proto__ = defaultObject;

  return o;
}

module.exports = {
  create,
  COLORS,
  INDICES
};
