/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { EInvoiceType } from '$app/pages/settings';
import { useTranslation } from 'react-i18next';
import { Element } from '../cards';
import { InputField } from '../forms';
import { useHandleCurrentCompanyChangeProperty } from '$app/pages/settings/common/hooks/useHandleCurrentCompanyChange';
import { Dispatch, SetStateAction } from 'react';
import { Invoice } from '$app/common/interfaces/invoice';
import { cloneDeep, set } from 'lodash';

interface Props {
  currentEInvoice: EInvoiceType;
  isInvoiceLevel?: boolean;
  invoice?: Invoice | undefined;
  setInvoice?: Dispatch<SetStateAction<Invoice | undefined>>;
}

export function PaymentMeansForm(props: Props) {
  const [t] = useTranslation();

  const { currentEInvoice, isInvoiceLevel, setInvoice, invoice } = props;

  const handleChange = useHandleCurrentCompanyChangeProperty();

  const onChange = (value: string, property: string) => {
    if (isInvoiceLevel && setInvoice && invoice) {
      const updatedInvoice = cloneDeep(invoice) as Invoice;

      set(updatedInvoice, property, value);

      setInvoice(updatedInvoice);
    } else {
      handleChange(property, value);
    }
  };

  return (
    <div>
      <Element leftSide={t('Code')}>
        <InputField
          value={
            currentEInvoice['Invoice.PaymentMeans.0.PaymentMeansCode.value'] ||
            ''
          }
          onValueChange={(value) =>
            onChange(
              value,
              'e_invoice.Invoice.PaymentMeans.0.PaymentMeansCode.value'
            )
          }
        />
      </Element>

      <Element leftSide={t('IBAN')}>
        <InputField
          value={
            currentEInvoice[
              'Invoice.PaymentMeans.0.PayeeFinancialAccount.ID.value'
            ] || ''
          }
          onValueChange={(value) =>
            onChange(
              value,
              'e_invoice.Invoice.PaymentMeans.0.PayeeFinancialAccount.ID.value'
            )
          }
        />
      </Element>

      <Element leftSide={t('BIC')}>
        <InputField
          value={
            currentEInvoice[
              'Invoice.PaymentMeans.0.PayeeFinancialAccount.FinancialInstitutionBranch.ID.value'
            ] || ''
          }
          onValueChange={(value) =>
            onChange(
              value,
              'e_invoice.Invoice.PaymentMeans.0.PayeeFinancialAccount.FinancialInstitutionBranch.ID.value'
            )
          }
        />
      </Element>
    </div>
  );
}
