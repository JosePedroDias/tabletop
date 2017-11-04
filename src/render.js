const collision = require('./collision');

const DEG2RAD = Math.PI / 180;
const BG_COLOR = '#060';
const W = 1200;
const H = 1200;

const canvasEl = document.createElement('canvas');
canvasEl.setAttribute('width', W);
canvasEl.setAttribute('height', H);
document.body.appendChild(canvasEl);
const ctx = canvasEl.getContext('2d');

let lastAlpha = 1;
let PENDING_IMAGES = 0;
const IMAGES = {};

function fixQuadOrder(quad) {
  const [a, b] = quad;
  return [
    [a[0] < b[0] ? a[0] : b[0], a[1] < b[1] ? a[1] : b[1]],
    [a[0] > b[0] ? a[0] : b[0], a[1] > b[1] ? a[1] : b[1]]
  ];
}

function render({ objects, quad = undefined }) {
  let didRender = true;

  function tryRerender() {
    if (PENDING_IMAGES === 0) {
      render({ objects, quad });
    }
  }

  lastAlpha = 1;
  ctx.globalAlpha = 1;
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, W, H);

  let q0, q1;
  if (quad) {
    quad = fixQuadOrder(quad);
    [q0, q1] = quad;
  }

  if (quad) {
    SELECTED_OBJECTS = [];
  }

  objects.forEach(o => {
    const imgUrl = o.image;
    let imgEl;

    if (imgUrl) {
      imgEl = IMAGES[imgUrl];

      if (!imgEl) {
        const imgEl2 = document.createElement('img');
        imgEl2.src = imgUrl;
        ++PENDING_IMAGES;
        imgEl2.onload = () => {
          // console.log("loaded %s", imgUrl);
          --PENDING_IMAGES;
          tryRerender();
        };
        imgEl2.onerror = () => {
          window.console.error('error loading %s', imgUrl);
          --PENDING_IMAGES;
          tryRerender();
        };
        IMAGES[imgUrl] = imgEl2;
        didRender = false;
        return;
      }

      if (o.alpha !== lastAlpha) {
        ctx.globalAlpha = o.alpha;
        lastAlpha = o.alpha;
      }
    }

    const isSelected = quad && collision.pointInRect(o.position, quad);

    if (isSelected) {
      ctx.strokeStyle = '#F0F';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const poly = collision.getPoly(o);
      poly.forEach((p, i) => ctx[i === 0 ? 'moveTo' : 'lineTo'](p[0], p[1]));
      ctx.lineTo(poly[0][0], poly[0][1]);
      ctx.stroke();
      SELECTED_OBJECTS.push(o);
    }

    ctx.save();
    ctx.translate(o.position[0], o.position[1]);
    if (o.rotation !== 0) {
      ctx.rotate(DEG2RAD * o.rotation);
    }
    if (o.scale !== 1) {
      ctx.scale(o.scale, o.scale);
    }
    if (imgUrl) {
      ctx.drawImage(imgEl, -o.dimensions[0] / 2, -o.dimensions[1] / 2);
    } else {
      ctx.font = '40px sans-serif';
      ctx.fillStyle = '#000';
      ctx.fillText(o.text, 2, 2);
      ctx.fillStyle = o.color;
      ctx.fillText(o.text, 0, 0);
      if (o.dimensions[1] === 1) {
        o.dimensions = [
          Math.round(ctx.measureText(o.text, 0, 0).width),
          o.scale * 40
        ];
      }
    }
    ctx.restore();
  });

  if (quad && q0) {
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FF0';
    ctx.beginPath();
    ctx.rect(q0[0], q0[1], q1[0] - q0[0], q1[1] - q0[1]);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // console.log(SELECTED_OBJECTS);

  // console.log("didRender? %s", didRender);

  /* console.log(
      "render %s %s",
      new Date().valueOf(),
      q0 ? "w/quad" : "wo/quad"
    ); */

  return didRender;
}

module.exports = {
  render,
  ctx,
  W,
  H
};
