/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';
import { GameObject } from '../game-object';
import { Dependency } from './dependency';
import { Modifier } from '@/modifier';

class UnrelatedObject extends GameObject {
  name = 'unrelated.object' as any;
}
class DependencyTarget extends GameObject {
  name = 'dependency.target' as any;
  hello = 'world';
  answer = 42;
}
class Entity extends GameObject {
  name = 'entity' as any;
  children = {
    unrelated: [new UnrelatedObject({} as any)],
    dependency: [new DependencyTarget({} as any)],
  } as any;
}

describe('regular dependencies', () => {
  class Dependent extends GameObject {
    name = 'depending.object' as any;
    declare dependencies: Dependency<DependencyTarget>[];
  }

  it('should pass if the dependency is met (existence check)', () => {
    const dependent = new Dependent({} as any);
    dependent.dependencies = [
      new Dependency({
        dependencyName: 'dependency.target',
      }),
    ];
    const entity = new Entity({} as any);
    const result = dependent.checkDependencies(entity);
    expect(result).toBe(true);
  });

  it("should fail if the dependency isn't met (existence check)", () => {
    const dependent = new Dependent({} as any);
    dependent.dependencies = [
      new Dependency({
        dependencyName: 'dependency.nonexistent',
      }),
    ];
    const entity = new Entity({} as any);
    const result = dependent.checkDependencies(entity);
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(1);
  });

  it('should pass if the dependency is met (exact value check)', () => {
    const dependent = new Dependent({} as any);
    dependent.dependencies = [
      new Dependency({
        dependencyName: 'dependency.target',
        key: 'hello',
        value: 'world',
      }),
    ];
    const entity = new Entity({} as any);
    const result = dependent.checkDependencies(entity);
    expect(result).toBe(true);
  });

  it("should fail if the dependency isn't met (exact value check)", () => {
    const dependent = new Dependent({} as any);
    dependent.dependencies = [
      new Dependency({
        dependencyName: 'dependency.target',
        key: 'hello',
        value: 'universe',
      }),
    ];
    const entity = new Entity({} as any);
    const result = dependent.checkDependencies(entity);
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(1);
  });

  it('should pass if the dependency is met (numeric value check)', () => {
    const dependent = new Dependent({} as any);
    dependent.dependencies = [
      new Dependency({
        dependencyName: 'dependency.target',
        key: 'answer',
        value: 32,
      }),
    ];
    const entity = new Entity({} as any);
    const result = dependent.checkDependencies(entity);
    expect(result).toBe(true);
  });

  it("should fail if the dependency isn't met (numeric value check)", () => {
    const dependent = new Dependent({} as any);
    dependent.dependencies = [
      new Dependency({
        dependencyName: 'dependency.target',
        key: 'answer',
        value: 52,
      }),
    ];
    const entity = new Entity({} as any);
    const result = dependent.checkDependencies(entity);
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(1);
  });

  it('should check against the modified value and pass (numeric value check)', () => {
    const dependent = new Dependent({} as any);
    dependent.dependencies = [
      new Dependency({
        dependencyName: 'dependency.target',
        key: 'answer',
        value: 52,
      }),
    ];
    const entity = new Entity({} as any);
    entity.modifiers = [
      new Modifier<DependencyTarget>({
        targetName: 'dependency.target' as any,
        keys: ['answer'],
        amount: 10,
      }),
    ];
    const result = dependent.checkDependencies(entity);
    expect(result).toBe(true);
  });

  it('should check against the modified value and fail (numeric value check)', () => {
    const dependent = new Dependent({} as any);
    dependent.dependencies = [
      new Dependency({
        dependencyName: 'dependency.target',
        key: 'answer',
        value: 52,
      }),
    ];
    dependent.modifiers = [
      new Modifier<DependencyTarget>({
        targetName: 'dependency.target' as any,
        keys: ['answer'],
        amount: -10,
      }),
    ];
    const entity = new Entity({} as any);
    const result = dependent.checkDependencies(entity);
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(1);
  });

  it('should fail if the referenced child collection does not exist on the entity', () => {
    const dependent = new Dependent({} as any);
    dependent.dependencies = [
      new Dependency({
        dependencyName: 'non-existent.collection',
      }),
    ];
    const entity = new Entity({} as any);
    const result = dependent.checkDependencies(entity);
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(1);
  });

  it("should throw an error if the dependency references a value that doesn't exist", () => {
    const dependent = new Dependent({} as any);
    dependent.dependencies = [
      new Dependency({
        dependencyName: 'dependency.target',
        key: 'non-existent' as any,
        value: 'foo',
      }),
    ];
    const entity = new Entity({} as any);
    expect(() => dependent.checkDependencies(entity)).toThrow();
  });
});

describe('conflict dependencies', () => {
  class Conflict extends GameObject {
    name = 'conflicting.object' as any;
    declare dependencies: Dependency<DependencyTarget>[];
  }

  it('should pass if there is no conflict (existence check)', () => {
    const conflict = new Conflict({} as any);
    conflict.dependencies = [
      new Dependency({
        dependencyName: 'dependency.non-existing',
        isConflict: true,
      }),
    ];
    const entity = new Entity({} as any);
    const result = conflict.checkDependencies(entity);
    expect(result).toBe(true);
  });

  it('should fail if there is a conflict (existence check)', () => {
    const conflict = new Conflict({} as any);
    conflict.dependencies = [
      new Dependency({
        dependencyName: 'dependency.target',
        isConflict: true,
      }),
    ];
    const entity = new Entity({} as any);
    const result = conflict.checkDependencies(entity);
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(1);
  });

  it('should pass if there is no conflict (exact value check)', () => {
    const conflict = new Conflict({} as any);
    conflict.dependencies = [
      new Dependency({
        dependencyName: 'dependency.target',
        key: 'hello',
        value: 'universe',
        isConflict: true,
      }),
    ];
    const entity = new Entity({} as any);
    const result = conflict.checkDependencies(entity);
    expect(result).toBe(true);
  });

  it('should fail if there is a conflict (exact value check)', () => {
    const conflict = new Conflict({} as any);
    conflict.dependencies = [
      new Dependency({
        dependencyName: 'dependency.target',
        key: 'hello',
        value: 'world',
        isConflict: true,
      }),
    ];
    const entity = new Entity({} as any);
    const result = conflict.checkDependencies(entity);
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(1);
  });

  it('should pass if there is no conflict (numeric value check)', () => {
    const conflict = new Conflict({} as any);
    conflict.dependencies = [
      new Dependency({
        dependencyName: 'dependency.target',
        key: 'answer',
        value: 52,
        isConflict: true,
      }),
    ];
    const entity = new Entity({} as any);
    const result = conflict.checkDependencies(entity);
    expect(result).toBe(true);
  });

  it('should fail if there is a conflict (numeric value check)', () => {
    const conflict = new Conflict({} as any);
    conflict.dependencies = [
      new Dependency({
        dependencyName: 'dependency.target',
        key: 'answer',
        value: 32,
        isConflict: true,
      }),
    ];
    const entity = new Entity({} as any);
    const result = conflict.checkDependencies(entity);
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(1);
  });

  it('should check against the modified value and pass (numeric value check)', () => {
    const conflict = new Conflict({} as any);
    conflict.dependencies = [
      new Dependency({
        dependencyName: 'dependency.target',
        key: 'answer',
        value: 42,
        isConflict: true,
      }),
    ];
    const entity = new Entity({} as any);
    entity.modifiers = [
      new Modifier<DependencyTarget>({
        targetName: 'dependency.target' as any,
        keys: ['answer'],
        amount: -10,
      }),
    ];
    const result = conflict.checkDependencies(entity);
    expect(result).toBe(true);
  });

  it('should check against the modified value and fail (numeric value check)', () => {
    const conflict = new Conflict({} as any);
    conflict.dependencies = [
      new Dependency({
        dependencyName: 'dependency.target',
        key: 'answer',
        value: 42,
        isConflict: true,
      }),
    ];
    const entity = new Entity({} as any);
    entity.modifiers = [
      new Modifier<DependencyTarget>({
        targetName: 'dependency.target' as any,
        keys: ['answer'],
        amount: 10,
      }),
    ];
    const result = conflict.checkDependencies(entity);
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(1);
  });

  it('should pass if the referenced child collection does not exist on the entity', () => {
    const conflict = new Conflict({} as any);
    conflict.dependencies = [
      new Dependency({
        dependencyName: 'non-existent.collection',
        isConflict: true,
      }),
    ];
    const entity = new Entity({} as any);
    expect(conflict.checkDependencies(entity)).toBe(true);
  });

  it("should throw an error if the dependency references a value that doesn't exist", () => {
    const conflict = new Conflict({} as any);
    conflict.dependencies = [
      new Dependency({
        dependencyName: 'dependency.target',
        key: 'non-existent' as any,
        value: 'foo',
        isConflict: true,
      }),
    ];
    const entity = new Entity({} as any);
    expect(() => conflict.checkDependencies(entity)).toThrow();
  });
});
