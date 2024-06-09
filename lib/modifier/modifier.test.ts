import { describe, expect, it } from 'vitest';
import { Modifier } from './modifier';
import { Train, trains } from 'internal-mocks/train.go';
import { Stat, stats } from 'internal-mocks/stat.go';
import { Wagon, wagons } from 'internal-mocks/wagon.go';

describe('integrated modification', () => {
  it('should return the unmodified value', () => {
    const train = new Train(trains.thomas);
    const speed = new Stat(stats.speed);
    train.setChildren<Train, Stat>([speed]);
    expect(speed.getModifiedValue<Stat>('value', train)).toBe(5);
  });

  it('should return the positively modified value', () => {
    const train = new Train(trains.thomas);
    const wagon = new Wagon(wagons.small);
    const speed = new Stat(stats.speed);
    train.setChildren<Train, Stat>([speed]);
    train.setChildren<Train, Wagon>([wagon]);
    expect(speed.getModifiedValue<Stat>('value', train)).toBe(7);
  });

  it('should return the negatively modified value', () => {
    const train = new Train(trains.thomas);
    const wagon = new Wagon(wagons.large);
    const speed = new Stat(stats.speed);
    train.setChildren<Train, Stat>([speed]);
    train.setChildren<Train, Wagon>([wagon]);
    expect(speed.getModifiedValue<Stat>('value', train)).toBe(2);
  });

  it('should match the target using the game object id', () => {
    const train = new Train({ ...trains.thomas, id: '1' });
    const matchingModifier = new Modifier<Train>({
      targetId: '1',
      targetName: 'train.thomas',
      keys: 'length',
      amount: 1,
    });
    const nonMatchingModifier = new Modifier<Train>({
      targetId: '2',
      targetName: 'train.thomas',
      keys: 'length',
      amount: 1,
    });
    train.modifiers = [matchingModifier, nonMatchingModifier];
    expect(train.getModifiedValue<typeof train>('length')).toBe(2); // Not 3
  });

  it('should modify multiple keys', () => {
    const train = new Train(trains.thomas);
    const speed = new Stat(stats.speed);
    const modifier = new Modifier<Stat>({
      targetName: 'stat.speed',
      keys: ['value', 'max'],
      amount: -3,
    });
    train.setChildren<Train, Stat>([speed]);
    train.modifiers = [modifier];

    expect(speed.getModifiedValue<Stat>('value', train)).toBe(2);
    expect(speed.getModifiedValue<Stat>('max', train)).toBe(7);
  });

  it('should sum up multiple matching modifiers', () => {
    const train = new Train(trains.thomas);
    const speed = new Stat(stats.speed);
    const wagon1 = new Wagon(wagons.small);
    const wagon2 = new Wagon(wagons.small);
    const wagon3 = new Wagon(wagons.large);
    train.setChildren<Train, Stat>([speed]);
    train.setChildren<Train, Wagon>([wagon1, wagon2, wagon3]);
    expect(speed.getModifiedValue<Stat>('value')).toBe(6);
  });

  it('should return the unmodified value if no modifier matches', () => {
    const train = new Train(trains.thomas);
    train.modifiers = [
      new Modifier<Train>({
        targetName: 'train.polar-express',
        keys: 'length',
        amount: 1,
      }),
      new Modifier<Train>({
        targetName: 'train.thomas',
        // @ts-expect-error We are intentionally passing an illegal property key.
        keys: 'non-matching key',
        amount: 1,
      }),
      new Modifier<Train>({
        targetName: 'train.thomas',
        targetId: 'non-matching-id',
        keys: 'length',
        amount: 1,
      }),
    ];
    expect(train.getModifiedValue<Train>('length', train)).toBe(1);
  });
});
