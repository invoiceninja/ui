import { describe, expect, it } from 'vitest';
import { unwrapDefault } from '../../../src/common/helpers/unwrap-default';

describe('unwrapDefault', () => {
  it('preserves an already-unwrapped value', () => {
    const value = { answer: 42 };

    expect(unwrapDefault(value)).toBe(value);
  });

  it('unwraps a nested default produced by Rolldown', () => {
    const value = { answer: 42 };

    expect(unwrapDefault({ default: value })).toBe(value);
  });

  it('returns nullish candidates as-is', () => {
    expect(unwrapDefault(null)).toBeNull();
    expect(unwrapDefault(undefined)).toBeUndefined();
  });
});
