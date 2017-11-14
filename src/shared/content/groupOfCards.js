const defaultObject = require('./default');
const _card_ = require('./card');

// CONSTS

const KIND = 'groupOfCards';

// FACTORY

function factory(random) {
  const card = _card_(random);

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
    const g = window._findObjectById(o.partOf)[0];
    const children = random.shuffle(
      g.children.map(id => window._findObjectById(id)[0])
    );

    // average
    const p0 = children.reduce(
      (p, o2) => [p[0] + o2.position[0], p[1] + o2.position[1]],
      [0, 0]
    );
    const l = children.length;
    p0[0] /= l;
    p0[1] /= l;
    const dp = [3, 3];
    p0[0] -= dp[0] * l / 2;
    p0[1] -= dp[1] * l / 2;
    children.forEach((o2, i) => {
      window.updateObject(o2.id, {
        position: [p0[0] + dp[0] * i, p0[1] + dp[1] * i]
      });
    });

    window.updateObject(g.id, {
      children: children.map(o2 => o2.id)
    });

    return {};
  }

  function align(o) {
    const g = window._findObjectById(o.partOf)[0];
    const children = g.children.map(id => window._findObjectById(id)[0]);
    // smallest x, average y
    const p0 = children.reduce(
      (p, o2) => [Math.min(o2.position[0], p[0]), p[1] + o2.position[1]],
      [Number.MAX_VALUE, 0]
    );
    p0[1] /= children.length;
    const dp = [20, 0];
    children.forEach((o2, i) => {
      window.updateObject(o2.id, {
        position: [p0[0] + dp[0] * i, p0[1] + dp[1] * i]
      });
    });

    return {};
  }

  // OPTIONS

  function newOptions() {
    return 'add deck';
  }

  function existingOptions(objs) {
    if (objs.every(o => o.kind === 'card' && o.partOf)) {
      return ['shuffle', 'align'];
    }
  }

  // ON OPTIONS

  function onMenuNew(a /* , b, c, d */) {
    if (a === 'add deck') {
      const cards = [];
      card.SUITS.forEach(s => {
        card.VALUES.forEach(v => {
          const o = card.create({
            value: v,
            suit: s,
            backColor: card.BACKS[0],
            isFlipped: true
          });
          o.scale = 0.5;
          o.position = [200, 200]; // TODO: which pos?
          window.addObject(o);
          cards.push(o);
        });
      }); // TODO: select cards
      const g = create({ cards });
      g.id = random.id(6);
      cards.forEach(c => window.updateObject(c.id, { partOf: g.id }));
      return g;
    }
  }

  function onMenuExisting(o, a /* , b */) {
    if (o.kind === 'card') {
      if (a === 'shuffle') {
        return shuffle(o);
      } else if (a === 'align') {
        return align(o);
      }
    }
  }

  return {
    create,
    shuffle,
    align,
    newOptions,
    existingOptions,
    onMenuNew,
    onMenuExisting
  };
}

module.exports = factory;
