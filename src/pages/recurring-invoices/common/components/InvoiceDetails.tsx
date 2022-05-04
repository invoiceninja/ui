/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { InputField, SelectField } from '@invoiceninja/forms';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useCurrentRecurringInvoice } from 'common/hooks/useCurrentRecurringInvoice';
import { CustomField } from 'components/CustomField';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useSetCurrentRecurringInvoiceProperty } from '../hooks/useSetCurrentRecurringInvoiceProperty';
import frequencies from 'common/constants/frequency';

interface Props {
  autoBill?: string;
}

export function InvoiceDetails(props: Props) {
  const [t] = useTranslation();
  const invoice = useCurrentRecurringInvoice();
  const company = useCurrentCompany();
  const handleChange = useSetCurrentRecurringInvoiceProperty();

  return (
    <>
      <Card className="col-span-12 lg:col-span-6 xl:col-span-4 h-max">
        <Element leftSide={t('frequency')}>
          <SelectField
            value={invoice?.frequency_id}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              handleChange('frequency_id', event.target.value)
            }
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
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleChange('date', event.target.value)
            }
            value={invoice?.date || new Date().toISOString().split('T')[0]}
            min={new Date().toISOString().split('T')[0]}
          />
        </Element>

        <Element leftSide={t('remaining_cycles')}>
          <SelectField
            value={invoice?.remaining_cycles}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              handleChange('remaining_cycles', event.target.value)
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
            value={invoice?.due_date_days}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              handleChange('due_date_days', event.target.value)
            }
          >
            <option value="terms">{t('use_payment_terms')}</option>
            {[...Array(31).keys()].map((number, index) => (
              <option value={number + 1} key={index}>
                {t('day')} {number + 1}
              </option>
            ))}
          </SelectField>
        </Element>

        {invoice && company?.custom_fields?.invoice1 && (
          <CustomField
            field="invoice1"
            defaultValue={invoice?.custom_value1 || ''}
            value={company.custom_fields.invoice1}
            onChange={(value) => handleChange('custom_value1', value)}
          />
        )}

        {invoice && company?.custom_fields?.invoice2 && (
          <CustomField
            field="invoice2"
            defaultValue={invoice?.custom_value2 || ''}
            value={company.custom_fields.invoice2}
            onChange={(value) => handleChange('custom_value2', value)}
          />
        )}
      </Card>

      <Card className="col-span-12 lg:col-span-6 xl:col-span-4 h-max">
        <Element leftSide={t('invoice_number_short')}>
          <InputField
            id="number"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleChange('number', event.target.value)
            }
            value={invoice?.number || ''}
          />
        </Element>

        <Element leftSide={t('po_number_short')}>
          <InputField
            id="po_number"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleChange('po_number', event.target.value)
            }
            value={invoice?.po_number || ''}
          />
        </Element>

        <Element leftSide={t('discount')}>
          <div className="flex space-x-2">
            <div className="w-full lg:w-1/2">
              <InputField
                type="number"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  handleChange('discount', parseFloat(event.target.value))
                }
                value={invoice?.discount || ''}
              />
            </div>

            <div className="w-full lg:w-1/2">
              <SelectField
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  handleChange(
                    'is_amount_discount',
                    JSON.parse(event.target.value)
                  )
                }
                value={invoice?.is_amount_discount.toString()}
              >
                <option value="false">{t('percent')}</option>
                <option value="true">{t('amount')}</option>
              </SelectField>
            </div>
          </div>
        </Element>

        <Element leftSide={t('auto_bill')}>
          <SelectField
            value={props.autoBill}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              handleChange('auto_bill', event.target.value)
            }
          >
            <option value="always">{t('enabled')}</option>
            <option value="optout">{t('optout')}</option>
            <option value="optin">{t('optin')}</option>
            <option value="off">{t('disabled')}</option>
          </SelectField>
        </Element>

        {invoice && company?.custom_fields?.invoice3 && (
          <CustomField
            field="invoice3"
            defaultValue={invoice?.custom_value3 || ''}
            value={company.custom_fields.invoice3}
            onChange={(value) => handleChange('custom_value3', value)}
          />
        )}

        {invoice && company?.custom_fields?.invoice4 && (
          <CustomField
            field="invoice4"
            defaultValue={invoice?.custom_value4 || ''}
            value={company.custom_fields.invoice4}
            onChange={(value) => handleChange('custom_value4', value)}
          />
        )}
      </Card>
    </>
  );
}
