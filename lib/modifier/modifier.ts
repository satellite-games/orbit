import type { NonFunctionPropertyNames, NumericProperty } from '@/types/private-types';
import type { GameObject } from '@/game-object';
import type { GameObjectName } from '@/main';
/**
 * Modifiers are used to increase or decrease specific values of a game object.
 * They are commonly used to modify character stats like primary or secondary attributes
 * or item values like damage or accuracy
 */
export class Modifier<TModifiedGameObject extends GameObject | unknown> {
  /*
   * The name of the game object that is being modified.
   */
  declare targetName: GameObjectName;
  /**
   * The unique identifier of the game object that is being modified. This is optional. If none
   * is provided, the modifier will be applied to all game objects matching `modifiedName`.
   */
  declare targetId?: string;
  /**
   * The key of the value that is being modified. Must be a property key of the modified game object.
   * Can also be multiple keys.
   */
  declare keys: NumericProperty<TModifiedGameObject> | NumericProperty<TModifiedGameObject>[];
  /**
   * The amount by which the value is modified. This can be positive or negative.
   */
  declare amount: number;

  constructor(init: Pick<Modifier<TModifiedGameObject>, NonFunctionPropertyNames<Modifier<TModifiedGameObject>>>) {
    Object.assign(this, init);
  }

  /**
   * Returns the modified keys as an array.
   */
  getModifiedKeys(): NumericProperty<TModifiedGameObject>[] {
    return Array.isArray(this.keys) ? this.keys : [this.keys];
  }

  /**
   * Returns the modified value of the specified key by applying all matching modifiers to the
   * given game object.
   * @param gameObject The game object to get the modified value for.
   * @param key The key of the value to get the modified value for.
   * @param modifiers The modifiers to apply to the value. Will be filtered for matching modifiers.
   * @returns The modified value.
   */
  static applyModifiers<TGameObject extends GameObject>(
    gameObject: TGameObject,
    key: NumericProperty<TGameObject>,
    modifiers: Modifier<TGameObject>[],
  ) {
    const unmodifiedValue = gameObject[key as keyof typeof gameObject];
    if (typeof unmodifiedValue !== 'number') {
      throw new Error(
        `${gameObject.constructor.name}.${key as string} is not a numeric property and thus cannot be modified.`,
      );
    }
    const matchingModifiers = modifiers.filter((modifier) => {
      if (modifier.targetId) {
        return modifier.targetId === gameObject.id && modifier.getModifiedKeys().includes(key);
      } else {
        return modifier.targetName === gameObject.name && modifier.getModifiedKeys().includes(key);
      }
    });
    let modifiedValue = unmodifiedValue as number;
    for (const modifier of matchingModifiers) {
      modifiedValue += modifier.amount;
    }
    return modifiedValue;
  }
}
