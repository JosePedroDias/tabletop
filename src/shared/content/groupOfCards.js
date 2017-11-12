const defaultObject = require('./default');

// CONSTS

const KIND = 'groupOfCards';

// FACTORY

function factory(random) {
  function create({ cards } = {}) {
    const o = {
      kind: KIND,
      children: cards.map(oo => oo.id),
      data: {}
    };
    o.__proto__ = defaultObject;

    return o;
  }

  // ACTIONS

  function shuffle(o) {
    return {
      children: random.shuffle(o.children)
    };
  }

  // OPTIONS

  function newOptions() {}

  function existingOptions(objs) {
    if (objs.every(o => o.kind === KIND)) {
      return ['shuffle'];
    }
  }

  // ON OPTIONS

  function onMenuNew(/* a, b, c, d */) {}

  function onMenuExisting(o, a /* , b */) {
    if (o.kind === KIND) {
      if (a === 'shuffle') {
        return shuffle(o);
      }
    }
  }

  return {
    create,
    shuffle,
    newOptions,
    existingOptions,
    onMenuNew,
    onMenuExisting
  };
}

module.exports = factory;
