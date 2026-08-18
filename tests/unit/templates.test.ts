import { describe, expect, it } from 'vitest';
import { templates } from '../../src/pages/settings/invoice-design/builder/templates/templates';
import { gridPositionsOverlap } from '../../src/pages/settings/invoice-design/builder/utils/grid/collisions';
import {
  replaceVariables,
  SAMPLE_INVOICE_DATA,
} from '../../src/pages/settings/invoice-design/builder/utils/variable-replacer';

const KNOWN_LABEL_TOKEN = /^\$[\w.]+_label$/;
const VARIABLE_TOKEN = /\$[\w.]+/g;

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectStrings);
  }

  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(collectStrings);
  }

  return [];
}

function isKnownVariableToken(token: string): boolean {
  if (token.startsWith('item.')) {
    return true;
  }

  if (KNOWN_LABEL_TOKEN.test(token)) {
    return true;
  }

  return replaceVariables(token, SAMPLE_INVOICE_DATA) !== token;
}

describe('invoice design templates', () => {
  it('uses unique block ids within each template', () => {
    for (const template of templates) {
      const ids = template.blocks.map((block) => block.id);

      expect(new Set(ids).size, template.name).toBe(ids.length);
    }
  });

  it('defines non-overlapping block positions', () => {
    for (const template of templates) {
      const positions = template.blocks.map((block) => block.gridPosition);

      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          expect(
            gridPositionsOverlap(positions[i], positions[j]),
            `${template.name}: blocks ${i} and ${j} overlap`
          ).toBe(false);
        }
      }
    }
  });

  it('only uses variable tokens the renderer can resolve', () => {
    for (const template of templates) {
      for (const block of template.blocks) {
        for (const text of collectStrings(block.properties)) {
          const tokens = text.match(VARIABLE_TOKEN) ?? [];

          for (const token of tokens) {
            expect(
              isKnownVariableToken(token),
              `${template.name}/${block.id}: unknown variable token ${token}`
            ).toBe(true);
          }
        }
      }
    }
  });
});
