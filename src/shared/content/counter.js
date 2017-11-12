const defaultObject = require('./default');

const utils = require('../utils');

// CONSTS
const KIND = 'counter';

// FACTORY

function factory(/* random */) {
  function create({ value = 0, color = '#FFF' } = {}) {
    const o = {
      kind: KIND,
      text: value,
      color,
      data: {
        value
      }
    };
    o.__proto__ = defaultObject;

    return o;
  }

  // ACTIONS

  function setValue(o, value) {
    return {
      text: value,
      data: {
        value,
        color: o.data.color
      }
    };
  }

  function increment(o, inc) {
    let v = o.data.value;
    v += inc === undefined ? 1 : inc;
    return setValue(o, v);
  }

  function reset(o) {
    return setValue(o, 0);
  }

  // OPTIONS

  function newOptions() {
    return ['add counter', ['with 0', ['with value', utils.promptNumber]]];
  }

  function existingOptions(objs) {
    if (objs.every(o => o.kind === KIND)) {
      return [
        '=0',
        '+1',
        '-1',
        ['add value', utils.promptNumber],
        ['set value', utils.promptNumber]
      ];
    }
  }

  // ON OPTIONS

  function onMenuNew(a, b, c /* , d */) {
    if (a === 'add counter') {
      return create({ value: c });
    }
  }

  function onMenuExisting(o, a, b) {
    if (o.kind === KIND) {
      switch (a) {
        case '+1':
          return increment(o);
        case '-1':
          return increment(o, -1);
        case '=0':
          return reset(o);
        case 'add value':
          return increment(o, b);
        case 'set value':
          return setValue(o, b);
        default:
      }
    }
  }

  return {
    create,
    setValue,
    increment,
    reset,
    newOptions,
    existingOptions,
    onMenuNew,
    onMenuExisting
  };
}

module.exports = factory;
