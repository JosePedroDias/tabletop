const random = require('../random').deterministic;

const dice = require('./dice')(random);

describe('dice', () => {
  random.setSeed(42);
  const d1 = dice.create();
  const d2 = dice.create();
  const d3 = dice.create({ face: '5', color: 'red' });

  describe('constants', () => {
    it('COLORS', () => {
      expect(dice.COLORS).toEqual(['red', 'white']);
    });

    it('FACES', () => {
      expect(dice.FACES).toEqual(['1', '2', '3', '4', '5', '6']);
    });
  });

  describe('create', () => {
    it('validate structure', () => {
      expect(d1).toMatchSnapshot();
      expect(d2).toMatchSnapshot();
      expect(d3).toMatchSnapshot();
    });

    it('validate faces', () => {
      expect(d1).toHaveProperty('data.face', '2');
      expect(d2).toHaveProperty('data.face', '6');
      expect(d3).toHaveProperty('data.face', '5');
    });

    it('validate colors', () => {
      expect(d1).toHaveProperty('data.color', 'red');
      expect(d2).toHaveProperty('data.color', 'white');
      expect(d3).toHaveProperty('data.color', 'red');
    });
  });

  describe('actions', () => {
    it('setFace()', () => {
      const dd1 = dice.setFace(d1, '1');
      const dd2 = dice.setFace(d2, '2');
      const dd3 = dice.setFace(d3, '3');

      expect(dd1).toHaveProperty('data.face', '1');
      expect(dd2).toHaveProperty('data.face', '2');
      expect(dd3).toHaveProperty('data.face', '3');

      expect(dd1).toMatchSnapshot();
      expect(dd2).toMatchSnapshot();
      expect(dd3).toMatchSnapshot();
    });

    it('roll()', () => {
      const dd1 = dice.roll(d1);
      const dd2 = dice.roll(d2);
      const dd3 = dice.roll(d3);

      expect(dd1).toHaveProperty('data.face', '4');
      expect(dd2).toHaveProperty('data.face', '2');
      expect(dd3).toHaveProperty('data.face', '5');

      expect(dd1).toMatchSnapshot();
      expect(dd2).toMatchSnapshot();
      expect(dd3).toMatchSnapshot();
    });
  });
});
