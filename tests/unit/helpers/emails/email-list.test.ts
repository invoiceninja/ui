import { describe, test, expect } from 'vitest';
import {
  joinEmailList,
  limitEmailList,
  parseEmailList,
} from '../../../../src/common/helpers/emails/email-list';

describe('Email list helpers', () => {
  test('parses an empty value', () => {
    expect(parseEmailList('')).toEqual([]);
    expect(parseEmailList(undefined)).toEqual([]);
    expect(parseEmailList(null)).toEqual([]);
  });

  test('parses a single email address', () => {
    expect(parseEmailList('david@gmail.com')).toEqual(['david@gmail.com']);
  });

  test('parses emails separated by supported delimiters', () => {
    expect(
      parseEmailList(
        'david@gmail.com,jim@gmail.com;jane@gmail.com joe@gmail.com'
      )
    ).toEqual([
      'david@gmail.com',
      'jim@gmail.com',
      'jane@gmail.com',
      'joe@gmail.com',
    ]);
  });

  test('parses emails separated by new lines and tabs', () => {
    expect(
      parseEmailList('david@gmail.com\njim@gmail.com\tjane@gmail.com')
    ).toEqual(['david@gmail.com', 'jim@gmail.com', 'jane@gmail.com']);
  });

  test('ignores empty entries and surrounding whitespace', () => {
    expect(parseEmailList('  david@gmail.com ,, ; jim@gmail.com  ')).toEqual([
      'david@gmail.com',
      'jim@gmail.com',
    ]);
  });

  test('removes case insensitive duplicates keeping the first entry', () => {
    expect(
      parseEmailList('David@gmail.com,david@gmail.com,jim@gmail.com')
    ).toEqual(['David@gmail.com', 'jim@gmail.com']);
  });

  test('joins emails into a comma separated list', () => {
    expect(joinEmailList([])).toBe('');
    expect(joinEmailList(['david@gmail.com', 'jim@gmail.com'])).toBe(
      'david@gmail.com,jim@gmail.com'
    );
  });

  test('parsing a joined list returns the original emails', () => {
    const emails = ['david@gmail.com', 'jim@gmail.com', 'jane@gmail.com'];

    expect(parseEmailList(joinEmailList(emails))).toEqual(emails);
  });

  test('limits the list to the given number of emails', () => {
    const emails = [
      'david@gmail.com',
      'jim@gmail.com',
      'jane@gmail.com',
      'joe@gmail.com',
      'john@gmail.com',
    ];

    expect(limitEmailList(emails, 4)).toEqual(emails.slice(0, 4));
    expect(limitEmailList(emails, 5)).toEqual(emails);
    expect(limitEmailList(emails, 10)).toEqual(emails);
  });

  test('keeps the list untouched when no limit is given', () => {
    const emails = ['david@gmail.com', 'jim@gmail.com'];

    expect(limitEmailList(emails)).toBe(emails);
    expect(limitEmailList(emails, 0)).toBe(emails);
  });
});
