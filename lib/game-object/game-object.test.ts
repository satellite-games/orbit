/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { GameObject } from '.';
import { Wagon, wagons } from 'internal-mocks/wagon.go';
import { Train, trains } from 'internal-mocks/train.go';
import { Stat, stats } from 'internal-mocks/stat.go';

describe('constructor', () => {
  it('should properly create a blueprint and its corresponding game objects', () => {
    const thomas = new Train(trains.thomas);
    expect(thomas).toBeInstanceOf(Train);
    expect(thomas.name).toBe(trains.thomas.name);
    expect(thomas.id).toBeDefined();
    expect(thomas.makeNoise()).toBe(trains.thomas.noise);
    expect(thomas.length).toBe(1);
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
      children: Record<'wagon', Wagon[]> = { wagon: [] };
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

describe('serialize', () => {
  it("should properly serialize the game object's properties without functions and getters", () => {
    const train = new Train({
      ...trains.thomas,
      id: '1234',
    });
    const serializedTrain = train.serialize();
    expect(serializedTrain).toBe(
      '{"name":"train.thomas","id":"1234","children":{"stat":[],"wagon":[]},"noise":"toot toot"}',
    );
  });

  it('should strip empty children from the game object, but keep non-empty children', () => {
    class WithChildren extends GameObject {
      children: Record<string, any[]> = {
        trains: [],
      };
    }
    class WithoutChildren extends GameObject {}
    const withChildren = new WithChildren({ name: 'with-children' as any, id: '1234' });
    const withoutChildren = new WithoutChildren({ name: 'without-children' as any, id: '5678' });
    expect(withChildren.serialize()).toBe('{"name":"with-children","id":"1234","children":{"trains":[]}}');
    expect(withoutChildren.serialize()).toBe('{"name":"without-children","id":"5678"}');
  });

  it('should be able to serialize a deep object with circular references', () => {
    const train = new Train({ ...trains.thomas, id: '1' });
    const wagon = new Wagon({ ...wagons.large, id: '2' });
    train.addChild<Train, Wagon>(wagon);
    train.setChildren<Train, Stat>([new Stat({ ...stats.speed, id: '3' }), new Stat({ ...stats.power, id: '4' })]);
    // To make the assertion more readable we serialize and then perform a
    // flat parse. We don't perform an actual deserialization since it does
    // a bunch of stuff we're not interested in.
    const serialized = train.serialize();
    expect(JSON.parse(serialized)).toEqual({
      name: 'train.thomas',
      id: '1',
      noise: 'toot toot',
      children: {
        stat: [
          '{"name":"stat.speed","id":"3","value":5,"max":10}',
          '{"name":"stat.power","id":"4","value":10,"max":10}',
        ],
        wagon: [
          '{"name":"wagon.large","id":"2","modifiers":[{"targetName":"stat.speed","keys":["value"],"amount":-3}],"dependencies":[{"dependencyName":"stat.power","value":5}],"seats":200}',
        ],
      },
    });
  });

  it('should use an overridden beforeSerialize hook', () => {
    class CustomGameObject extends GameObject {
      number = 24;

      beforeSerialize(object: typeof this): object {
        object.number = 42;
        return object;
      }
    }
    const customGameObject = new CustomGameObject({ name: 'custom-game-object' as any, id: '1' });
    expect(customGameObject.serialize()).toBe('{"name":"custom-game-object","id":"1","number":42}');
  });
});
