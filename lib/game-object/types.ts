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
 * The unified type for all available game object names. Defaults to `string`,
 * but consumers can override this type to a more specific type if desired.
 */
export type GameObjectName = string;

/**
 * The unified type for all available game object type names. A game object type name
 * corresponds to a game object sub class. Defaults to `string`, but consumers can
 * override this type to a more specific type if desired.
 */
export type GameObjectTypeName = string;

/**
 * A registry of game objects. The key is the game object set name and the value.
 * Consumers should override this type to represent their own game object sets.
 */
export type GameObjectRegistry = Record<GameObjectName, GameObject>;
