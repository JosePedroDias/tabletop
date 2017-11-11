const collision = require('../shared/collision');
const random = require('../shared/random').default;
const utils = require('../shared//utils');
const { menu } = require('./arcMenu');
const { render, select, renderSelectionBox, W, H } = require('./render');

const card = require('../shared/content/card')(random);
const counter = require('../shared/content/counter')(random);
const dice = require('../shared/content/dice')(random);
const label = require('../shared/content/label')(random);
const piece = require('../shared/content/piece')(random);

const p2p = require('./p2pfake')(
  // p2p | p2pfake
  'tabletop-experimental',
  'https://acor.sl.pt:444'
);

p2p.on('connect', () => {
  publishEvent({ type: 'opponentName', data: SEARCH.me || random.id(6) });
});

p2p.on('data', (id, data) => {
  console.log(id, data);
  const ev = JSON.parse(data);
  // console.log("data", ev);
  actOnEvent(ev);
});

let SHIFT_IS_DOWN = false;

const SEARCH = utils.getSearch();

// console.log("search", SEARCH);

let OBJECTS = [];
let SELECTED_OBJECTS = [];

function _findObjectById(id) {
  for (let i = OBJECTS.length - 1; i >= 0; --i) {
    const o = OBJECTS[i];
    if (id === o.id) {
      return [o, i];
    }
  }
}

let isForeign = false;

function addObject(o) {
  if (!('id' in o)) {
    o.id = random.id(6);
  }
  OBJECTS.push(o);
  render(OBJECTS, SELECTED_OBJECTS);

  if (!isForeign) {
    publishEvent({
      type: 'addObject',
      data: o
    });
  }

  return o.id;
}

function updateObject(id, partialO) {
  const pair = _findObjectById(id);
  if (!pair) {
    return;
  }
  const o = pair[0];
  for (const k in partialO) {
    o[k] = partialO[k];
  }
  render(OBJECTS, SELECTED_OBJECTS);

  if (!isForeign) {
    publishEvent({
      type: 'updateObject',
      id,
      data: partialO
    });
  }
}

function changeObjectIndex(id, index) {
  const pair = _findObjectById(id);
  if (!pair) {
    return;
  }
  OBJECTS.splice(pair[1], 1);
  OBJECTS.splice(index, 0, pair[0]);
  render(OBJECTS, SELECTED_OBJECTS);

  if (!isForeign) {
    publishEvent({
      type: 'changeObjectIndex',
      id,
      data: index
    });
  }
}

function removeObject(id) {
  const pair = _findObjectById(id);
  if (!pair) {
    return;
  }
  OBJECTS.splice(pair[1], 1);
  render(OBJECTS, SELECTED_OBJECTS);

  if (!isForeign) {
    publishEvent({
      type: 'removeObject',
      id
    });
  }
}

function actOnEvent(ev) {
  isForeign = true;
  switch (ev.type) {
    case 'addObject':
      addObject(ev.data);
      break;
    case 'updateObject':
      updateObject(ev.id, ev.data);
      break;
    case 'changeObjectIndex':
      changeObjectIndex(ev.id, ev.data);
      break;
    case 'removeObject':
      removeObject(ev.id);
      break;
    case 'getAllObjects': // to request resync to other
      publishEvent({
        type: 'allObjects',
        data: OBJECTS
      });
      break;
    case 'allObjects': // to apply resync from other
      OBJECTS = ev.data;
      render(OBJECTS, SELECTED_OBJECTS);
      break;
    case 'opponentName':
      console.log('Other user is named %s', ev.data);
      break;
    default:
      console.warn('unsupported event type: %s', ev.type);
  }
  isForeign = false;
}

const pendingEvents = [];
function publishEvent(ev) {
  ev = JSON.stringify(ev);
  if (!p2p.isReady) {
    // console.warn("delaying ev", ev);
    return pendingEvents.push(ev);
  }
  while (pendingEvents.length) {
    const ev0 = pendingEvents.shift();
    // console.warn("senting delayed ev", ev0);
    p2p.broadcast(ev0);
  }
  if (!ev) {
    return;
  }
  // console.warn("senting ev", ev);
  p2p.broadcast(ev);
}

if (SEARCH.hosting) {
  card.SUITS.forEach((s, j) => {
    card.VALUES.forEach((v, i) => {
      const o = card.create({
        value: v,
        suit: s,
        backColor: card.BACKS[0]
      });
      o.scale = 0.5;
      o.position = [
        Math.round(W * 0.05 + i * W * 0.06),
        Math.round(H * 0.07 + j * H * 0.1)
      ];
      addObject(o);
    });
  });
}
render(OBJECTS, SELECTED_OBJECTS);

function _getPoint(ev) {
  const scroll = utils.getScroll();
  return [
    Math.round(ev.clientX - scroll[0]),
    Math.round(ev.clientY - scroll[1])
  ];
}

let selectedObj;
let firstP, lastP, menuP;

function onMenuDone(parts) {
  // console.log(parts);

  if (!parts) {
    render(OBJECTS, SELECTED_OBJECTS);
  } else if (SELECTED_OBJECTS.length === 0) {
    createAction(parts);
  } else {
    SELECTED_OBJECTS.forEach(o => {
      changeAction(o, parts);
    });
  }
  menuP = undefined;
}

function createAction(parts) {
  const [a, b, c, d] = parts;
  let o;

  switch (a) {
    case 'add piece':
      if (c === 'random') {
        o = piece.create({ color: b });
      } else {
        o = piece.create({ color: b, index: d });
      }
      break;
    case 'add dice':
      if (b === 'roll') {
        o = dice.create();
      } else {
        o = dice.create({ face: c });
      }
      break;
    case 'add card':
      if (b === 'joker') {
        o = card.create({ isJoker: true });
      } else {
        o = card.create({
          suit: c[0],
          value: d.toLowerCase()
        });
      }
      break;
    case 'add label':
      o = label.create({ text: b });
      break;
    case 'add counter':
      o = counter.create({ value: c });
      break;
    default:
      console.warn('unsupported', a);
  }
  if (o) {
    o.scale = 0.5;
    o.position = menuP.slice();
    const pair = _findObjectById(addObject(o));
    console.log('added', pair[0]);
  }
}

function changeAction(o, parts) {
  const [a, b] = parts;

  if (a === 'remove') {
    const pair = _findObjectById(o.id);
    console.log('remove', pair[0]);
    removeObject(o.id);
  } else {
    if (o.kind === 'dice') {
      if (a === 'roll') {
        updateObject(o.id, dice.roll(o));
      } else {
        // a === 'set face'
        updateObject(o.id, dice.setFace(o, b));
      }
    } else if (o.kind === 'card') {
      updateObject(o.id, card.flip(o));
    } else if (o.kind === 'label') {
      updateObject(o.id, label.setText(utils.promptValue(o.data.text)));
    } else if (o.kind === 'counter') {
      let v;
      switch (a) {
        case '+1':
          v = counter.increment(o);
          break;
        case '-1':
          v = counter.increment(o, -1);
          break;
        case '=0':
          v = counter.reset(o);
          break;
        case 'add value':
          v = counter.increment(o, b);
          break;
        case 'set value':
          v = counter.setValue(o, b);
          break;
        default:
          console.warn('unsupported', o.kind);
      }
      updateObject(o.id, v);
    } else {
      console.warn('unsupported type', o.type);
    }
  }
  console.log('change', o);
}

function menuNew() {
  return [
    [
      'add piece',
      piece.COLORS.map(color => [
        color,
        ['random', ['with index', piece.INDICES]]
      ])
    ],

    ['add dice', ['roll', ['with value', dice.FACES]]],
    [
      'add card',
      [
        'joker',
        [
          'with suit',
          [
            ['hearts', card.VALUES],
            ['diamonds', card.VALUES],
            ['clubs', card.VALUES],
            ['spades', card.VALUES]
          ]
        ]
      ]
    ],
    ['add label', utils.promptValue],
    ['add counter', ['with 0', ['with value', utils.promptNumber]]]
  ];
}

function menuExisting(obj) {
  if (obj.kind === 'dice') {
    return ['remove', 'roll', ['set value', dice.FACES]];
  } else if (obj.kind === 'card') {
    return ['remove', 'flip'];
  } else if (obj.kind === 'piece') {
    return ['remove'];
  } else if (obj.kind === 'label') {
    return ['remove', 'set text'];
  } else if (obj.kind === 'counter') {
    return [
      'remove',
      '=0',
      '+1',
      '-1',
      ['add value', utils.promptNumber],
      ['set value', utils.promptNumber]
    ];
  }
}

document.addEventListener('keydown', ev => {
  SHIFT_IS_DOWN = ev.shiftKey;
});

document.addEventListener('keyup', ev => {
  SHIFT_IS_DOWN = ev.shiftKey;
});

document.addEventListener('mousedown', ev => {
  if (menuP) {
    return;
  }

  ev.preventDefault();
  ev.stopPropagation();

  const p = _getPoint(ev);
  selectedObj = collision.collideObjectsPoint(OBJECTS, p);
  // console.log('selectedObj', selectedObj);

  if (ev.button === 2) {
    menuP = p;
    const opts = selectedObj ? menuExisting(selectedObj) : menuNew();
    if (opts && opts.length > 0) {
      menu({
        center: p,
        options: opts,
        onClick: onMenuDone
      });
    }

    return false;
  }

  lastP = p;

  if (
    selectedObj &&
    (SELECTED_OBJECTS.length === 0 ||
      SELECTED_OBJECTS.indexOf(selectedObj) === -1)
  ) {
    changeObjectIndex(selectedObj.id, OBJECTS.length - 1);
    SELECTED_OBJECTS = [selectedObj];
  } else if (SHIFT_IS_DOWN) {
    firstP = p;
  } else if (!selectedObj) {
    SELECTED_OBJECTS = [];
    render(OBJECTS, SELECTED_OBJECTS);
  }
});

document.addEventListener('mousemove', ev => {
  if (!lastP && !firstP) return;
  ev.preventDefault();
  ev.stopPropagation();
  const p = _getPoint(ev);

  if (firstP && SHIFT_IS_DOWN) {
    const quad = [firstP, p];
    SELECTED_OBJECTS = select(OBJECTS, quad);
    render(OBJECTS, SELECTED_OBJECTS);
    renderSelectionBox(quad);
    lastP = p;
    return;
  }

  const dP = [p[0] - lastP[0], p[1] - lastP[1]];
  lastP = p;
  SELECTED_OBJECTS.forEach(o => {
    o.position[0] += dP[0];
    o.position[1] += dP[1];
  });
  render(OBJECTS, SELECTED_OBJECTS);
});

document.addEventListener('mouseup', ev => {
  ev.preventDefault();
  ev.stopPropagation();

  const p = _getPoint(ev);

  if (selectedObj && lastP) {
    const dP = [p[0] - lastP[0], p[1] - lastP[1]];
    selectedObj.position[0] += dP[0];
    selectedObj.position[1] += dP[1];

    updateObject(selectedObj.id, {
      position: selectedObj.position.slice()
    });
  }

  selectedObj = undefined;
  firstP = undefined;
  lastP = undefined;
});

document.addEventListener('contextmenu', ev => {
  ev.preventDefault();
  return false;
});
