/* eslint-disable @typescript-eslint/ban-types */
/**
 * Extracts the names of all non-function properties of a type.
 */
export type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
} extends { [_ in keyof T]: infer U }
  ? U
  : never;
