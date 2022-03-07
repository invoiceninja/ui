/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { InputField, SelectField } from '@invoiceninja/forms';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useCurrentInvoice } from 'common/hooks/useCurrentInvoice';
import { CustomField } from 'components/CustomField';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useSetCurrentInvoiceProperty } from '../hooks/useSetCurrentInvoiceProperty';

export function InvoiceDetails() {
  const [t] = useTranslation();
  const invoice = useCurrentInvoice();
  const company = useCurrentCompany();
  const handleChange = useSetCurrentInvoiceProperty();

  return (
    <>
      <Card className="col-span-12 lg:col-span-6 xl:col-span-4 h-max">
        <Element leftSide={t('invoice_date')}>
          <InputField
            type="date"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleChange('date', event.target.value)
            }
            value={invoice?.date || ''}
          />
        </Element>

        <Element leftSide={t('due_date')}>
          <InputField
            type="date"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleChange('due_date', event.target.value)
            }
            value={invoice?.due_date || ''}
          />
        </Element>

        <Element leftSide={t('partial')}>
          <InputField
            id="partial"
            type="number"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleChange('partial', parseFloat(event.target.value))
            }
            value={invoice?.partial || ''}
          />
        </Element>

        {invoice && invoice.partial > 0 && (
          <Element leftSide={t('partial_due_date')}>
            <InputField
              type="date"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleChange('partial_due_date', event.target.value)
              }
              value={invoice?.partial_due_date || ''}
            />
          </Element>
        )}

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
