const DEG2RAD = Math.PI / 180;

const rpip = require('robust-point-in-polygon');

function pointInRect(p, r) {
  return (
    p[0] >= r[0][0] && p[0] <= r[1][0] && p[1] >= r[0][1] && p[1] <= r[1][1]
  );
}

/* function getRect(o) {
  const x = o.position[0];
  const y = o.position[1];
  const s = o.scale;
  const dx = s * o.dimensions[0] / 2;
  const dy = s * o.dimensions[1] / 2;
  return [[x - dx, x + dx], [y - dy, y + dy]];
} */

function getPoly(o) {
  const x = o.position[0];
  const y = o.position[1];
  const dx = o.dimensions[0] / 2;
  const dy = o.dimensions[1] / 2;
  const s = o.scale;
  const a = o.rotation * DEG2RAD;
  return [[-dx, -dy], [dx, -dy], [dx, dy], [-dx, dy]].map(p => [
    Math.round(x + s * (p[0] * Math.cos(a) - p[1] * Math.sin(a))),
    Math.round(y + s * (p[0] * Math.sin(a) + p[1] * Math.cos(a)))
  ]);
}

function collideObjectPoint(o, p) {
  // const r = getRect(o);
  // return pointInRect(p, r);

  const poly = getPoly(o);
  // console.log(JSON.stringify(poly));
  const result = rpip(poly, p) !== 1;
  // console.log("w/ p:%s -> %s", JSON.stringify(p), result ? "T" : "F");
  return result;
}

function collideObjectsPoint(objects, p) {
  for (let i = objects.length - 1; i >= 0; --i) {
    const o = objects[i];
    if (collideObjectPoint(o, p)) {
      return o;
    }
  }
}

function collidePolysPoint(polys, p) {
  for (let i = polys.length - 1; i >= 0; --i) {
    const poly = polys[i];
    if (rpip(poly, p) !== 1) {
      return i;
    }
  }
}

module.exports = {
  pointInRect,
  getPoly,
  collideObjectsPoint,
  collidePolysPoint
};
