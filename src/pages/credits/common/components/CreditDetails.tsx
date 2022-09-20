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
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { creditAtom } from '../atoms';
import { ChangeHandler } from '../hooks';

interface Props {
  handleChange: ChangeHandler;
}

export function CreditDetails(props: Props) {
  const { t } = useTranslation();
  const { handleChange } = props;

  const company = useCurrentCompany();

  const [credits] = useAtom(creditAtom);

  return (
    <>
      <Card className="col-span-12 lg:col-span-6 xl:col-span-4 h-max">
        <Element leftSide={t('credit_date')}>
          <InputField
            type="date"
            onValueChange={(value) => handleChange('date', value)}
            value={credits?.date || ''}
          />
        </Element>

        <Element leftSide={t('valid_until')}>
          <InputField
            type="date"
            onValueChange={(value) => handleChange('due_date', value)}
            value={credits?.due_date || ''}
          />
        </Element>

        <Element leftSide={t('partial')}>
          <InputField
            id="partial"
            type="number"
            onValueChange={(value) => handleChange('partial', value)}
            value={credits?.partial || ''}
          />
        </Element>

        {credits && credits.partial > 0 && (
          <Element leftSide={t('partial_due_date')}>
            <InputField
              type="date"
              onValueChange={(value) => handleChange('partial_due_date', value)}
              value={credits?.partial_due_date || ''}
            />
          </Element>
        )}

        {credits && company?.custom_fields?.credit1 && (
          <CustomField
            field="credit1"
            defaultValue={credits?.custom_value1 || ''}
            value={company.custom_fields.credit1}
            onChange={(value) => handleChange('custom_value1', value)}
          />
        )}

        {credits && company?.custom_fields?.credit2 && (
          <CustomField
            field="credit2"
            defaultValue={credits?.custom_value2 || ''}
            value={company.custom_fields.credit2}
            onChange={(value) => handleChange('custom_value2', value)}
          />
        )}
      </Card>

      <Card className="col-span-12 lg:col-span-6 xl:col-span-4 h-max">
        <Element leftSide={t('credit_number')}>
          <InputField
            id="number"
            onValueChange={(value) => handleChange('number', value)}
            value={credits?.number || ''}
          />
        </Element>

        <Element leftSide={t('po_number_short')}>
          <InputField
            id="po_number"
            onValueChange={(value) => handleChange('po_number', value)}
            value={credits?.po_number || ''}
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
                value={credits?.discount || ''}
              />
            </div>

            <div className="w-full lg:w-1/2">
              <SelectField
                onValueChange={(value) =>
                  handleChange('is_amount_discount', value)
                }
                value={credits?.is_amount_discount.toString()}
              >
                <option value="false">{t('percent')}</option>
                <option value="true">{t('amount')}</option>
              </SelectField>
            </div>
          </div>
        </Element>

        {credits && company?.custom_fields?.credit3 && (
          <CustomField
            field="credit3"
            defaultValue={credits?.custom_value3 || ''}
            value={company.custom_fields.credit3}
            onChange={(value) => handleChange('custom_value3', value)}
          />
        )}

        {credits && company?.custom_fields?.credit4 && (
          <CustomField
            field="credit4"
            defaultValue={credits?.custom_value4 || ''}
            value={company.custom_fields.credit4}
            onChange={(value) => handleChange('custom_value4', value)}
          />
        )}
      </Card>
    </>
  );
}
