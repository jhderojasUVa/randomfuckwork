/**
 * Utility types for type-level programming
 */

/**
 * DeepRequired makes all nested properties of T required (non-optional)
 * @template T - The type to make deeply required
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: DeepRequired<T[P]>;
};

/**
 * Nullable type allows T or null
 * @template T - The base type
 */
export type Nullable<T> = T | null;

/**
 * Optional type allows T or undefined
 * @template T - The base type
 */
export type Optional<T> = T | undefined;

/**
 * Maybe type allows T, null, or undefined
 * @template T - The base type
 */
export type Maybe<T> = T | null | undefined;

/**
 * Readonly deep makes all nested properties read-only
 * @template T - The type to make deeply readonly
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

/**
 * Extract keys of type T that have values of type V
 * @template T - The object type to extract from
 * @template V - The value type to match
 */
export type KeysWithValueType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];
