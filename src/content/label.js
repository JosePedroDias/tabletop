const defaultObject = require('./default');

function create({ text, color = '#FFF' } = {}) {
  const o = {
    kind: 'label',
    text,
    color,
    data: {
      text
    }
  };
  o.__proto__ = defaultObject;

  return o;
}

function setText(o, text) {
  return {
    text,
    data: {
      text,
      color: o.data.color
    }
  };
}

module.exports = {
  create,
  setText
};
