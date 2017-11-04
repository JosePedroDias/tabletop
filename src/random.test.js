const random = require('./random');

const r = random.deterministic;

it('int()', () => {
  const n = r.int(10);
  expect(Number.isFinite(n)).toBeTruthy();
  expect(n).toBeLessThan(10);
  expect(n).toBeGreaterThan(-1);
});

it('float()', () => {
  const n = r.float(100);
  expect(Number.isFinite(n)).toBeTruthy();
  expect(n).toBeLessThan(100);
  expect(n).toBeGreaterThanOrEqual(0);
});

it('id()', () => {
  const id = r.id(4);
  expect(typeof id === 'string').toBeTruthy();
  expect(id.length).toBe(4);
});

it('fromArray()', () => {
  const arr = ['a', 'b', 'c'];
  const item = r.fromArray(arr);
  expect(arr.indexOf(item) === -1).toBeFalsy();
});
