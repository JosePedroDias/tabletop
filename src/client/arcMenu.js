const collision = require('../shared/collision');
const render = require('./render');
const utils = require('../shared/utils');

const PI2 = Math.PI * 2;

const bgColor = '#AAC';
const dismissBgColor = '#A88';
const textFont = '20px sans-serif';
const textColor = '#000';
const strokeColor = '#000';

function arcMenu(OPTS) {
  const { center, radius, innerRadius, options, onClick, dismissable } = OPTS;

  const numOpts = options.length;

  const polys = [];

  const arcAngle = PI2 / numOpts;
  const stepsPerArc = Math.ceil(32 / numOpts);
  const midRadius = innerRadius + (radius - innerRadius) / 2;

  function toP(r, angle) {
    return [
      Math.round(center[0] + r * Math.cos(angle)),
      Math.round(center[1] + r * Math.sin(angle))
    ];
  }

  function onDown(ev) {
    const scroll = utils.getScroll();
    const p = [ev.clientX - scroll[0], ev.clientY - scroll[1]];
    const idx = collision.collidePolysPoint(polys, p);

    if (Number.isFinite(idx)) {
      if (idx < numOpts) {
        onClick(options[idx], idx);
      } else {
        onClick(undefined);
      }
    }
  }

  function setup() {
    utils.seq(numOpts).forEach(i => {
      const poly = [];
      const angle0 = arcAngle * i;
      utils.seq(stepsPerArc + 1).forEach(j => {
        const p = toP(innerRadius, angle0 + j / stepsPerArc * arcAngle);
        poly.push(p);
      });
      utils.seq(stepsPerArc + 1).forEach(j => {
        const p = toP(radius, angle0 + (1 - j / stepsPerArc) * arcAngle);
        poly.push(p);
      });
      poly.reverse();
      polys.push(poly);
    });

    if (dismissable) {
      const poly = [];
      const stepsD = stepsPerArc * numOpts;
      utils.seq(stepsD + 1).forEach((j, i) => {
        const p = toP(innerRadius, i / stepsD * PI2);
        poly.push(p);
      });
      polys.push(poly);
    }

    document.addEventListener('mousedown', onDown);
  }

  function kill() {
    document.removeEventListener('mousedown', onDown);
  }

  function draw() {
    const ctx = render.ctx;

    // console.log("menu draw %s %s", numOpts, Math.random());
    // console.log("menu draw %s", Math.random(), options);
    ctx.font = textFont;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    utils.seq(numOpts).forEach(i => {
      const angle0 = arcAngle * i;
      const poly = polys[i];
      ctx.fillStyle = bgColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      poly.forEach((p, j) => ctx[j ? 'lineTo' : 'moveTo'](p[0], p[1]));
      ctx.fill();
      ctx.beginPath();
      poly.forEach((p, j) => ctx[j ? 'lineTo' : 'moveTo'](p[0], p[1]));
      ctx.stroke();

      const midAngle = angle0 + arcAngle / 2;
      const labelCenter = toP(midRadius, midAngle);
      ctx.fillStyle = textColor;
      const op = options[i];
      const label = op instanceof Array ? op[0] : op;
      ctx.fillText(label, labelCenter[0], labelCenter[1]);
    });

    if (dismissable) {
      ctx.fillStyle = dismissBgColor;
      const poly = polys[polys.length - 1];
      ctx.beginPath();
      poly.forEach((p, i) => ctx[i ? 'lineTo' : 'moveTo'](p[0], p[1]));
      ctx.fill();

      ctx.fillStyle = textColor;
      ctx.fillText('close', center[0], center[1]);
    }
  }

  setup();
  draw();

  return { draw, kill };
}

const RADIUSES = [40, 140];

function menu(OPTS) {
  const selected = [];
  const { center, options, onClick } = OPTS;
  let rm;

  const { W, H } = render;

  center[0] = utils.keepBetween(center[0], RADIUSES[1], W - RADIUSES[1]);
  center[1] = utils.keepBetween(center[1], RADIUSES[1], H - RADIUSES[1]);

  function doStep(options2) {
    rm = arcMenu({
      center,
      innerRadius: RADIUSES[0],
      radius: RADIUSES[1],
      options: options2,
      onClick(o) {
        // console.warn("temp click", o);
        if (!o) {
          rm.kill();
          return onClick();
        }
        rm.kill();

        if (o instanceof Array) {
          const [label, subLabels] = o;
          selected.push(label);
          if (typeof subLabels === 'function') {
            selected.push(subLabels(selected));
            return onClick(selected);
          }
          doStep(subLabels);
        } else {
          selected.push(o);
          onClick(selected);
        }
      },
      dismissable: true
    });
  }

  doStep(options);
}

module.exports = {
  arcMenu,
  menu
};
