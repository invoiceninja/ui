/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { atom } from 'jotai';

export interface SimplifiedClientDraft {
  first_name: string;
  last_name: string;
  email: string;
  name: string;
  phone: string;
  address1: string;
  city: string;
  postal_code: string;
  country_id: string;
}

export const emptyClientDraft: SimplifiedClientDraft = {
  first_name: '',
  last_name: '',
  email: '',
  name: '',
  phone: '',
  address1: '',
  city: '',
  postal_code: '',
  country_id: '',
};

export const clientDraftAtom = atom<SimplifiedClientDraft | null>(null);

export function isClientDraftDirty(draft: SimplifiedClientDraft | null): boolean {
  if (!draft) return false;
  return Object.values(draft).some((v) => typeof v === 'string' && v.length > 0);
}
