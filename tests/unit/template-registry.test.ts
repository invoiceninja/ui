import { describe, expect, it } from 'vitest';
import {
  createTemplateRegistry,
  type TemplateDefinition,
} from '../../src/pages/settings/invoice-design/builder/templates/registry';
import { createTemplates } from '../../src/pages/settings/invoice-design/builder/templates/templates';

const { templates } = createTemplates((key) => key);

function definition(id: string, order?: number): TemplateDefinition {
  return {
    id,
    name: id,
    description: '',
    category: 'modern',
    order,
    layout: { cols: 12, rowHeight: 20, margin: [10, 10] },
    blocks: [],
  };
}

describe('template registry', () => {
  it('preserves header tokens across locales without sharing mutable blocks', () => {
    const french = createTemplates((key) => `fr:${key}`);
    const german = createTemplates((key) => `de:${key}`);
    for (const template of french.templates) {
      const other = german.getTemplateById(template.id)!;
      expect(template.blocks).not.toBe(other.blocks);
      for (const block of template.blocks.filter(
        (block) => block.type === 'table'
      )) {
        const columns = block.properties.columns!;
        const otherColumns = other.blocks.find(({ id }) => id === block.id)!
          .properties.columns!;
        expect(columns.length).toBeGreaterThan(0);
        columns.forEach((column, index) => {
          expect(column.header).toMatch(/^\$product\..+_label$/);
          expect(otherColumns[index].header).toBe(column.header);
        });
        columns[0].header = 'Custom header';
        expect(otherColumns[0].header).toMatch(/^\$product\..+_label$/);
      }
    }
  });

  it('discovers the built-in definitions in their existing order', () => {
    expect(templates.map(({ id }) => id)).toEqual([
      'modern-professional',
      'clean-lined',
      'minimalist',
      'blank',
    ]);
  });

  it('sorts by order and ID without reordering the input', () => {
    const input = [definition('z'), definition('b', 10), definition('a', 10)];
    const registry = createTemplateRegistry(input);
    expect(registry.templates.map(({ id }) => id)).toEqual(['a', 'b', 'z']);
    expect(input.map(({ id }) => id)).toEqual(['z', 'b', 'a']);
  });

  it('rejects duplicate IDs instead of silently choosing a design', () => {
    expect(() =>
      createTemplateRegistry([definition('same'), definition('same')])
    ).toThrow('Duplicate invoice template ID: same');
  });

  it('looks up templates by ID and category', () => {
    const modern = definition('modern');
    const blank = { ...definition('blank'), category: 'blank' as const };
    const registry = createTemplateRegistry([modern, blank]);
    expect(registry.getTemplateById('modern')).toBe(modern);
    expect(registry.getTemplateById('missing')).toBeUndefined();
    expect(registry.getTemplatesByCategory('modern')).toEqual([modern]);
    expect(registry.getTemplatesByCategory('blank')).toEqual([blank]);
    expect(registry.getTemplatesByCategory('all')).toEqual(registry.templates);
    expect(registry.getTemplatesByCategory('missing')).toEqual([]);
  });
});
