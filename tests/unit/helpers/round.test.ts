import { describe, it, expect } from 'vitest';
import { roundToPrecision } from '../../../src/common/helpers/invoices/round';

describe('roundToPrecision', () => {
  it('rounds half up for positive numbers', () => {
    expect(roundToPrecision(2.345, 2)).toEqual(2.35);
    expect(roundToPrecision(2.355, 2)).toEqual(2.36);
    expect(roundToPrecision(2.125, 2)).toEqual(2.13);
    expect(roundToPrecision(2.135, 2)).toEqual(2.14);
  });

  it('rounds half up for negative numbers', () => {
    expect(roundToPrecision(-2.345, 2)).toEqual(-2.35);
    expect(roundToPrecision(-2.355, 2)).toEqual(-2.36);
  });

  it('handles zero precision', () => {
    expect(roundToPrecision(2.5, 0)).toEqual(3);
    expect(roundToPrecision(2.4, 0)).toEqual(2);
    expect(roundToPrecision(-2.5, 0)).toEqual(-3);
  });

  it('handles higher precision', () => {
    expect(roundToPrecision(2.3456, 3)).toEqual(2.346);
    expect(roundToPrecision(2.3454, 3)).toEqual(2.345);
  });

  it('handles values already at precision', () => {
    expect(roundToPrecision(2.34, 2)).toEqual(2.34);
    expect(roundToPrecision(0, 2)).toEqual(0);
    expect(roundToPrecision(100, 2)).toEqual(100);
  });

  it('handles very small values', () => {
    expect(roundToPrecision(0.005, 2)).toEqual(0.01);
    expect(roundToPrecision(0.004, 2)).toEqual(0);
    expect(roundToPrecision(0.015, 2)).toEqual(0.02);
  });

  it('defaults to precision 2', () => {
    expect(roundToPrecision(2.345)).toEqual(2.35);
    expect(roundToPrecision(2.344)).toEqual(2.34);
  });
});
