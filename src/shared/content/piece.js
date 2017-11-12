const defaultObject = require('./default');

const utils = require('../utils');

// CONSTS

const KIND = 'piece';

const COLORS = 'black blue green purple red white'.split(' ');

const INDICES = utils.seq(19).map(n => utils.zeroPad(2, n));

// FACTORY

function factory(random) {
  function create({ color, index } = {}) {
    if (color === undefined) {
      color = random.fromArray(COLORS);
    }

    if (index === undefined) {
      index = random.fromArray(INDICES);
    }

    const o = {
      kind: KIND,
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

  // ACTIONS

  // OPTIONS

  function newOptions() {
    return [
      'add piece',
      COLORS.map(color => [color, ['random', ['with index', INDICES]]])
    ];
  }

  function existingOptions(/* objs */) {}

  // ON OPTIONS

  function onMenuNew(a, b, c, d) {
    if (a === 'add piece') {
      if (c === 'random') {
        return create({ color: b });
      }
      return create({ color: b, index: d });
    }
  }

  function onMenuExisting(/* o, a, b */) {}

  return {
    create,
    newOptions,
    existingOptions,
    onMenuNew,
    onMenuExisting,
    COLORS,
    INDICES
  };
}

module.exports = factory;
