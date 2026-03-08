/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Resource } from '$app/components/PreviousNextNavigation';
import { atom } from 'jotai';

interface FullTableLatestData {
  type: string;
  resources: Resource[];
}

export const invalidationQueryAtom = atom<string | undefined>(undefined);
export const fullTableLatestDataAtom = atom<FullTableLatestData | undefined>(
  undefined
);
