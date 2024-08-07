/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { GameObject } from '.';
import { Wagon, wagons } from 'internal-mocks/wagon.go';
import { Train, trains } from 'internal-mocks/train.go';
import { Stat, stats } from 'internal-mocks/stat.go';
import { Modifier } from '@/modifier';

describe('constructor', () => {
  it('should properly create a blueprint and its corresponding game objects', () => {
    const thomas = new Train(trains.thomas);
    expect(thomas).toBeInstanceOf(Train);
    expect(thomas.name).toBe(trains.thomas.name);
    expect(thomas.id).toBeDefined();
    expect(thomas.makeNoise()).toBe(trains.thomas.noise);
    expect(thomas.length).toBe(1);
  });

  it('should override the default values', () => {
    class CustomTrain extends Train {
      defaultValues(): Partial<CustomTrain> {
        return {
          noise: 'chug chug',
        };
      }
    }
    const thomas = new CustomTrain({ ...trains.thomas });
    expect(thomas.makeNoise()).toBe('toot toot');
  });

  it('should use the default value if not overridden', () => {
    class CustomTrain extends Train {
      defaultValues(): Partial<CustomTrain> {
        return {
          noise: 'chug chug',
        };
      }
    }
    const thomas = new CustomTrain({ name: 'train.thomas' });
    expect(thomas.makeNoise()).toEqual('chug chug');
  });
});

describe('getOwner', () => {
  it('should return the owner of the game object', () => {
    class Parent extends GameObject {}
    class Child extends GameObject {}
    const parent = new Parent({ name: 'parent' as any });
    const child = new Child({ name: 'child' as any, owner: parent });
    expect(child.getOwner<Parent>()).toBe(parent);
  });

  it("should return null if the game object doesn't have an owner", () => {
    class Child extends GameObject {}
    const child = new Child({ name: 'child' as any });
    expect(child.getOwner()).toBe(null);
  });
});

describe('setChildren/getChildren', () => {
  it('should set and return the children of a game object', () => {
    const thomas = new Train(trains.thomas);
    const wagon1 = new Wagon(wagons.small);
    const wagon2 = new Wagon(wagons.small);
    expect(thomas.getChildren<Train, Wagon>('wagon')).toEqual([]);
    thomas.setChildren<Train, Wagon>([wagon1, wagon2]);
    expect(thomas.getChildren<Train, Wagon>('wagon')).toEqual([wagon1, wagon2]);
  });

  it('should return an empty array if the game object has no children', () => {
    class EmptyObject extends GameObject {}
    const emptyObject = new EmptyObject({ name: 'parent' as any });
    expect(emptyObject.getChildren('child')).toEqual([]);
  });

  it('should throw an error when attempting to set an invalid collection of children', () => {
    class InvalidChild extends GameObject {}
    const thomas = new Train(trains.thomas);
    const invalidChildren = [new InvalidChild({ name: 'invalid-child' as any })];
    expect(() => {
      thomas.setChildren(invalidChildren as any);
    }).toThrowError();
  });
});

describe('addChild/removeChild', () => {
  it('should add and remove children', () => {
    const train = new Train(trains.thomas);
    const wagon1 = new Wagon(wagons.small);
    const wagon2 = new Wagon(wagons.small);
    // Let's add the children to the parent.
    train.addChild<Train, Wagon>(wagon1);
    expect(train.getChildren<Train, Wagon>('wagon')).toEqual([wagon1]);
    train.addChild<Train, Wagon>(wagon2);
    expect(train.getChildren<Train, Wagon>('wagon')).toEqual([wagon1, wagon2]);
    // Let's remove the children from the parent.
    train.removeChild<Train, Wagon>(wagon1);
    expect(train.getChildren<Train, Wagon>('wagon')).toEqual([wagon2]);
    train.removeChild<Train, Wagon>(wagon2);
    expect(train.getChildren<Train, Wagon>('wagon')).toEqual([]);
  });

  it('should fail when attempting to add an invalid child', () => {
    class InvalidChild extends GameObject {}
    const train = new Train(trains.thomas);
    const invalidChild = new InvalidChild({ name: 'invalid.child' as any });
    expect(() => {
      train.addChild(invalidChild as any);
    }).toThrowError();
  });
});

describe('findChildByName', () => {
  it('should return the child with the given name', () => {
    const train = new Train(trains.thomas);
    const wagon1 = new Wagon(wagons.small);
    const wagon2 = new Wagon(wagons.small);
    const stat1 = new Stat(stats.speed);
    const stat2 = new Stat(stats.power);
    train.setChildren<Train, Wagon>([wagon1, wagon2]);
    train.setChildren<Train, Stat>([stat1, stat2]);
    expect(train.findChildByName<Wagon>('wagon.small')).toBe(wagon1);
    expect(train.findChildByName<Stat>('stat.power')).toBe(stat2);
  });

  it("should return undefined if the child with the given name doesn't exist", () => {
    const train = new Train(trains.thomas);
    expect(train.findChildByName<Wagon>('wagon')).toBeUndefined();
  });
});

describe('findChildById', () => {
  it('should return the child with the given id', () => {
    const train = new Train(trains.thomas);
    const wagon1 = new Wagon(wagons.small);
    const stat1 = new Stat(stats.speed);
    const stat2 = new Stat(stats.power);
    train.setChildren<Train, Wagon>([wagon1]);
    train.setChildren<Train, Stat>([stat1, stat2]);
    expect(train.findChildById<Wagon>(wagon1.id)).toBe(wagon1);
    expect(train.findChildById<Stat>(stat1.id)).toBe(stat1);
    expect(train.findChildById<Stat>(stat2.id)).toBe(stat2);
  });

  it("should return undefined if the child with the given id doesn't exist", () => {
    const train = new Train(trains.thomas);
    const wagon1 = new Wagon(wagons.small);
    expect(train.findChildById<Wagon>(wagon1.id)).toBeUndefined();
  });
});

describe('getModifiersRecursively', () => {
  it('should return all modifiers of the game object and its children', () => {
    class RecursiveWagon extends Wagon {
      children: { wagon: Wagon[]; stat: Stat[] } = { wagon: [], stat: [] };
    }
    const train = new Train(trains.thomas);
    const wagon1 = new RecursiveWagon(wagons.large);
    const subWagon1 = new RecursiveWagon(wagons.small);
    wagon1.addChild<RecursiveWagon, RecursiveWagon>(subWagon1);
    const wagon2 = new RecursiveWagon(wagons.small);
    const subWagon2 = new RecursiveWagon(wagons.large);
    const subSubWagon2 = new RecursiveWagon(wagons.small);
    subWagon2.addChild<RecursiveWagon, RecursiveWagon>(subSubWagon2);
    wagon2.addChild<RecursiveWagon, RecursiveWagon>(subWagon2);
    train.setChildren<Train, RecursiveWagon>([wagon1, wagon2]);
    expect(train.getModifiersRecursively()).toEqual([
      ...(train.modifiers ?? []),
      ...(wagon1.modifiers ?? []),
      ...(subWagon1.modifiers ?? []),
      ...(wagon2.modifiers ?? []),
      ...(subWagon2.modifiers ?? []),
      ...(subSubWagon2.modifiers ?? []),
    ]);
  });
});

describe('getModifiedValue', () => {
  it('should fail when attempting to get modified value of a non-numeric property', () => {
    const train = new Train(trains.thomas);
    expect(() => {
      // @ts-expect-error We are intentionally passing an illegal property key.
      train.getModifiedValue<typeof train>('noise', []);
    }).toThrowError();
  });

  it('should fail when attempting to get modified value of a non-existing property', () => {
    const train = new Train(trains.thomas);
    expect(() => {
      // @ts-expect-error We are intentionally passing an illegal property key.
      train.getModifiedValue<typeof train>('does-not-exist', []);
    }).toThrowError();
  });
});

describe('getNonCircularCopy', () => {
  it('should return a copy of the game object without any owner references', () => {
    const train = new Train(trains.thomas);
    const wagon = new Wagon(wagons.small);
    train.addChild<Train, Wagon>(wagon);
    expect(train.findChildByName<Wagon>('wagon.small')?.getOwner()).toBe(train);
    const unwrappedTrain = train.getNonCircularCopy<typeof train>();
    expect(unwrappedTrain.findChildByName<Wagon>('wagon.small')?.getOwner()).toBe(undefined);
    // Should not modify the original object or any of its children
    expect(train.findChildByName<Wagon>('wagon.small')?.getOwner()).toBe(train);
  });

  it('should return a copy of a deep game object without any owner references', () => {
    const train = new Train(trains.thomas);
    const wagon = new Wagon(wagons.small);
    const stat = new Stat(stats.speed);
    wagon.addChild<Wagon, Stat>(stat);
    train.addChild<Train, Wagon>(wagon);
    expect(train.findChildById(wagon.id)?.getOwner()).toBe(train);
    expect(wagon.findChildById(stat.id)?.getOwner()).toBe(wagon);
    const unwrappedTrain = train.getNonCircularCopy<typeof train>();
    expect(unwrappedTrain.findChildById(wagon.id)?.getOwner()).toBe(undefined);
    expect(unwrappedTrain.findChildById(wagon.id)?.findChildById(stat.id)?.getOwner()).toBe(undefined);
    // Should not modify the original object or any of its children
    expect(train.findChildById(wagon.id)?.getOwner()).toBe(train);
    expect(wagon.findChildById(stat.id)?.getOwner()).toBe(wagon);
  });
});

describe('serialize', () => {
  it("should properly serialize the game object's properties without functions and getters", async () => {
    const train = new Train({
      ...trains.thomas,
      id: '1234',
    });
    const serializedTrain = await train.serialize();
    expect(serializedTrain).toBe(
      '{"name":"train.thomas","id":"1234","children":{"stat":[],"wagon":[]},"noise":"toot toot"}',
    );
  });

  it('should strip empty children from the game object, but keep non-empty children', async () => {
    class WithChildren extends GameObject {
      children: Record<string, any[]> = {
        trains: [],
      };
    }
    class WithoutChildren extends GameObject {}
    const withChildren = new WithChildren({ name: 'with-children' as any, id: '1234' });
    const withoutChildren = new WithoutChildren({ name: 'without-children' as any, id: '5678' });
    expect(await withChildren.serialize()).toBe('{"name":"with-children","id":"1234","children":{"trains":[]}}');
    expect(await withoutChildren.serialize()).toBe('{"name":"without-children","id":"5678"}');
  });

  it('should be able to serialize a deep object with circular references', async () => {
    const train = new Train({ ...trains.thomas, id: '1' });
    const wagon = new Wagon({ ...wagons.large, id: '2' });
    const stat = new Stat({ ...stats.speed, id: '3' });
    wagon.addChild<Wagon, Stat>(stat);
    train.addChild<Train, Wagon>(wagon);
    train.setChildren<Train, Stat>([new Stat({ ...stats.speed, id: '4' }), new Stat({ ...stats.power, id: '5' })]);
    // To make the assertion more readable we serialize and then perform a
    // flat parse. We don't perform an actual deserialization since it does
    // a bunch of stuff we're not interested in.
    const serialized = await train.serialize();
    expect(JSON.parse(serialized)).toEqual({
      name: 'train.thomas',
      id: '1',
      noise: 'toot toot',
      children: {
        stat: [
          '{"name":"stat.speed","id":"4","value":5,"max":10}',
          '{"name":"stat.power","id":"5","value":10,"max":10}',
        ],
        wagon: [
          '{"name":"wagon.large","id":"2","modifiers":[{"targetName":"stat.speed","keys":["value"],"amount":-3}],"dependencies":[{"dependencyName":"stat.power","value":5}],"children":{"stat":["{\\"name\\":\\"stat.speed\\",\\"id\\":\\"3\\",\\"value\\":5,\\"max\\":10}"]},"seats":200}',
        ],
      },
    });
    // Should not modify the original object or any of its children
    expect(train.getChildren('wagon')[0]).toBe(wagon);
  });

  it('should use an overridden beforeSerialize hook', async () => {
    class CustomGameObject extends GameObject {
      number = 24;

      beforeSerialize(object: typeof this): object {
        object.number = 42;
        return object;
      }
    }
    const customGameObject = new CustomGameObject({ name: 'custom-game-object' as any, id: '1' });
    expect(await customGameObject.serialize()).toBe('{"name":"custom-game-object","id":"1","number":42}');
  });
});

describe('addModifier/removeModifier', () => {
  it('should add the modifier', () => {
    const train = new Train({ ...trains.thomas });
    const modifier = new Modifier<Train>({
      targetName: train.name,
      keys: ['length'],
      amount: 1,
    });
    expect(train.modifiers).toBeUndefined();
    expect(train.getModifiersRecursively()).toEqual([]);
    expect(train.addModifier(modifier)).toEqual([modifier]);
    expect(train.modifiers).toEqual([modifier]);
    expect(train.getModifiersRecursively()).toEqual([modifier]);
  });

  it('should remove modifiers', () => {
    const train = new Train({ ...trains.thomas });
    const modifier1 = new Modifier<Train>({
      targetName: train.name,
      keys: ['length'],
      amount: 1,
    });
    const modifier2 = new Modifier<Train>({
      targetName: train.name,
      keys: ['length'],
      amount: 1,
    });
    expect(train.modifiers).toBeUndefined();
    expect(train.addModifier(modifier1)).toEqual([modifier1]);
    expect(train.addModifier(modifier2)).toEqual([modifier1, modifier2]);
    expect(train.modifiers).toEqual([modifier1, modifier2]);
    expect(train.removeModifier(modifier1)).toEqual([modifier2]);
    expect(train.modifiers).toEqual([modifier2]);
    expect(train.removeModifier(modifier2)).toEqual([]);
    expect(train.modifiers).toBeUndefined();
  });

  it("should do nothing when attempting to remove a modifier that isn't there", () => {
    const train = new Train({ ...trains.thomas });
    const modifier = new Modifier<Train>({
      targetName: train.name,
      keys: ['length'],
      amount: 1,
    });
    expect(train.modifiers).toBeUndefined();
    expect(train.removeModifier(modifier)).toEqual([]);
    expect(train.modifiers).toBeUndefined();
  });
});
