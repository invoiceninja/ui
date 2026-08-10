/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { atom, useSetAtom } from 'jotai';
import { useEffect } from 'react';

export interface PaymentPageSaveAction {
  onClick: () => void;
  disabled?: boolean;
}

export const paymentPageSaveActionAtom = atom<PaymentPageSaveAction | null>(
  null
);

export function usePaymentPageSaveAction(
  options: PaymentPageSaveAction,
  deps: unknown[] = []
) {
  const setAction = useSetAtom(paymentPageSaveActionAtom);

  useEffect(() => {
    setAction(options);

    return () => setAction(null);
  }, deps);
}
