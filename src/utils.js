function seq(n) {
  return new Array(n).fill(true).map((_, i) => i);
}

function repeatString(str, n) {
  return seq(n)
    .map(() => str)
    .join('');
}

function zeroPad(len, n) {
  n = '' + n;
  const l = n.length;
  return [repeatString('0', len - l), n].join('');
}

function getSearch() {
  const s = window.location.search;
  const o = {};
  if (!s) {
    return o;
  }
  const arr = s.substring(1).split('&');
  arr.forEach(s2 => {
    const pair = s2.split('=');
    o[pair[0]] = decodeURIComponent(pair[1]);
  });
  return o;
}

function getScroll() {
  const r = document.querySelector('canvas').getBoundingClientRect();
  return [r.left, r.top];
}

function keepBetween(v, m, M) {
  if (v < m) {
    return m;
  }
  if (v > M) {
    return M;
  }
  return v;
}

module.exports = {
  seq,
  repeatString,
  zeroPad,
  getSearch,
  getScroll,
  keepBetween
};
