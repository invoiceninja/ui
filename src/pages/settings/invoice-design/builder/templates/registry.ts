/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { InvoiceTemplate } from '../types';

export interface TemplateDefinition extends InvoiceTemplate {
  /** Lower values appear first; ties are sorted by template ID. */
  order?: number;
}

export type TemplateTranslator = (key: string) => string;

export type TemplateFactory = (t: TemplateTranslator) => TemplateDefinition;

export function createTemplateRegistry(definitions: TemplateDefinition[]) {
  const templates: InvoiceTemplate[] = [...definitions].sort(
    (a, b) => (a.order ?? 100) - (b.order ?? 100) || a.id.localeCompare(b.id)
  );
  const byId = new Map<string, InvoiceTemplate>();

  for (const template of templates) {
    if (byId.has(template.id)) {
      throw new Error(`Duplicate invoice template ID: ${template.id}`);
    }
    byId.set(template.id, template);
  }

  return {
    templates,
    getTemplateById: (id: string): InvoiceTemplate | undefined => byId.get(id),
    getTemplatesByCategory: (category: string): InvoiceTemplate[] =>
      category === 'all'
        ? templates
        : templates.filter((template) => template.category === category),
  };
}
