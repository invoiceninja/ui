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
import { Invoice } from 'common/interfaces/invoice';
import { setCurrentInvoiceProperty } from 'common/stores/slices/invoices';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

export function Details() {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const handleChange = (property: keyof Invoice, value: unknown) => {
    dispatch(
      setCurrentInvoiceProperty({
        property,
        value,
      })
    );
  };

  return (
    <>
      <Card className="col-span-12 lg:col-span-6 xl:col-span-4 h-max">
        <Element leftSide={t('invoice_date')}>
          <InputField
            type="date"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleChange('date', event.target.value)
            }
          />
        </Element>

        <Element leftSide={t('due_date')}>
          <InputField
            type="date"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleChange('due_date', event.target.value)
            }
          />
        </Element>

        <Element leftSide={t('partial')}>
          <InputField
            id="partial"
            type="number"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleChange('partial', parseFloat(event.target.value))
            }
          />
        </Element>
      </Card>

      <Card className="col-span-12 lg:col-span-6 xl:col-span-4 h-max">
        <Element leftSide={t('invoice_number_short')}>
          <InputField
            id="number"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleChange('number', event.target.value)
            }
          />
        </Element>

        <Element leftSide={t('po_number_short')}>
          <InputField
            id="po_number"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleChange('po_number', event.target.value)
            }
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
              >
                <option value="false">{t('percent')}</option>
                <option value="true">{t('amount')}</option>
              </SelectField>
            </div>
          </div>
        </Element>
      </Card>
    </>
  );
}
