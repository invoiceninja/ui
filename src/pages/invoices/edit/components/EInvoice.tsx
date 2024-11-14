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
import { Dispatch, RefObject, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { EInvoiceValidationAlert } from './EInvoiceValidationAlert';
import { ValidationEntityResponse } from '$app/pages/settings/e-invoice/common/hooks/useCheckEInvoiceValidation';
import { InvoiceEntityValidationButton } from './InvoiceEntityValidationButton';

export interface Context {
  invoice: Invoice | undefined;
  setInvoice: Dispatch<SetStateAction<Invoice | undefined>>;
  isDefaultTerms: boolean;
  setIsDefaultTerms: Dispatch<SetStateAction<boolean>>;
  isDefaultFooter: boolean;
  setIsDefaultFooter: Dispatch<SetStateAction<boolean>>;
  errors: ValidationBag | undefined;
  eInvoiceRef: RefObject<EInvoiceComponent> | undefined;
  eInvoiceValidationEntityResponse: ValidationEntityResponse | undefined;
}
export default function EInvoice() {
  const [t] = useTranslation();

  const context: Context = useOutletContext();

  const { invoice, setInvoice, eInvoiceRef, eInvoiceValidationEntityResponse } =
    context;

  const [currentInvoiceErrors, setCurrentInvoiceErrors] = useState<string[]>(
    []
  );

  return (
    <>
      {Boolean(
        eInvoiceValidationEntityResponse?.passes === false && invoice
      ) && (
        <EInvoiceValidationAlert
          validationResponse={eInvoiceValidationEntityResponse}
          clientId={invoice?.client_id as string}
          currentInvoiceErrors={currentInvoiceErrors}
          invoiceId={invoice?.id as string}
        />
      )}

      <Card
        title={t('e_invoice')}
        topRight={
          <InvoiceEntityValidationButton
            invoice={invoice}
            setCurrentInvoiceErrors={setCurrentInvoiceErrors}
          />
        }
      >
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
    </>
  );
}
