import { beforeAll, describe, expect, it } from 'vitest';
import i18next from 'i18next';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { createTemplates } from '../../src/pages/settings/invoice-design/builder/templates/templates';
import { generateInvoiceHTML } from '../../src/pages/settings/invoice-design/builder/utils/html-generator';
import { SAMPLE_INVOICE_DATA } from '../../src/pages/settings/invoice-design/builder/utils/variable-replacer';
import { TableBlock } from '../../src/pages/settings/invoice-design/builder/components/blocks/TableBlock';
import type { TableBlock as TableBlockModel } from '../../src/pages/settings/invoice-design/builder/types';
import { LABEL_TRANSLATION_MAP } from '../../src/pages/settings/invoice-design/builder/utils/label-variables';

beforeAll(async () => {
  await i18next.init({
    lng: 'en',
    resources: {
      en: {
        translation: {
          quantity: 'Quantity',
          bill_to: 'Bill To',
          thanks: 'Thank you',
        },
      },
      fr: {
        translation: {
          quantity: 'Quantité',
          bill_to: 'Facturer à',
          thanks: 'Merci',
        },
      },
    },
    interpolation: { escapeValue: false },
  });
});

describe('invoice template locale boundaries', () => {
  it('renders the same saved tokens in each preview locale and preserves export tokens and custom text', async () => {
    const template = createTemplates((key) => key).getTemplateById(
      'modern-professional'
    )!;
    const table = template.blocks.find(
      (block) => block.type === 'table'
    ) as TableBlockModel;
    table.properties.columns![0].header = 'My custom header';

    for (const [locale, quantity, billTo, thanks] of [
      ['en', 'Quantity', 'Bill To', 'Thank you'],
      ['fr', 'Quantité', 'Facturer à', 'Merci'],
    ]) {
      await i18next.changeLanguage(locale);
      const preview = generateInvoiceHTML(template.blocks, SAMPLE_INVOICE_DATA);
      expect(preview).toContain(quantity);
      expect(preview).toContain(billTo);
      expect(preview).toContain(thanks);
      expect(preview).toContain('My custom header');
      expect(preview).not.toContain('$product.quantity_label');

      const reactPreview = renderToStaticMarkup(
        createElement(I18nextProvider, {
          i18n: i18next,
          children: createElement(TableBlock, { block: table }),
        })
      );
      expect(reactPreview).toContain(quantity);
      expect(reactPreview).toContain('My custom header');

      const exported = generateInvoiceHTML(template.blocks);
      expect(exported).toContain('$product.quantity_label');
      expect(exported).toContain('$bill_to_label');
      expect(exported).toContain('$footer_label');
      expect(exported).toContain('My custom header');
      expect(table.properties.columns![1].header).toBe(
        '$product.quantity_label'
      );
    }
  });

  it('maps all template label tokens to frontend translation keys', () => {
    for (const template of createTemplates((key) => key).templates) {
      const tokens =
        JSON.stringify(template.blocks).match(/\$[\w.]+_label\b/g) ?? [];
      for (const token of tokens) {
        expect(LABEL_TRANSLATION_MAP[token], token).toBeDefined();
      }
    }
  });
});
