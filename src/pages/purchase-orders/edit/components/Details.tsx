/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { InputField, SelectField } from '$app/components/forms';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Inline } from '$app/components/Inline';
import { useTranslation } from 'react-i18next';
import { date as formatDate } from '$app/common/helpers';
import { CustomField } from '$app/components/CustomField';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';

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
  const company = useCurrentCompany();

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
            type="number"
            changeOverride={true}
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
        {purchaseOrder && company?.custom_fields?.invoice1 && (
          <CustomField
            field="invoice1"
            defaultValue={purchaseOrder?.custom_value1 || ''}
            value={company.custom_fields.invoice1}
            onValueChange={(value) =>
              handleChange('custom_value1', value.toString())
            }
          />
        )}

        {purchaseOrder && company?.custom_fields?.invoice2 && (
          <CustomField
            field="invoice2"
            defaultValue={purchaseOrder?.custom_value2 || ''}
            value={company.custom_fields.invoice2}
            onValueChange={(value) =>
              handleChange('custom_value2', value.toString())
            }
          />
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
                type="number"
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

        {purchaseOrder && company?.custom_fields?.invoice3 && (
          <CustomField
            field="invoice3"
            defaultValue={purchaseOrder?.custom_value3 || ''}
            value={company.custom_fields.invoice3}
            onValueChange={(value) =>
              handleChange('custom_value3', value.toString())
            }
          />
        )}

        {purchaseOrder && company?.custom_fields?.invoice4 && (
          <CustomField
            field="invoice4"
            defaultValue={purchaseOrder?.custom_value4 || ''}
            value={company.custom_fields.invoice4}
            onValueChange={(value) =>
              handleChange('custom_value4', value.toString())
            }
          />
        )}
      </Card>
    </>
  );
}
