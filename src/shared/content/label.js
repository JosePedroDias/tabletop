const defaultObject = require('./default');

const utils = require('../utils');

// CONSTS

const KIND = 'label';

// FACTORY

function factory(/* random */) {
  function create({ text, color = '#FFF' } = {}) {
    const o = {
      kind: KIND,
      text,
      color,
      data: {
        text
      }
    };
    o.__proto__ = defaultObject;

    return o;
  }

  // ACTIONS

  function setText(o, text) {
    return {
      text,
      data: {
        text,
        color: o.data.color
      }
    };
  }

  // OPTIONS

  function newOptions() {
    return ['add label', utils.promptValue];
  }

  function existingOptions(objs) {
    if (objs.every(o => o.kind === KIND)) {
      return ['set text'];
    }
  }

  // ON OPTIONS

  function onMenuNew(a, b /* , c, d */) {
    if (a === 'add label') {
      return create({ text: b });
    }
  }

  function onMenuExisting(o /* , a, b */) {
    if (o.kind === KIND) {
      return setText(utils.promptValue(o.data.text));
    }
  }

  return {
    create,
    setText,
    newOptions,
    existingOptions,
    onMenuNew,
    onMenuExisting
  };
}

module.exports = factory;
