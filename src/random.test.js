const random = require('./random');

describe('default', () => {
  const r = random.default;

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
});

describe('deterministic', () => {
  const r = random.deterministic;

  it('int()', () => {
    r.setSeed(42);
    const n = r.int(10);
    expect(Number.isFinite(n)).toBeTruthy();
    expect(n).toBeLessThan(10);
    expect(n).toBeGreaterThan(-1);
    expect(n).toBe(2);
  });

  it('float()', () => {
    r.setSeed(42);
    const n = r.float(100);
    expect(Number.isFinite(n)).toBeTruthy();
    expect(n).toBeLessThan(100);
    expect(n).toBeGreaterThanOrEqual(0);
    expect(n).toBeCloseTo(20.4);
  });

  it('id()', () => {
    r.setSeed(42);
    const id = r.id(4);
    expect(typeof id === 'string').toBeTruthy();
    expect(id.length).toBe(4);
    expect(id).toBe('hg65');
  });

  it('fromArray()', () => {
    r.setSeed(42);
    const arr = ['a', 'b', 'c', 'd', 'e', 'f'];
    const item = r.fromArray(arr);
    expect(arr.indexOf(item) === -1).toBeFalsy();
    expect(item).toBe('b');
  });

  it('setSeed()', () => {
    r.setSeed(33);
    expect(r.int(100)).toBe(57);
    r.setSeed(33);
    expect(r.int(100)).toBe(57);
  });
});
