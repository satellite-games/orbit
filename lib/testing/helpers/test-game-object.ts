import { GameObject, type Blueprint } from '@/game-object';
import { describe, expect, it } from 'vitest';

/**
 * Helper function to test game object instantiation.
 * @param constructor The game object constructor.
 * @param blueprints The blueprints to use for testing.
 */
export const testGameObject = async <TGameObject extends GameObject>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor: new (...args: any[]) => TGameObject,
  blueprints: Array<Blueprint<TGameObject>>,
) => {
  describe(`Generic tests for ${constructor.name}`, () => {
    it(`should instantiate '${constructor.name}'`, () => {
      expect.assertions(blueprints.length);

      for (const blueprint of blueprints) {
        const gameObject = new constructor(blueprint);
        expect(gameObject).toBeDefined();
        expect(gameObject).toBeInstanceOf(constructor);
      }
    });
  });
};
