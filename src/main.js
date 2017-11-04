const SimplePeer = require('simple-peer');

const collision = require('./collision');
const random = require('./random').default;
const utils = require('./utils');
const { menu } = require('./arcMenu');
const { render, W, H } = require('./render');

const card = require('./content/card')(random);
const counter = require('./content/counter')(random);
const dice = require('./content/dice')(random);
const label = require('./content/label')(random);
const piece = require('./content/piece')(random);

let SHIFT_IS_DOWN = false;

const SEARCH = utils.getSearch();

// console.log("search", SEARCH);

const peer = new SimplePeer({
  initiator: !!SEARCH.hosting,
  channelName: 'tabletop',
  trickle: false
});
let ready = false;

peer.on('signal', signal => {
  window.prompt(
    'share this signal with your friend and dismiss this',
    JSON.stringify(signal)
  );
});

peer.on('connect', () => {
  ready = true;
  console.log('connected!');
  setup.style.display = 'none';
  publishEvent({ type: 'opponentName', data: SEARCH.me || random.id(6) }); // to resume pending stuff
});

peer.on('data', data => {
  ready = true;
  const ev = JSON.parse(data);
  // console.log("data", ev);
  actOnEvent(ev);
});

window.setupOtherSignal = signal => {
  peer.signal(JSON.parse(signal));
};

let OBJECTS = [];
window.OBJECTS = OBJECTS;
window.SELECTED_OBJECTS = [];

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
  render({ objects: OBJECTS });

  if (!isForeign) {
    publishEvent({
      type: 'addObject',
      data: o
    });
  }
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
  render({ objects: OBJECTS });

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
  render({ objects: OBJECTS });

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
  render({ objects: OBJECTS });

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
      window.OBJECTS = OBJECTS;
      render({ objects: OBJECTS });
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
  if (!ready) {
    // console.warn("delaying ev", ev);
    return pendingEvents.push(ev);
  }
  while (pendingEvents.length) {
    const ev0 = pendingEvents.shift();
    // console.warn("senting delayed ev", ev0);
    peer.send(ev0);
  }
  if (!ev) {
    return;
  }
  // console.warn("senting ev", ev);
  peer.send(ev);
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
render({ objects: OBJECTS });

function _getPoint(ev) {
  const scroll = utils.getScroll();
  return [
    Math.round(ev.clientX - scroll[0]),
    Math.round(ev.clientY - scroll[1])
  ];
}

let selectedObj, menuObj;
let firstP, lastP, menuP;

function onMenuDone(parts) {
  // console.warn(parts);
  if (SELECTED_OBJECTS.length === 0) {
    menuObj = undefined;
    _onMenuDone(parts);
    return;
  }
  SELECTED_OBJECTS.forEach(o => {
    menuObj = o;
    _onMenuDone(parts);
  });
}

function _onMenuDone(parts) {
  if (!parts) {
    return render({ objects: OBJECTS });
  }
  console.warn(parts);
  const [a, b, c, d] = parts;
  if (menuObj) {
    const o = menuObj;

    if (a === 'remove') {
      removeObject(o.id);
    } else {
      switch (o.kind) {
        case 'dice':
          if (a === 'roll') {
            updateObject(o.id, dice.roll(o));
          } else {
            updateObject(o.id, dice.setFace(o, b));
          }
          break;
        case 'card':
          updateObject(o.id, card.flip(o));
          break;
        case 'label':
          updateObject(
            o.id,
            label.setText(window.prompt('text to set?', o.data.text))
          );
          break;
        case 'counter':
          {
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
                v = counter.increment(o, parseFloat(b));
                break;
              case 'set value':
                v = counter.setValue(o, parseFloat(b));
                break;
              default:
                console.warn('unsupported', o.kind);
            }
            updateObject(o.id, v);
          }
          break;
        default:
          console.warn('unsupported', o.kind);
      }
    }
    console.log(o);
  } else {
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
      console.warn(o);
      addObject(o);
    }
  }
  render({ objects: OBJECTS });
}

document.addEventListener('keydown', ev => {
  SHIFT_IS_DOWN = ev.shiftKey;
});

document.addEventListener('keyup', ev => {
  SHIFT_IS_DOWN = ev.shiftKey;
});

document.addEventListener('mousedown', ev => {
  ev.preventDefault();
  ev.stopPropagation();

  const p = _getPoint(ev);
  selectedObj = collision.collideObjectsPoint(OBJECTS, p);
  console.log('selectedObj', selectedObj);

  if (ev.button === 2) {
    menuObj = selectedObj;
    menuP = p;
    let opts;

    if (!menuObj) {
      opts = [
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
        [
          'add label',
          function getText() {
            return window.prompt('text?', '');
          }
        ],
        [
          'add counter',
          [
            'with 0',
            [
              'with value',
              function getValue() {
                return parseInt(window.prompt('value?', ''), 10);
              }
            ]
          ]
        ]
      ];
    } else {
      switch (menuObj.kind) {
        case 'dice':
          opts = ['remove', 'roll', ['set value', dice.FACES]];
          break;
        case 'card':
          opts = ['remove', 'flip'];
          break;
        case 'piece':
          opts = ['remove'];
          break;
        case 'label':
          opts = ['remove', 'set text'];
          break;
        case 'counter':
          opts = ['remove', '=0', '+1', '-1', 'add value', 'set value'];
          break;
        default:
          console.warn('unsupported', menuObj.kind);
      }
    }

    if (opts) {
      menu({
        center: p,
        options: opts,
        onClick: onMenuDone
      });
    }

    return false;
  }

  lastP = p;

  if (selectedObj) {
    changeObjectIndex(selectedObj.id, OBJECTS.length - 1);
    SELECTED_OBJECTS = [selectedObj];
  } else if (SHIFT_IS_DOWN) {
    firstP = p;
  }
});

document.addEventListener('mousemove', ev => {
  if (!lastP && !firstP) return;
  ev.preventDefault();
  ev.stopPropagation();
  const p = _getPoint(ev);

  if (firstP && SHIFT_IS_DOWN) {
    render({ objects: OBJECTS, quad: [firstP, p] });
    lastP = p;
    return;
  }

  const dP = [p[0] - lastP[0], p[1] - lastP[1]];
  lastP = p;
  SELECTED_OBJECTS.forEach(o => {
    o.position[0] += dP[0];
    o.position[1] += dP[1];
  });
  render({
    objects: OBJECTS
  });
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
  } else {
    // render({objects:OBJECTS, quad:[firstP, p]});
  }

  selectedObj = undefined;
  firstP = undefined;
  lastP = undefined;

  // console.log("done");
});

document.addEventListener('contextmenu', ev => {
  ev.preventDefault();
  return false;
});
