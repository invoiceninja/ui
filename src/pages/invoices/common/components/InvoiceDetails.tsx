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
import { Invoice } from 'common/interfaces/invoice';
import { CustomField } from 'components/CustomField';
import { ChangeHandler } from 'pages/invoices/create/Create';
import { useTranslation } from 'react-i18next';

interface Props {
  invoice?: Invoice;
  handleChange: ChangeHandler;
}

export function InvoiceDetails(props: Props) {
  const { t } = useTranslation();
  const { invoice, handleChange } = props;

  const company = useCurrentCompany();

  return (
    <>
      <Card className="col-span-12 lg:col-span-6 xl:col-span-4 h-max">
        <Element leftSide={t('invoice_date')}>
          <InputField
            type="date"
            onValueChange={(value) => handleChange('date', value)}
            value={invoice?.date || ''}
          />
        </Element>

        <Element leftSide={t('due_date')}>
          <InputField
            type="date"
            onValueChange={(value) => handleChange('due_date', value)}
            value={invoice?.due_date || ''}
          />
        </Element>

        <Element leftSide={t('partial')}>
          <InputField
            id="partial"
            type="number"
            onValueChange={(value) =>
              handleChange('partial', parseFloat(value) || 0)
            }
            value={invoice?.partial || ''}
          />
        </Element>

        {invoice && invoice.partial > 0 && (
          <Element leftSide={t('partial_due_date')}>
            <InputField
              type="date"
              onValueChange={(value) => handleChange('partial_due_date', value)}
              value={invoice?.partial_due_date || ''}
            />
          </Element>
        )}

        {invoice && company?.custom_fields?.invoice1 && (
          <CustomField
            field="invoice1"
            defaultValue={invoice?.custom_value1 || ''}
            value={company.custom_fields.invoice1}
            onChange={(value) =>
              handleChange('custom_value1', value.toString())
            }
          />
        )}

        {invoice && company?.custom_fields?.invoice2 && (
          <CustomField
            field="invoice2"
            defaultValue={invoice?.custom_value2 || ''}
            value={company.custom_fields.invoice2}
            onChange={(value) =>
              handleChange('custom_value2', value.toString())
            }
          />
        )}
      </Card>

      <Card className="col-span-12 lg:col-span-6 xl:col-span-4 h-max">
        <Element leftSide={t('invoice_number_short')}>
          <InputField
            id="number"
            onValueChange={(value) => handleChange('number', value)}
            value={invoice?.number || ''}
          />
        </Element>

        <Element leftSide={t('po_number_short')}>
          <InputField
            id="po_number"
            onValueChange={(value) => handleChange('po_number', value)}
            value={invoice?.po_number || ''}
          />
        </Element>

        <Element leftSide={t('discount')}>
          <div className="flex space-x-2">
            <div className="w-full lg:w-1/2">
              <InputField
                type="number"
                onValueChange={(value) =>
                  handleChange('discount', parseFloat(value) || 0)
                }
                value={invoice?.discount || ''}
              />
            </div>

            <div className="w-full lg:w-1/2">
              <SelectField
                onValueChange={(value) =>
                  handleChange('is_amount_discount', JSON.parse(value))
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
            onChange={(value) =>
              handleChange('custom_value3', value.toString())
            }
          />
        )}

        {invoice && company?.custom_fields?.invoice4 && (
          <CustomField
            field="invoice4"
            defaultValue={invoice?.custom_value4 || ''}
            value={company.custom_fields.invoice4}
            onChange={(value) =>
              handleChange('custom_value4', value.toString())
            }
          />
        )}
      </Card>
    </>
  );
}
