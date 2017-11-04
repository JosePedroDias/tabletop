const swarm = require('webrtc-swarm');
const signalhub = require('signalhub');

function noop() {}

const expectedEventTypes = 'connect disconnect data'.split(' ');

function p2p(channel, signalServer) {
  const knownPeersArr = [];
  const knownPeersHash = {};
  const callbacks = {
    connect: noop,
    disconnect: noop,
    data: noop
  };

  function broadcast(o) {
    knownPeersArr.forEach(p => {
      p.send(o);
    });
  }

  function send(id, o) {
    const p = knownPeersHash[id];
    if (p) {
      p.send(o);
    }
  }

  function on(event, cb) {
    if (expectedEventTypes.indexOf(event) === -1) {
      throw new Error(`Unexpected event type: ${event}!`);
    }
    callbacks[event] = cb;
  }

  const api = {
    broadcast,
    send,
    on,
    isReady: false,
    ids: [],
    peers: knownPeersArr
  };

  const hub = signalhub(channel, signalServer);

  const sw = swarm(hub, {
    // wrtc: require('wrtc') // don't need this if used in the browser
  });

  sw.on('peer', (peer, id) => {
    api.isReady = true;
    // console.log('+ peer %s. total: %s', id, sw.peers.length);
    knownPeersArr.push(peer);
    knownPeersHash[id] = peer;
    api.ids = Object.keys(knownPeersHash);
    callbacks.connect(id);
    peer.on('data', data => {
      callbacks.data(id, data.toString());
    });
  });

  sw.on('disconnect', (peer, id) => {
    // console.log('- peer %s. total: %s', id, sw.peers.length);
    delete knownPeersHash[id];
    knownPeersArr.splice(knownPeersArr.indexOf(peer), 1);
    api.ids = Object.keys(knownPeersHash);
    api.isReady = knownPeersArr.length > 0;
    callbacks.disconnect(id);
  });

  return api;
}

module.exports = p2p;
