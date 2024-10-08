/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Invoice } from '$app/common/interfaces/invoice';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Card } from '$app/components/cards';
import { EInvoiceGenerator } from '$app/components/e-invoice/EInvoiceGenerator';
import { EInvoiceComponent } from '$app/pages/settings';
import { Dispatch, RefObject, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';

export interface Context {
  invoice: Invoice | undefined;
  setInvoice: Dispatch<SetStateAction<Invoice | undefined>>;
  isDefaultTerms: boolean;
  setIsDefaultTerms: Dispatch<SetStateAction<boolean>>;
  isDefaultFooter: boolean;
  setIsDefaultFooter: Dispatch<SetStateAction<boolean>>;
  errors: ValidationBag | undefined;
  eInvoiceRef: RefObject<EInvoiceComponent> | undefined;
}
export default function EInvoice() {
  const [t] = useTranslation();

  const context: Context = useOutletContext();

  const { invoice, setInvoice, eInvoiceRef } = context;

  return (
    <Card title={t('e_invoice')}>
      {invoice?.e_invoice && (
        <EInvoiceGenerator
          ref={eInvoiceRef}
          entityLevel
          currentEInvoice={invoice.e_invoice}
          invoice={invoice}
          setInvoice={setInvoice}
        />
      )}
    </Card>
  );
}
