import type { NonFunctionPropertyNames } from '@/types/private-types';
import type { GameObject } from './game-object';

/**
 * The initiator object is used for instantiating a new game object from a blueprint or a saved object.
 */
export type GameObjectInit<TGameObject extends GameObject, TOmitted extends keyof TGameObject = never> = Omit<
  Pick<TGameObject, NonFunctionPropertyNames<TGameObject>>,
  'id' | 'children' | TOmitted
> & { id?: TGameObject['id'] };

/**
 * A blueprint is the template for a game object. It defines its schema,
 * but does not contain any instance-specific data or functions. Further properties
 * can be omitted.
 */
export type Blueprint<TGameObject extends GameObject, TOmitted extends keyof TGameObject = never> = Omit<
  GameObjectInit<TGameObject, TOmitted>,
  'id' | 'owner' | 'children'
>;

/**
 * A saved object is a game object that has been serialized to a data format.
 * It contains all the data of the game object, but not its functions.
 * In contrast to a Blueprint, a saved object contains the unique identifier of the game object.
 * Further properties can be omitted.
 */
export type Saved<TGameObject extends GameObject, TOmitted extends keyof TGameObject = never> = Omit<
  GameObjectInit<TGameObject, TOmitted>,
  'id' | 'owner' | 'children'
> &
  Required<Pick<TGameObject, 'id'>>;
/**
 * An entry of `GameObjectRegistry`. Use this type together with `GameObjectRegistry`
 * to register new `GameObject`s.
 */
export type GameObjectRegistryEntry<T extends GameObject, U extends string> = {
  type: T;
  names: U[];
};

/**
 * The registry of `GameObject`s. Use this interface together with `GameObjectRegistryEntry`
 * to register new `GameObject`s.
 * @example
 * class MyGameObject extends GameObject {
 *   // ...
 * }
 * type MyGameObjectName = 'my-game-object.foo' | 'my-game-object.bar';
 *
 * interface GameObjectRegistry {
 *   'my-game-object': GameObjectRegistryEntry<MyGameObject, MyGameObjectName>;
 * }
 */
export interface GameObjectRegistry {}

/**
 * The key of `GameObjectRegistry`. Represents the unique key of a `GameObject` class.
 */
export type GameObjectKey = keyof GameObjectRegistry;

/**
 * Represents all possible values for a `GameObject`s `name` property. Usually, this is a union
 * of all blueprint names of a `GameObject`.
 */
export type GameObjectName = GameObjectRegistry[GameObjectKey]['names'][number];
