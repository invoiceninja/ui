/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ValidationBag } from 'common/interfaces/validation-bag';
import { atom } from 'jotai';

export const companySettingsErrorsAtom = atom<ValidationBag | undefined>(
  undefined
);
