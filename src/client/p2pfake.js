function noop() {}

module.exports = function(/* a, b */) {
  return {
    broadcast: noop,
    send: noop,
    on: noop,
    isReady: false,
    ids: [],
    peers: []
  };
};
