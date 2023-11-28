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
import { Settings } from '$app/common/interfaces/company.interface';

interface Record {
  design_id: string;
  entity: string;
}

export interface LiveDesign{
  entity_type: string;
  design_id: string;
  client_id: string;
  group_id: string;
  settings: Settings | null;
  settings_type: string;
  entity_id: string | null;
}

export const updatingRecordsAtom = atom<Record[]>([]);

const defaultDesign:LiveDesign = {
  client_id: '-1',
  entity_type: 'invoice',
  group_id: '-1',
  settings: null,
  settings_type: 'company',
  entity_id: null,
  design_id: '-1',
}

export const liveDesignAtom = atom<LiveDesign>(defaultDesign)