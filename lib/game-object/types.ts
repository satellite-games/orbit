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
