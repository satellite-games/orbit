/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';
import { getGameObjectKey } from './game-object.utils';

describe('getCollectionName', () => {
  it('should return the correct collection name for any given name', () => {
    expect(getGameObjectKey('foo' as any)).toBe('foo');
    expect(getGameObjectKey('foo.bar' as any)).toBe('foo');
    expect(getGameObjectKey('foo.bar.baz' as any)).toBe('foo.bar');
    expect(getGameObjectKey('foo.foz.bar.baz' as any)).toBe('foo.foz.bar');
    expect(getGameObjectKey('character.origin.earth-urban' as any)).toBe('character.origin');
  });
});
