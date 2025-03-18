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
import { Card, Element } from '../cards';
import { InputField, SelectField } from '../forms';
import {
  Dispatch,
  forwardRef,
  SetStateAction,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { Invoice } from '$app/common/interfaces/invoice';
import { toast } from '$app/common/helpers/toast/toast';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { AxiosError } from 'axios';
import { useFormik } from 'formik';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { get } from 'lodash';
import { useRefreshCompanyUsers } from '$app/common/hooks/useRefreshCompanyUsers';

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
  bic_swift: string;
  account_holder: string;
  information: string;
  card_holder: string;
  card_type: string;
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

const PAYMENT_MEANS_FORM_ELEMENTS = {
  '1': [], // Instrument not defined
  '2': ['iban', 'bic_swift'], // ACH credit
  '3': ['payer_bank_account', 'iban', 'bic_swift'], // ACH debit
  '4': ['payer_bank_account', 'iban', 'bic_swift'], // ACH demand debit reversal
  '5': ['iban', 'bic_swift'], // ACH demand credit reversal
  '6': ['iban', 'bic_swift'], // ACH demand credit
  '7': ['payer_bank_account', 'iban', 'bic_swift'], // ACH demand debit
  '8': [], // Hold
  '9': ['iban', 'bic_swift'], // National or regional clearing
  '10': [], // In cash
  '11': ['iban', 'bic_swift'], // ACH savings credit reversal
  '12': ['payer_bank_account', 'iban', 'bic_swift'], // ACH savings debit reversal
  '13': ['iban', 'bic_swift'], // ACH savings credit
  '14': ['payer_bank_account', 'iban', 'bic_swift'], // ACH savings debit
  '15': ['account_holder', 'bsb_sort'], // Bookentry credit
  '16': ['account_holder', 'bsb_sort'], // Bookentry debit
  '17': ['iban', 'bic_swift'], // ACH demand CCD credit
  '18': ['payer_bank_account', 'iban', 'bic_swift'], // ACH demand CCD debit
  '19': ['iban', 'bic_swift'], // ACH demand CTP credit
  '20': [], // Cheque
  '21': [], // Banker's draft
  '22': [], // Certified banker's draft
  '23': [], // Bank cheque
  '24': [], // Bill of exchange awaiting acceptance
  '25': [], // Certified cheque
  '26': [], // Local cheque
  '27': ['payer_bank_account', 'iban', 'bic_swift'], // ACH demand CTP debit
  '28': ['iban', 'bic_swift'], // ACH demand CTX credit
  '29': ['payer_bank_account', 'iban', 'bic_swift'], // ACH demand CTX debit
  '30': ['iban', 'bic_swift', 'account_holder'], // Credit transfer
  '31': ['iban', 'bic_swift', 'account_holder'], // Debit transfer
  '32': ['iban', 'bic_swift', 'account_holder'], // ACH demand CCD+ credit
  '33': ['payer_bank_account', 'iban', 'bic_swift', 'account_holder'], // ACH demand CCD+ debit
  '34': ['iban', 'bic_swift', 'account_holder'], // ACH PPD
  '35': ['iban', 'bic_swift', 'account_holder'], // ACH savings CCD credit
  '36': ['payer_bank_account', 'iban', 'bic_swift', 'account_holder'], // ACH savings CCD debit
  '37': ['iban', 'bic_swift', 'account_holder'], // ACH savings CTP credit
  '38': ['payer_bank_account', 'iban', 'bic_swift', 'account_holder'], // ACH savings CTP debit
  '39': ['iban', 'bic_swift', 'account_holder'], // ACH savings CTX credit
  '40': ['payer_bank_account', 'iban', 'bic_swift', 'account_holder'], // ACH savings CTX debit
  '41': ['iban', 'bic_swift', 'account_holder'], // ACH savings CCD+ credit
  '42': ['iban', 'bic_swift', 'account_holder'], // Payment to bank account
  '43': ['payer_bank_account', 'iban', 'bic_swift', 'account_holder'], // ACH savings CCD+ debit
  '44': [], // Accepted bill of exchange
  '45': ['iban', 'bic_swift'], // Referenced home-banking credit transfer
  '46': ['iban', 'bic_swift'], // Interbank debit transfer
  '47': ['iban', 'bic_swift'], // Home-banking debit transfer
  '48': ['card_type', 'card_number'], // Bank card
  '49': ['payer_bank_account', 'iban', 'bic_swift'], // Direct debit
  '50': ['account_holder'], // Payment by postgiro
  '51': ['iban', 'bic_swift'], // FR, norme 6 97-Telereglement CFONB
  '52': ['iban', 'bic_swift'], // Urgent commercial payment
  '53': ['iban', 'bic_swift'], // Urgent Treasury Payment
  '54': ['card_type', 'card_number', 'card_holder'], // Credit card
  '55': ['card_type', 'card_number', 'card_holder'], // Debit card
  '56': ['account_holder'], // Bankgiro
  '57': ['iban', 'bic_swift'], // Standing agreement
  '58': ['iban', 'bic_swift'], // SEPA credit transfer
  '59': ['payer_bank_account', 'iban', 'bic_swift'], // SEPA direct debit
  '60': [], // Promissory note
  '61': [], // Promissory note signed by debtor
  '62': ['bic_swift'], // Promissory note signed by debtor and endorsed by bank
  '63': [], // Promissory note signed by debtor and endorsed
  '64': ['bic_swift'], // Promissory note signed by bank
  '65': ['bic_swift'], // Promissory note signed by bank and endorsed by another
  '66': [], // Promissory note signed by third party
  '67': ['bic_swift'], // Promissory note signed by third party and endorsed by bank
  '68': ['iban'], // Online payment service
  '69': ['iban', 'bic_swift'], // Transfer Advice
  '70': [], // Bill drawn by creditor on debtor
  '74': ['bic_swift'], // Bill drawn by creditor on bank
  '75': ['bic_swift'], // Bill drawn by creditor, endorsed by bank
  '76': ['bic_swift'], // Bill drawn by creditor on bank and endorsed
  '77': [], // Bill drawn by creditor on third party
  '78': [], // Bill drawn by creditor on third party, accepted
  '91': [], // Not transferable banker's draft
  '92': [], // Not transferable local cheque
  '93': ['iban', 'bic_swift'], // Reference giro
  '94': ['iban', 'bic_swift'], // Urgent giro
  '95': ['iban', 'bic_swift'], // Free format giro
  '96': [], // Requested method not used
  '97': ['account_holder'], // Clearing between partners
  ZZZ: [], // Mutually defined
};

// public static array $payment_means_requirements_codes = [
//     '1' => [], // Instrument not defined
//     '2' => ['iban', 'bic_swift'], // ACH credit
//     '3' => ['payer_bank_account', 'iban', 'bic_swift'], // ACH debit
//     '4' => ['payer_bank_account', 'iban', 'bic_swift'], // ACH demand debit reversal
//     '5' => ['iban', 'bic_swift'], // ACH demand credit reversal
//     '6' => ['iban', 'bic_swift'], // ACH demand credit
//     '7' => ['payer_bank_account', 'iban', 'bic_swift'], // ACH demand debit
//     '8' => [], // Hold
//     '9' => ['iban', 'bic_swift'], // National or regional clearing
//     '10' => [], // In cash
//     '11' => ['iban', 'bic_swift'], // ACH savings credit reversal
//     '12' => ['payer_bank_account', 'iban', 'bic_swift'], // ACH savings debit reversal
//     '13' => ['iban', 'bic_swift'], // ACH savings credit
//     '14' => ['payer_bank_account', 'iban', 'bic_swift'], // ACH savings debit
//     '15' => ['account_holder', 'bsb_sort'], // Bookentry credit
//     '16' => ['account_holder', 'bsb_sort'], // Bookentry debit
//     '17' => ['iban', 'bic_swift'], // ACH demand CCD credit
//     '18' => ['payer_bank_account', 'iban', 'bic_swift'], // ACH demand CCD debit
//     '19' => ['iban', 'bic_swift'], // ACH demand CTP credit
//     '20' => [], // Cheque
//     '21' => [], // Banker's draft
//     '22' => [], // Certified banker's draft
//     '23' => [], // Bank cheque
//     '24' => [], // Bill of exchange awaiting acceptance
//     '25' => [], // Certified cheque
//     '26' => [], // Local cheque
//     '27' => ['payer_bank_account', 'iban', 'bic_swift'], // ACH demand CTP debit
//     '28' => ['iban', 'bic_swift'], // ACH demand CTX credit
//     '29' => ['payer_bank_account', 'iban', 'bic_swift'], // ACH demand CTX debit
//     '30' => ['iban', 'bic_swift'], // Credit transfer
//     '31' => ['iban', 'bic_swift'], // Debit transfer
//     '32' => ['iban', 'bic_swift'], // ACH demand CCD+ credit
//     '33' => ['payer_bank_account', 'iban', 'bic_swift'], // ACH demand CCD+ debit
//     '34' => ['iban', 'bic_swift'], // ACH PPD
//     '35' => ['iban', 'bic_swift'], // ACH savings CCD credit
//     '36' => ['payer_bank_account', 'iban', 'bic_swift'], // ACH savings CCD debit
//     '37' => ['iban', 'bic_swift'], // ACH savings CTP credit
//     '38' => ['payer_bank_account', 'iban', 'bic_swift'], // ACH savings CTP debit
//     '39' => ['iban', 'bic_swift'], // ACH savings CTX credit
//     '40' => ['payer_bank_account', 'iban', 'bic_swift'], // ACH savings CTX debit
//     '41' => ['iban', 'bic_swift'], // ACH savings CCD+ credit
//     '42' => ['iban', 'bic_swift'], // Payment to bank account
//     '43' => ['payer_bank_account', 'iban', 'bic_swift'], // ACH savings CCD+ debit
//     '44' => [], // Accepted bill of exchange
//     '45' => ['iban', 'bic_swift'], // Referenced home-banking credit transfer
//     '46' => ['iban', 'bic_swift'], // Interbank debit transfer
//     '47' => ['iban', 'bic_swift'], // Home-banking debit transfer
//     '48' => ['card_type', 'card_number'], // Bank card
//     '49' => ['payer_bank_account', 'iban', 'bic_swift'], // Direct debit
//     '50' => ['account_holder'], // Payment by postgiro
//     '51' => ['iban', 'bic_swift'], // FR, norme 6 97-Telereglement CFONB
//     '52' => ['iban', 'bic_swift'], // Urgent commercial payment
//     '53' => ['iban', 'bic_swift'], // Urgent Treasury Payment
//     '54' => ['card_type', 'card_number', 'card_holder'], // Credit card
//     '55' => ['card_type', 'card_number', 'card_holder'], // Debit card
//     '56' => ['account_holder'], // Bankgiro
//     '57' => ['iban', 'bic_swift'], // Standing agreement
//     '58' => ['iban', 'bic_swift'], // SEPA credit transfer
//     '59' => ['payer_bank_account', 'iban', 'bic_swift'], // SEPA direct debit
//     '60' => [], // Promissory note
//     '61' => [], // Promissory note signed by debtor
//     '62' => ['bic_swift'], // Promissory note signed by debtor and endorsed by bank
//     '63' => [], // Promissory note signed by debtor and endorsed
//     '64' => ['bic_swift'], // Promissory note signed by bank
//     '65' => ['bic_swift'], // Promissory note signed by bank and endorsed by another
//     '66' => [], // Promissory note signed by third party
//     '67' => ['bic_swift'], // Promissory note signed by third party and endorsed by bank
//     '68' => ['iban'], // Online payment service
//     '69' => ['iban', 'bic_swift'], // Transfer Advice
//     '70' => [], // Bill drawn by creditor on debtor
//     '74' => ['bic_swift'], // Bill drawn by creditor on bank
//     '75' => ['bic_swift'], // Bill drawn by creditor, endorsed by bank
//     '76' => ['bic_swift'], // Bill drawn by creditor on bank and endorsed
//     '77' => [], // Bill drawn by creditor on third party
//     '78' => [], // Bill drawn by creditor on third party, accepted
//     '91' => [], // Not transferable banker's draft
//     '92' => [], // Not transferable local cheque
//     '93' => ['iban', 'bic_swift'], // Reference giro
//     '94' => ['iban', 'bic_swift'], // Urgent giro
//     '95' => ['iban', 'bic_swift'], // Free format giro
//     '96' => [], // Requested method not used
//     '97' => ['account_holder'], // Clearing between partners
//     'ZZZ' => [], // Mutually defined
// ];

export const PaymentMeans = forwardRef<PaymentMeansFormComponent, Props>(
  (props, ref) => {
    const company = useCurrentCompany();

    const [t] = useTranslation();

    const refreshCompanyUsers = useRefreshCompanyUsers();

    const [errors, setErrors] = useState<ValidationBag | null>(null);

    const form = useFormik({
      initialValues: {
        entity: props.entity,
        payment_means: [
          {
            code: '1',
            iban: null,
            bic_swift: '',
            payer_bank_account: '',
            account_holder: '',
            bsb_sort: '',
            card_type: '',
            card_number: '',
            card_holder: '',
          },
        ],
      },
      onSubmit: (values, { setSubmitting }) => {
        toast.processing();
        setErrors(null);

        request('POST', endpoint('/api/v1/einvoice/configurations'), values)
          .then(() => {
            toast.success('saved_einvoice_details');

            refreshCompanyUsers();
          })
          .catch((error: AxiosError<ValidationBag>) => {
            if (error.response?.status === 422) {
              toast.dismiss();

              setErrors(error.response.data);

              return;
            }

            toast.error();
          })
          .finally(() => setSubmitting(false));
      },
    });

    useImperativeHandle(
      ref,
      () => {
        return {
          saveEInvoice() {
            form.submitForm();
          },
        };
      },
      [form.values]
    );

    const elements = useMemo(() => {
      return form.values.payment_means[0].code
        ? PAYMENT_MEANS_FORM_ELEMENTS[
            form.values.payment_means[0]
              .code as keyof typeof PAYMENT_MEANS_FORM_ELEMENTS
          ] || []
        : [];
    }, [form.values.payment_means]);

    useEffect(() => {
      form.setFieldValue(
        'payment_means.0.code',
        get(
          company.e_invoice,
          'Invoice.PaymentMeans.0.PaymentMeansCode.value'
        ) || '1'
      );
      form.setFieldValue(
        'payment_means.0.iban',
        get(
          company.e_invoice,
          'Invoice.PaymentMeans.0.PayeeFinancialAccount.ID.value'
        ) || null
      );
      form.setFieldValue(
        'payment_means.0.bic_swift',
        get(
          company.e_invoice,
          'Invoice.PaymentMeans.0.PayeeFinancialAccount.FinancialInstitutionBranch.FinancialInstitution.ID.value'
        ) || ''
      );
      form.setFieldValue(
        'payment_means.0.account_holder',
        get(
          company.e_invoice,
          'Invoice.PaymentMeans.0.PayeeFinancialAccount.Name'
        ) || ''
      );
      form.setFieldValue(
        'payment_means.0.payer_bank_account',
        get(
          company.e_invoice,
          'Invoice.PaymentMeans.0.PayerFinancialAccount.ID.value'
        ) || ''
      );
      form.setFieldValue(
        'payment_means.0.bsb_sort',
        get(
          company.e_invoice,
          'Invoice.PaymentMeans.0.PayeeFinancialAccount.SortCode.value'
        ) || ''
      );
      form.setFieldValue(
        'payment_means.0.card_type',
        get(
          company.e_invoice,
          'Invoice.PaymentMeans.0.CardAccount.NetworkID.value'
        ) || ''
      );
      form.setFieldValue(
        'payment_means.0.card_number',
        get(
          company.e_invoice,
          'Invoice.PaymentMeans.0.CardAccount.PrimaryAccountNumberID.value'
        ) || ''
      );
      form.setFieldValue(
        'payment_means.0.card_holder',
        get(
          company.e_invoice,
          'Invoice.PaymentMeans.0.CardAccount.HolderName.value'
        ) || ''
      );
    }, [company.e_invoice]);

    return (
      <Card title={t('payment_means')}>
        <Element leftSide="Code">
          <SelectField
            value={form.values.payment_means[0].code}
            onValueChange={(value) =>
              form.setFieldValue('payment_means.0.code', value)
            }
            errorMessage={errors?.errors?.['payment_means.0.code']}
            dismissable={false}
            customSelector
          >
            {Object.entries(PAYMENT_MEANS_CODE_LIST).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </SelectField>
        </Element>

        {elements.includes('iban') ? (
          <Element leftSide={t('iban')} leftSideHelp={t('iban_help')}>
            <InputField
              value={form.values.payment_means[0].iban}
              onValueChange={(value) =>
                form.setFieldValue('payment_means.0.iban', value)
              }
              errorMessage={errors?.errors?.['payment_means.0.iban']}
            />
          </Element>
        ) : null}

        {elements.includes('bic_swift') ? (
          <Element leftSide={t('bic')} leftSideHelp={t('bic_swift_help')}>
            <InputField
              value={form.values.payment_means[0].bic_swift}
              onValueChange={(value) =>
                form.setFieldValue('payment_means.0.bic_swift', value)
              }
              errorMessage={errors?.errors?.['payment_means.0.bic_swift']}
            />
          </Element>
        ) : null}

        {elements.includes('payer_bank_account') ? (
          <Element
            leftSide={t('payer_bank_account')}
            leftSideHelp={t('payer_bank_account_help')}
          >
            <InputField
              value={form.values.payment_means[0].payer_bank_account}
              onValueChange={(value) =>
                form.setFieldValue('payment_means.0.payer_bank_account', value)
              }
              errorMessage={
                errors?.errors?.['payment_means.0.payer_bank_account']
              }
            />
          </Element>
        ) : null}

        {elements.includes('account_holder') ? (
          <Element
            leftSide={t('account_holder')}
            leftSideHelp={t('account_holder_help')}
          >
            <InputField
              value={form.values.payment_means[0].account_holder}
              onValueChange={(value) =>
                form.setFieldValue('payment_means.0.account_holder', value)
              }
              errorMessage={errors?.errors?.['payment_means.0.account_holder']}
            />
          </Element>
        ) : null}

        {elements.includes('bsb_sort') ? (
          <Element leftSide={t('bsb_sort')} leftSideHelp={t('bsb_sort_help')}>
            <InputField
              value={form.values.payment_means[0].bsb_sort}
              onValueChange={(value) =>
                form.setFieldValue('payment_means.0.bsb_sort', value)
              }
              errorMessage={errors?.errors?.['payment_means.0.bsb_sort']}
            />
          </Element>
        ) : null}

        {elements.includes('card_type') ? (
          <Element leftSide={t('card_type')} leftSideHelp={t('card_type_help')}>
            <InputField
              value={form.values.payment_means[0].card_type}
              onValueChange={(value) =>
                form.setFieldValue('payment_means.0.card_type', value)
              }
              errorMessage={errors?.errors?.['payment_means.0.card_type']}
            />
          </Element>
        ) : null}

        {elements.includes('card_number') ? (
          <Element
            leftSide={t('card_number')}
            leftSideHelp={t('card_number_help')}
          >
            <InputField
              value={form.values.payment_means[0].card_number}
              onValueChange={(value) =>
                form.setFieldValue('payment_means.0.card_number', value)
              }
              errorMessage={errors?.errors?.['payment_means.0.card_number']}
            />
          </Element>
        ) : null}

        {elements.includes('card_holder') ? (
          <Element
            leftSide={t('card_holder')}
            leftSideHelp={t('card_holder_help')}
          >
            <InputField
              value={form.values.payment_means[0].card_holder}
              onValueChange={(value) =>
                form.setFieldValue('payment_means.0.card_holder', value)
              }
              errorMessage={errors?.errors?.['payment_means.0.card_holder']}
            />
          </Element>
        ) : null}
      </Card>
    );
  }
);
