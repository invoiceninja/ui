import { describe, it, expect } from 'vitest';
import {
  buildTagFilterColumns,
  omitFilterColumnValue,
} from '../../../src/common/helpers/tag-filter-columns';
import { Tag } from '../../../src/common/interfaces/tag';

function tag(overrides: Partial<Tag> = {}): Tag {
  return {
    id: 'tag-id',
    entity_type: 'invoice',
    name: 'Tag',
    color: '#000000',
    is_deleted: false,
    archived_at: 0,
    created_at: 0,
    updated_at: 0,
    ...overrides,
  };
}

describe('buildTagFilterColumns', () => {
  it('returns a single tag filter column with the given id and the tag_ids query identifier', () => {
    const columns = buildTagFilterColumns([], 'invoice_tag_ids');

    expect(columns).toHaveLength(1);
    expect(columns[0].column_id).toBe('invoice_tag_ids');
    expect(columns[0].query_identifier).toBe('tag_ids');
  });

  it('maps active tags to { label, value } options', () => {
    const columns = buildTagFilterColumns(
      [
        tag({ id: '1', name: 'Alpha' }),
        tag({ id: '2', name: 'Beta' }),
      ],
      'client_tag_ids'
    );

    expect(columns[0].options).toEqual([
      { label: 'Alpha', value: '1' },
      { label: 'Beta', value: '2' },
    ]);
  });

  it('excludes deleted and archived tags', () => {
    const columns = buildTagFilterColumns(
      [
        tag({ id: '1', name: 'Active' }),
        tag({ id: '2', name: 'Deleted', is_deleted: true }),
        tag({ id: '3', name: 'Archived', archived_at: 123 }),
      ],
      'quote_tag_ids'
    );

    expect(columns[0].options).toEqual([{ label: 'Active', value: '1' }]);
  });

  it('returns empty options when tags are undefined', () => {
    const columns = buildTagFilterColumns(undefined, 'vendor_tag_ids');

    expect(columns[0].options).toEqual([]);
  });
});

describe('omitFilterColumnValue', () => {
  it('removes the given key and keeps the rest', () => {
    const result = omitFilterColumnValue(
      { invoice_tag_ids: ['a'], client_id: ['b'] },
      'invoice_tag_ids'
    );

    expect(result).toEqual({ client_id: ['b'] });
  });

  it('is a no-op when the key is absent', () => {
    const result = omitFilterColumnValue({ client_id: ['b'] }, 'invoice_tag_ids');

    expect(result).toEqual({ client_id: ['b'] });
  });

  it('does not mutate the input object', () => {
    const input = { invoice_tag_ids: ['a'], client_id: ['b'] };
    omitFilterColumnValue(input, 'invoice_tag_ids');

    expect(input).toEqual({ invoice_tag_ids: ['a'], client_id: ['b'] });
  });
});
