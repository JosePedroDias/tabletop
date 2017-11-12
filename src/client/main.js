const collision = require('../shared/collision');
const random = require('../shared/random').default;
const utils = require('../shared/utils');
const { menu } = require('./arcMenu');
const { render, select, renderSelectionBox, W, H } = require('./render');

const card = require('../shared/content/card')(random);
const groupOfCards = require('../shared/content/groupOfCards')(random);
const dice = require('../shared/content/dice')(random);
// const piece = require('../shared/content/piece')(random);
// const label = require('../shared/content/label')(random);
// const counter = require('../shared/content/counter')(random);

const contentTypes = [card, groupOfCards, dice /* , piece, counter, label */];

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
window._findObjectById = _findObjectById; // TODO: KINDA LAME

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
  ['h', 's'].forEach((s, j) => {
    ['2', '3', '4'].forEach((v, i) => {
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
    if (parts[0] === 'group') {
      const o = groupOfCards.create({ cards: SELECTED_OBJECTS });
      addObject(o);
      SELECTED_OBJECTS.forEach(so => {
        updateObject(so.id, { partOf: o.id });
      });
    } else if (parts[0] === 'ungroup') {
      removeObject(SELECTED_OBJECTS[0].partOf);
      SELECTED_OBJECTS.forEach(so => {
        updateObject(so.id, { partOf: undefined });
      });
    } else {
      SELECTED_OBJECTS.forEach(o => {
        changeAction(o, parts);
      });
    }
  }
  menuP = undefined;
}

function createAction(parts) {
  const [a, b, c, d] = parts;

  contentTypes.some(ct => {
    const o = ct.onMenuNew(a, b, c, d);
    if (o) {
      o.scale = 0.5;
      o.position = menuP.slice();
      const pair = _findObjectById(addObject(o));
      console.log('added', pair[0]);
      return true;
    }
    return false;
  });
}

function changeAction(o, parts) {
  const [a, b] = parts;

  if (a === 'remove') {
    const pair = _findObjectById(o.id);
    console.log('remove', pair[0]);
    removeObject(o.id);
    return;
  }

  contentTypes.some(ct => {
    const o2 = ct.onMenuExisting(o, a, b);
    if (o2) {
      updateObject(o.id, o2);
      console.log('change', o);
      return true;
    }
    return false;
  });
}

function menuNew() {
  return contentTypes.reduce((opts, ct) => {
    const a = ct.newOptions();
    if (a) {
      const b = opts.slice();
      b.push();
      return b;
    }
    return opts;
  }, []);
}

function menuExisting(objs) {
  return contentTypes.reduce(
    (opts, ct) => opts.concat(ct.existingOptions(objs) || []),
    ['remove']
  );
}

function objInGroup(obj) {
  const oId = obj.id;
  const groups = OBJECTS.filter(o => o.kind.indexOf('group') === 0);
  let group;
  groups.some(g => {
    if (g.children.indexOf(oId) !== -1) {
      group = g;
      return true;
    }
    return false;
  });
  return group;
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
    const opts = selectedObj ? menuExisting(SELECTED_OBJECTS) : menuNew();
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
    let group;
    if ((group = objInGroup(selectedObj))) {
      // see if selected is in a group. if so, select whole group
      SELECTED_OBJECTS = group.children.map(id => _findObjectById(id)[0]);
      changeObjectIndex(group.id, OBJECTS.length - 1);
    } else {
      SELECTED_OBJECTS = [selectedObj];
      changeObjectIndex(selectedObj.id, OBJECTS.length - 1);
    }
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
