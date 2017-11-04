const _ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');

let _seed = 0x2f6e2b1;

function _rndDefault() {
  return Math.random();
}

function _rndDeterministic() {
  _seed = (_seed + 0x7ed55d16 + (_seed << 12)) & 0xffffffff;
  _seed = (_seed ^ 0xc761c23c ^ (_seed >>> 19)) & 0xffffffff;
  _seed = (_seed + 0x165667b1 + (_seed << 5)) & 0xffffffff;
  _seed = ((_seed + 0xd3a2646c) ^ (_seed << 9)) & 0xffffffff;
  _seed = (_seed + 0xfd7046c5 + (_seed << 3)) & 0xffffffff;
  _seed = (_seed ^ 0xb55a4f09 ^ (_seed >>> 16)) & 0xffffffff;
  return (_seed & 0xfffffff) / 0x10000000;
}

function generateAPI(rnd) {
  function float(n) {
    return rnd() * n;
  }

  function int(n) {
    return ~~(rnd() * n);
  }

  function fromArray(arr) {
    const i = int(arr.length);
    return arr[i];
  }

  function id(len) {
    return new Array(len)
      .fill(true)
      .map(() => fromArray(_ALPHABET))
      .join('');
  }

  function setSeed(seed) {
    _seed = seed;
  }

  return {
    float,
    int,
    fromArray,
    id,
    setSeed
  };
}

module.exports = {
  deterministic: generateAPI(_rndDeterministic),
  default: generateAPI(_rndDefault)
};
