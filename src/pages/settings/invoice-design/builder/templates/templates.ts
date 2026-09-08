/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { TemplateFactory, TemplateTranslator } from './registry';
import { createTemplateRegistry } from './registry';

const definitions = import.meta.glob<TemplateFactory>(
  './definitions/**/*.template.ts',
  { eager: true, import: 'default' }
);

export function createTemplates(t: TemplateTranslator) {
  return createTemplateRegistry(
    Object.values(definitions).map((define) => define(t))
  );
}
