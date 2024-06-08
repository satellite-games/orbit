import type { GameObjectName, GameObjectTypeName } from './types';

/**
 * Derives the `GameObjectTypeName` from the game object or blueprint's `name`.
 * @param GameObjectName The name of the game object or blueprint.
 * @returns The collection name.
 */
export function getGameObjectTypeName(name: string): GameObjectName {
  const parts = name.split('.');
  let result = '';
  if (parts.length === 1) return parts[0] as GameObjectTypeName;
  for (let i = 0; i < parts.length - 1; i++) {
    result += parts[i];
    if (i < parts.length - 2) result += '.';
  }
  return result as GameObjectTypeName;
}
