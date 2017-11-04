const random = require('../random').deterministic;

const card = require('./card')(random);

describe('card', () => {
  random.setSeed(42);
  const c1 = card.create();
  const c2 = card.create();
  const c3 = card.create({
    suit: 's',
    value: 'a',
    back: 'red',
    isFlipped: true
  });

  describe('constants', () => {
    it('SUITS', () => {
      expect(card.SUITS).toEqual(['h', 'd', 'c', 's']);
    });

    it('VALUES', () => {
      expect(card.VALUES).toEqual([
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        'j',
        'q',
        'k',
        'a'
      ]);
    });

    it('BACKS', () => {
      expect(card.BACKS).toEqual(['blue', 'green', 'red']);
    });
  });

  describe('create', () => {
    it('validate structure', () => {
      expect(c1).toMatchSnapshot();
      expect(c2).toMatchSnapshot();
      expect(c3).toMatchSnapshot();
    });

    it('validate suits', () => {
      expect(c1).toHaveProperty('data.suit', 'h');
      expect(c2).toHaveProperty('data.suit', 's');
      expect(c3).toHaveProperty('data.suit', 's');
    });

    it('validate values', () => {
      expect(c1).toHaveProperty('data.value', '4');
      expect(c2).toHaveProperty('data.value', '9');
      expect(c3).toHaveProperty('data.value', 'a');
    });
  });

  describe('actions', () => {
    it('flip()', () => {
      const cc1 = card.flip(c1);
      const cc2 = card.flip(c2);
      const cc3 = card.flip(c3);

      expect(cc1).toHaveProperty('data.isFlipped', true);
      expect(cc2).toHaveProperty('data.isFlipped', true);
      expect(cc3).toHaveProperty('data.isFlipped', false);

      expect(cc1).toMatchSnapshot();
      expect(cc2).toMatchSnapshot();
      expect(cc3).toMatchSnapshot();
    });
  });
});
