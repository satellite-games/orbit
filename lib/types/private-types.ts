/* eslint-disable @typescript-eslint/ban-types */

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
