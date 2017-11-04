const defaultObject = require('./default');

function factory(/* random */) {
  function create({ value = 0, color = '#FFF' } = {}) {
    const o = {
      kind: 'counter',
      text: value,
      color,
      data: {
        value
      }
    };
    o.__proto__ = defaultObject;

    return o;
  }

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

  return {
    create,
    setValue,
    increment,
    reset
  };
}

module.exports = factory;
