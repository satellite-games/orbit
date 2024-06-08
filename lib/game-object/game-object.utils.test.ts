import { describe, expect, it } from 'vitest';
import { getGameObjectTypeName } from './game-object.utils';

describe('getCollectionName', () => {
  it('should return the correct collection name for any given name', () => {
    expect(getGameObjectTypeName('foo')).toBe('foo');
    expect(getGameObjectTypeName('foo.bar')).toBe('foo');
    expect(getGameObjectTypeName('foo.bar.baz')).toBe('foo.bar');
    expect(getGameObjectTypeName('foo.foz.bar.baz')).toBe('foo.foz.bar');
    expect(getGameObjectTypeName('character.origin.earth-urban')).toBe('character.origin');
  });
});
