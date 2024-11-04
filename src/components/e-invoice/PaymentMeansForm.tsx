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
import { InputField, SelectField } from '../forms';
import {
  Dispatch,
  forwardRef,
  SetStateAction,
  useImperativeHandle,
  useState,
} from 'react';
import { Invoice } from '$app/common/interfaces/invoice';
import { cloneDeep, set } from 'lodash';
import { toast } from '$app/common/helpers/toast/toast';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { AxiosError } from 'axios';

type Entity = 'company' | 'invoice' | 'client';

interface Props {
  entity: Entity;
  currentEInvoice: EInvoiceType;
  isInvoiceLevel?: boolean;
  invoice?: Invoice | undefined;
  setInvoice?: Dispatch<SetStateAction<Invoice | undefined>>;
}

interface PaymentMeansFormComponent {
  saveEInvoice: () => void;
}

interface PaymentMeans {
  code: string;
  iban: string;
  bic: string;
  account_name: string;
  information: string;
  cardholder_name: string;
  card_type: string;
}

interface FormDetails {
  entity: Entity;
  payment_means: PaymentMeans;
}

const PAYMENT_MEANS_CODE_LIST = {
  1: 'Instrument not defined',
  2: 'Automated clearing house credit',
  3: 'Automated clearing house debit',
  4: 'ACH demand debit reversal',
  5: 'ACH demand credit reversal',
  6: 'ACH demand credit',
  7: 'ACH demand debit',
  8: 'Hold',
  9: 'National or regional clearing',
  10: 'In cash',
  11: 'ACH savings credit reversal',
  12: 'ACH savings debit reversal',
  13: 'ACH savings credit',
  14: 'ACH savings debit',
  15: 'Bookentry credit',
  16: 'Bookentry debit',
  17: 'ACH demand cash concentration/disbursement (CCD) credit',
  18: 'ACH demand cash concentration/disbursement (CCD) debit',
  19: 'ACH demand corporate trade payment (CTP) credit',
  20: 'Cheque',
  21: "Banker's draft",
  22: "Certified banker's draft",
  23: 'Bank cheque (issued by a banking or similar establishment)',
  24: 'Bill of exchange awaiting acceptance',
  25: 'Certified cheque',
  26: 'Local cheque',
  27: 'ACH demand corporate trade payment (CTP) debit',
  28: 'ACH demand corporate trade exchange (CTX) credit',
  29: 'ACH demand corporate trade exchange (CTX) debit',
  30: 'Credit transfer',
  31: 'Debit transfer',
  32: 'ACH demand cash concentration/disbursement plus (CCD+)',
  33: 'ACH demand cash concentration/disbursement plus (CCD+)',
  34: 'ACH prearranged payment and deposit (PPD)',
  35: 'ACH savings cash concentration/disbursement (CCD) credit',
  36: 'ACH savings cash concentration/disbursement (CCD) debit',
  37: 'ACH savings corporate trade payment (CTP) credit',
  38: 'ACH savings corporate trade payment (CTP) debit',
  39: 'ACH savings corporate trade exchange (CTX) credit',
  40: 'ACH savings corporate trade exchange (CTX) debit',
  41: 'ACH savings cash concentration/disbursement plus (CCD+)',
  42: 'Payment to bank account',
  43: 'ACH savings cash concentration/disbursement plus (CCD+)',
  44: 'Accepted bill of exchange',
  45: 'Referenced home-banking credit transfer',
  46: 'Interbank debit transfer',
  47: 'Home-banking debit transfer',
  48: 'Bank card',
  49: 'Direct debit',
  50: 'Payment by postgiro',
  51: 'FR, norme 6 97-Telereglement CFONB (French Organisation for',
  52: 'Urgent commercial payment',
  53: 'Urgent Treasury Payment',
  54: 'Credit card',
  55: 'Debit card',
  56: 'Bankgiro',
  57: 'Standing agreement',
  58: 'SEPA credit transfer',
  59: 'SEPA direct debit',
  60: 'Promissory note',
  61: 'Promissory note signed by the debtor',
  62: 'Promissory note signed by the debtor and endorsed by a bank',
  63: 'Promissory note signed by the debtor and endorsed by a',
  64: 'Promissory note signed by a bank',
  65: 'Promissory note signed by a bank and endorsed by another',
  66: 'Promissory note signed by a third party',
  67: 'Promissory note signed by a third party and endorsed by a',
  68: 'Online payment service',
  69: 'Transfer Advice',
  70: 'Bill drawn by the creditor on the debtor',
  74: 'Bill drawn by the creditor on a bank',
  75: 'Bill drawn by the creditor, endorsed by another bank',
  76: 'Bill drawn by the creditor on a bank and endorsed by a',
  77: 'Bill drawn by the creditor on a third party',
  78: 'Bill drawn by creditor on third party, accepted and',
  91: "Not transferable banker's draft",
  92: 'Not transferable local cheque',
  93: 'Reference giro',
  94: 'Urgent giro',
  95: 'Free format giro',
  96: 'Requested method for payment was not used',
  97: 'Clearing between partners',
  ZZZ: 'Mutually defined',
};

export const PaymentMeansForm = forwardRef<PaymentMeansFormComponent, Props>(
  (props, ref) => {
    const [t] = useTranslation();

    const [errors, setErrors] = useState<ValidationBag | null>(null);
    const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
    const [formDetails, setFormDetails] = useState<FormDetails>({
      entity: props.entity,
      payment_means: {
        code: '',
        iban: '',
        bic: '',
        account_name: '',
        information: '',
        cardholder_name: '',
        card_type: '',
      },
    });

    const onChange = (value: string, property: string) => {
      const updatedPaymentMeansForm = cloneDeep(formDetails) as FormDetails;
      set(updatedPaymentMeansForm, property, value);
      setFormDetails(updatedPaymentMeansForm);
    };

    const handleSave = () => {
      if (!isFormBusy) {
        toast.processing();
        setIsFormBusy(true);
        setErrors(null);

        request(
          'POST',
          endpoint('/api/v1/einvoice/configurations'),
          formDetails
        )
          .then(() => {
            toast.success('saved_einvoice_details');
          })
          .catch((error: AxiosError<ValidationBag>) => {
            if (error.response?.status === 422) {
              toast.dismiss();

              setErrors(error.response.data);

              return;
            }

            toast.error();
          })
          .finally(() => setIsFormBusy(false));
      }
    };

    useImperativeHandle(
      ref,
      () => {
        return {
          saveEInvoice() {
            handleSave();
          },
        };
      },
      [formDetails]
    );

    return (
      <div>
        <Element leftSide="Code">
          <SelectField
            value={formDetails.payment_means?.code || ''}
            onValueChange={(value) => onChange(value, 'payment_means.code')}
            customSelector
            errorMessage={errors?.errors['payment_means.code']}
          >
            {Object.entries(PAYMENT_MEANS_CODE_LIST).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </SelectField>
        </Element>

        <Element leftSide="IBAN">
          <InputField
            value={formDetails.payment_means?.iban || ''}
            onValueChange={(value) => onChange(value, 'payment_means.iban')}
            errorMessage={errors?.errors['payment_means.iban']}
          />
        </Element>

        <Element leftSide="BIC">
          <InputField
            value={formDetails.payment_means?.bic || ''}
            onValueChange={(value) => onChange(value, 'payment_means.bic')}
            errorMessage={errors?.errors['payment_means.bic']}
          />
        </Element>

        <Element leftSide={t('account_name')}>
          <InputField
            value={formDetails.payment_means?.account_name || ''}
            onValueChange={(value) =>
              onChange(value, 'payment_means.account_name')
            }
            errorMessage={errors?.errors['payment_means.account_name']}
          />
        </Element>

        <Element leftSide={t('information')}>
          <InputField
            value={formDetails.payment_means?.information || ''}
            onValueChange={(value) =>
              onChange(value, 'payment_means.information')
            }
            errorMessage={errors?.errors['payment_means.information']}
          />
        </Element>

        <Element leftSide={t('card_type')} required>
          <InputField
            value={formDetails.payment_means?.card_type || ''}
            onValueChange={(value) =>
              onChange(value, 'payment_means.card_type')
            }
            errorMessage={errors?.errors['payment_means.card_type']}
          />
        </Element>

        <Element leftSide={t('cardholder_name')} required>
          <InputField
            value={formDetails.payment_means?.cardholder_name || ''}
            onValueChange={(value) =>
              onChange(value, 'payment_means.cardholder_name')
            }
            errorMessage={errors?.errors['payment_means.cardholder_name']}
          />
        </Element>
      </div>
    );
  }
);
