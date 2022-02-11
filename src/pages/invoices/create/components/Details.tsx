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
import { useTranslation } from 'react-i18next';

export function Details() {
  const [t] = useTranslation();

  return (
    <>
      <Card className="col-span-12 lg:col-span-6 xl:col-span-4 h-max">
        <Element leftSide={t('invoice_date')}>
          <InputField id="invoice_date" type="date" />
        </Element>

        <Element leftSide={t('due_date')}>
          <InputField id="due_date" type="date" />
        </Element>

        <Element leftSide={t('partial')}>
          <InputField id="partial" />
        </Element>
      </Card>

      <Card className="col-span-12 lg:col-span-6 xl:col-span-4 h-max">
        <Element leftSide={t('invoice_number_short')}>
          <InputField id="invoice_number" type="invoice_number" />
        </Element>

        <Element leftSide={t('po_number_short')}>
          <InputField id="po_number" type="po_number" />
        </Element>

        <Element leftSide={t('discount')}>
          <div className="flex space-x-2">
            <div className="w-full lg:w-1/2">
              <InputField type="number" id="discount" />
            </div>

            <div className="w-full lg:w-1/2">
              <SelectField>
                <option value="percent">{t('percent')}</option>
                <option value="amount">{t('amount')}</option>
              </SelectField>
            </div>
          </div>
        </Element>
      </Card>
    </>
  );
}
