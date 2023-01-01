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
import { PurchaseOrder } from 'common/interfaces/purchase-order';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { Inline } from 'components/Inline';
import { useTranslation } from 'react-i18next';
import { date as formatDate } from 'common/helpers';

export interface PurchaseOrderCardProps {
  purchaseOrder: PurchaseOrder;
  handleChange: <T extends keyof PurchaseOrder>(
    property: T,
    value: PurchaseOrder[T]
  ) => void;
  errors?: ValidationBag;
}

export function Details(props: PurchaseOrderCardProps) {
  const [t] = useTranslation();

  const { purchaseOrder, handleChange, errors } = props;

  return (
    <>
      <Card className="col-span-12 xl:col-span-4 h-max">
        <Element leftSide={t('purchase_order_date')}>
          <InputField
            type="date"
            value={purchaseOrder.date}
            onValueChange={(date) => handleChange('date', date)}
            errorMessage={errors?.errors.date}
          />
        </Element>

        <Element leftSide={t('due_date')}>
          <InputField
            type="date"
            value={purchaseOrder.due_date}
            onValueChange={(date) => handleChange('due_date', date)}
            errorMessage={errors?.errors.due_date}
          />
        </Element>

        <Element leftSide={t('partial')}>
          <InputField
            value={purchaseOrder.partial}
            onValueChange={(partial) =>
              handleChange('partial', parseFloat(partial) || 0)
            }
            errorMessage={errors?.errors.partial}
          />
        </Element>

        {purchaseOrder && purchaseOrder.partial > 0 && (
          <Element leftSide={t('partial_due_date')}>
            <InputField
              type="date"
              value={formatDate(
                purchaseOrder.partial_due_date.toString(),
                'YYYY-MM-DD'
              )}
              onValueChange={(date) => handleChange('partial_due_date', date)}
              errorMessage={errors?.errors.partial_due_date}
            />
          </Element>
        )}
      </Card>

      <Card className="col-span-12 xl:col-span-4 h-max">
        <Element leftSide={t('po_number')}>
          <InputField
            value={purchaseOrder.number}
            onValueChange={(value) => handleChange('number', value)}
            errorMessage={errors?.errors.number}
          />
        </Element>

        <Element leftSide={t('discount')}>
          <Inline>
            <div className="w-full lg:w-1/2">
              <InputField
                value={purchaseOrder.discount}
                onValueChange={(value) =>
                  handleChange('discount', parseFloat(value) || 0)
                }
                errorMessage={errors?.errors.discount}
              />
            </div>

            <div className="w-full lg:w-1/2">
              <SelectField
                value={purchaseOrder.is_amount_discount.toString()}
                onValueChange={(value) =>
                  handleChange('is_amount_discount', JSON.parse(value))
                }
                errorMessage={errors?.errors.is_amount_discount}
              >
                <option value="false">{t('percent')}</option>
                <option value="true">{t('amount')}</option>
              </SelectField>
            </div>
          </Inline>
        </Element>
      </Card>
    </>
  );
}
