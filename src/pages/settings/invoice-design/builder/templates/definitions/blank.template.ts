/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { TemplateFactory } from '../registry';

export default (() => ({
  order: 30,
  id: 'blank',
  name: 'Blank Canvas',
  description: 'Start from scratch with an empty template',
  category: 'blank',
  tags: ['Custom'],
  layout: {
    cols: 12,
    rowHeight: 20,
    margin: [10, 10],
    containerPadding: [20, 20],
  },
  blocks: [],
})) satisfies TemplateFactory;
