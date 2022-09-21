/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { InputField, SelectField } from '@invoiceninja/forms';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { CustomField } from 'components/CustomField';
import { useTranslation } from 'react-i18next';
import frequencies from 'common/constants/frequency';
import { ChangeHandler } from '../hooks';
import { useAtom } from 'jotai';
import { recurringInvoiceAtom } from '../atoms';
import dayjs from 'dayjs';

interface Props {
  handleChange: ChangeHandler;
}

export function InvoiceDetails(props: Props) {
  const { t } = useTranslation();
  const { handleChange } = props;

  const company = useCurrentCompany();

  const [recurringInvoice] = useAtom(recurringInvoiceAtom);

  return (
    <>
      <Card className="col-span-12 lg:col-span-6 xl:col-span-4 h-max">
        <Element leftSide={t('frequency')}>
          <SelectField
            value={recurringInvoice?.frequency_id}
            onValueChange={(value) => handleChange('frequency_id', value)}
          >
            {Object.keys(frequencies).map((frequency, index) => (
              <option key={index} value={frequency}>
                {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                {/* @ts-ignore */}
                {t(frequencies[frequency])}
              </option>
            ))}
          </SelectField>
        </Element>

        <Element leftSide={t('start_date')}>
          <InputField
            type="date"
            onValueChange={(value) => handleChange('next_send_date', value)}
            value={invoice?.next_send_date ? dayjs(invoice?.next_send_date).format('YYYY-MM-DD') : new Date().toISOString().split('T')[0]}
            min={new Date().toISOString().split('T')[0]}
          />
        </Element>

        <Element leftSide={t('remaining_cycles')}>
          <SelectField
            value={recurringInvoice?.remaining_cycles}
            onValueChange={(value) =>
              handleChange('remaining_cycles', parseInt(value))
            }
          >
            <option value="-1">{t('endless')}</option>
            {[...Array(37).keys()].map((number, index) => (
              <option value={number} key={index}>
                {number}
              </option>
            ))}
          </SelectField>
        </Element>

        <Element leftSide={t('due_date')}>
          <SelectField
            value={recurringInvoice?.due_date_days}
            onValueChange={(value) => handleChange('due_date_days', value)}
          >
            <option value="terms">{t('use_payment_terms')}</option>
            {[...Array(31).keys()].map((number, index) => (
              <option value={number + 1} key={index}>
                {t('day')} {number + 1}
              </option>
            ))}
          </SelectField>
        </Element>

        {recurringInvoice && company?.custom_fields?.invoice1 && (
          <CustomField
            field="invoice1"
            defaultValue={recurringInvoice?.custom_value1 || ''}
            value={company.custom_fields.invoice1}
            onChange={(value) => handleChange('custom_value1', String(value))}
          />
        )}

        {recurringInvoice && company?.custom_fields?.invoice2 && (
          <CustomField
            field="invoice2"
            defaultValue={recurringInvoice?.custom_value2 || ''}
            value={company.custom_fields.invoice2}
            onChange={(value) => handleChange('custom_value2', String(value))}
          />
        )}
      </Card>

      <Card className="col-span-12 lg:col-span-6 xl:col-span-4 h-max">
        <Element leftSide={t('invoice_number_short')}>
          <InputField
            id="number"
            onValueChange={(value) => handleChange('number', value)}
            value={recurringInvoice?.number || ''}
          />
        </Element>

        <Element leftSide={t('po_number_short')}>
          <InputField
            id="po_number"
            onValueChange={(value) => handleChange('po_number', value)}
            value={recurringInvoice?.po_number || ''}
          />
        </Element>

        <Element leftSide={t('discount')}>
          <div className="flex space-x-2">
            <div className="w-full lg:w-1/2">
              <InputField
                type="number"
                onValueChange={(value) =>
                  handleChange('discount', parseFloat(value))
                }
                value={recurringInvoice?.discount || ''}
              />
            </div>

            <div className="w-full lg:w-1/2">
              <SelectField
                onValueChange={(value) =>
                  handleChange('is_amount_discount', JSON.parse(value))
                }
                value={recurringInvoice?.is_amount_discount.toString()}
              >
                <option value="false">{t('percent')}</option>
                <option value="true">{t('amount')}</option>
              </SelectField>
            </div>
          </div>
        </Element>

        <Element leftSide={t('auto_bill')}>
          <SelectField
            value={recurringInvoice?.auto_bill || false}
            onValueChange={(value) =>
              handleChange('auto_bill', JSON.parse(value))
            }
          >
            <option value="always">{t('enabled')}</option>
            <option value="optout">{t('optout')}</option>
            <option value="optin">{t('optin')}</option>
            <option value="off">{t('disabled')}</option>
          </SelectField>
        </Element>

        {recurringInvoice && company?.custom_fields?.invoice3 && (
          <CustomField
            field="invoice3"
            defaultValue={recurringInvoice?.custom_value3 || ''}
            value={company.custom_fields.invoice3}
            onChange={(value) => handleChange('custom_value3', String(value))}
          />
        )}

        {recurringInvoice && company?.custom_fields?.invoice4 && (
          <CustomField
            field="invoice4"
            defaultValue={recurringInvoice?.custom_value4 || ''}
            value={company.custom_fields.invoice4}
            onChange={(value) => handleChange('custom_value4', String(value))}
          />
        )}
      </Card>
    </>
  );
}
