/* eslint-disable @typescript-eslint/ban-types */

import type { GameObject } from '@/game-object';

/**
 * Extracts the names of all non-function properties of a type.
 */
export type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
} extends { [_ in keyof T]: infer U }
  ? U
  : never;

export type NonNumberPropertyNames<T> = {
  [K in keyof T]: T[K] extends number ? never : K;
} extends { [_ in keyof T]: infer U }
  ? U
  : never;

/**
 * A numeric property of an object can potentially be modified by a modifier.
 */
export type NumericProperty<TObject = object> = keyof Omit<TObject, NonNumberPropertyNames<TObject>>;

export type ElementType<TArray> = TArray extends Array<infer Element> ? Element : never;

export type GameObjectName = string;

export type GameObjectTypeName = string;

/**
 * A registry of game objects. The key is the game object set name and the value.
 * Consumers should override this type to represent their own game object sets.
 */
export type GameObjectRegistry = Record<GameObjectName, GameObject>;
