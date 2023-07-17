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
import { PaymentOnCreation } from '../create/Create';

export const paymentAtom = atom<PaymentOnCreation | undefined>(undefined);
