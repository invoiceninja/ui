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
import { Button } from '$app/components/forms';
import { useCheckEInvoiceValidation } from '$app/pages/settings/e-invoice/common/hooks/useCheckEInvoiceValidation';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  invoice: Invoice | undefined;
  setCurrentInvoiceErrors: Dispatch<SetStateAction<string[] | undefined>>;
}

export function InvoiceEntityValidationButton(props: Props) {
  const [t] = useTranslation();

  const { invoice, setCurrentInvoiceErrors } = props;

  const [checkValidation, setCheckValidation] = useState<boolean>(false);

  const { validationResponse } = useCheckEInvoiceValidation({
    resource: invoice,
    enableQuery: Boolean(invoice?.id?.length && checkValidation),
    checkInvoiceOnly: true,
    withToaster: true,
    onFinished: () => {
      setCheckValidation(false);
    },
  });

  useEffect(() => {
    if (validationResponse) {
      setCurrentInvoiceErrors(validationResponse.invoice);
    }
  }, [validationResponse]);

  return (
    <Button
      behavior="button"
      onClick={() => setCheckValidation(true)}
      disabled={checkValidation}
      disableWithoutIcon
    >
      {t('validate')}
    </Button>
  );
}
