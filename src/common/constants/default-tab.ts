/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export const DEFAULT_TABS = ['products', 'tasks'] as const;

export type DefaultTab = (typeof DEFAULT_TABS)[number];

export const DEFAULT_TAB: DefaultTab = 'products';
