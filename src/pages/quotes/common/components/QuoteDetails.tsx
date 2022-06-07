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
import { useCurrentQuote } from '../hooks/useCurrentQuote';
import { useSetCurrentQuoteProperty } from '../hooks/useSetCurrentQuoteProperty';

export function QuoteDetails() {
  const [t] = useTranslation();

  const quote = useCurrentQuote();
  const company = useCurrentCompany();

  const handleChange = useSetCurrentQuoteProperty();

  return (
    <>
      <Card className="col-span-12 lg:col-span-6 xl:col-span-4 h-max">
        <Element leftSide={t('quote_date')}>
          <InputField
            type="date"
            onValueChange={(value) => handleChange('date', value)}
            value={quote?.date || ''}
          />
        </Element>

        <Element leftSide={t('valid_until')}>
          <InputField
            type="date"
            onValueChange={(value) => handleChange('due_date', value)}
            value={quote?.due_date || ''}
          />
        </Element>

        <Element leftSide={t('partial')}>
          <InputField
            id="partial"
            type="number"
            onValueChange={(value) => handleChange('partial', value)}
            value={quote?.partial || ''}
          />
        </Element>

        {quote && quote.partial > 0 && (
          <Element leftSide={t('partial_due_date')}>
            <InputField
              type="date"
              onValueChange={(value) => handleChange('partial_due_date', value)}
              value={quote?.partial_due_date || ''}
            />
          </Element>
        )}

        {quote && company?.custom_fields?.quote1 && (
          <CustomField
            field="quote1"
            defaultValue={quote?.custom_value1 || ''}
            value={company.custom_fields.quote2}
            onChange={(value) => handleChange('custom_value1', value)}
          />
        )}

        {quote && company?.custom_fields?.quote2 && (
          <CustomField
            field="quote2"
            defaultValue={quote?.custom_value2 || ''}
            value={company.custom_fields.quote2}
            onChange={(value) => handleChange('custom_value2', value)}
          />
        )}
      </Card>

      <Card className="col-span-12 lg:col-span-6 xl:col-span-4 h-max">
        <Element leftSide={t('quote_number_short')}>
          <InputField
            id="number"
            onValueChange={(value) => handleChange('number', value)}
            value={quote?.number || ''}
          />
        </Element>

        <Element leftSide={t('po_number_short')}>
          <InputField
            id="po_number"
            onValueChange={(value) => handleChange('po_number', value)}
            value={quote?.po_number || ''}
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
                value={quote?.discount || ''}
              />
            </div>

            <div className="w-full lg:w-1/2">
              <SelectField
                onValueChange={(value) =>
                  handleChange('is_amount_discount', value)
                }
                value={quote?.is_amount_discount.toString()}
              >
                <option value="false">{t('percent')}</option>
                <option value="true">{t('amount')}</option>
              </SelectField>
            </div>
          </div>
        </Element>

        {quote && company?.custom_fields?.quote3 && (
          <CustomField
            field="quote3"
            defaultValue={quote?.custom_value3 || ''}
            value={company.custom_fields.quote3}
            onChange={(value) => handleChange('custom_value3', value)}
          />
        )}

        {quote && company?.custom_fields?.quote4 && (
          <CustomField
            field="quote4"
            defaultValue={quote?.custom_value4 || ''}
            value={company.custom_fields.quote4}
            onChange={(value) => handleChange('custom_value4', value)}
          />
        )}
      </Card>
    </>
  );
}
