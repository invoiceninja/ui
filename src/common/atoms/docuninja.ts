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
import { Account } from '../interfaces/docuninja/api';
// Main DocuNinja data atom - following the exact same pattern as expenses
export const docuNinjaAtom = atom<Account | undefined>(undefined);