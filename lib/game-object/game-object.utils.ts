import type { GameObjectKey, GameObjectName } from './types';

/**
 * Derives the `GameObjectKey` from the game object or blueprint's `name`.
 * @param GameObjectName The name of the game object or blueprint.
 * @returns The collection name.
 */
export function getGameObjectKey(name: GameObjectName): GameObjectKey {
  const parts = (name as string).split('.');
  let result = '';
  if (parts.length === 1) return parts[0] as GameObjectKey;
  for (let i = 0; i < parts.length - 1; i++) {
    result += parts[i];
    if (i < parts.length - 2) result += '.';
  }
  return result as GameObjectKey;
}
