/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { InputField } from '$app/components/forms';
import { Element } from '$app/components/cards';
import { CustomField } from '$app/components/CustomField';
import { TaxRateSelector } from '$app/components/tax-rates/TaxRateSelector';
import Toggle from '$app/components/forms/Toggle';
import { Product } from '$app/common/interfaces/product';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { EntityStatus } from '$app/components/EntityStatus';
import { TaxCategorySelector } from '$app/components/tax-rates/TaxCategorySelector';
import { Alert } from '$app/components/Alert';
import { useSearchParams } from 'react-router-dom';

interface Props {
  type?: 'create' | 'edit';
  product: Product;
  errors: ValidationBag | undefined;
  handleChange: (
    property: keyof Product,
    value: Product[keyof Product]
  ) => void;
}

export function ProductForm(props: Props) {
  const [t] = useTranslation();
  const [, setSearchParams] = useSearchParams();

  const company = useCurrentCompany();

  const { errors, handleChange, type, product } = props;

  return (
    <>
      {type === 'edit' && (
        <Element leftSide={t('status')}>
          <EntityStatus entity={product} />
        </Element>
      )}

      <Element leftSide={t('item')} required>
        <InputField
          required
          value={product.product_key}
          onValueChange={(value) => handleChange('product_key', value)}
          errorMessage={errors?.errors.product_key}
        />
      </Element>

      <Element leftSide={t('description')}>
        <InputField
          element="textarea"
          value={product.notes}
          onValueChange={(value) => handleChange('notes', value)}
          errorMessage={errors?.errors.notes}
        />
      </Element>

      <Element leftSide={t('price')}>
        <InputField
          type="number"
          value={product.price}
          onValueChange={(value) => handleChange('price', value)}
          errorMessage={errors?.errors.price}
        />
      </Element>

      {company?.enable_product_cost && (
        <Element leftSide={t('cost')}>
          <InputField
            value={product.cost}
            onValueChange={(value) => handleChange('cost', value)}
            errorMessage={errors?.errors.cost}
          />
        </Element>
      )}

      {company?.enable_product_quantity && (
        <Element leftSide={t('default_quantity')}>
          <InputField
            type="number"
            value={product.quantity}
            onValueChange={(value) => handleChange('quantity', value)}
            errorMessage={errors?.errors.quantity}
          />
        </Element>
      )}

      <Element leftSide={t('max_quantity')}>
        <InputField
          type="number"
          value={product.max_quantity}
          onValueChange={(value) => handleChange('max_quantity', value)}
          errorMessage={errors?.errors.max_quantity}
        />
      </Element>

      <Element leftSide={t('tax_category')}>
        <TaxCategorySelector
          value={product.tax_id}
          onChange={(taxCategory) => handleChange('tax_id', taxCategory.value)}
        />

        {errors?.errors.tax_id ? (
          <Alert className="mt-2" type="danger">
            {errors.errors.tax_id}
          </Alert>
        ) : null}
      </Element>

      <Element leftSide={t('image_url')}>
        <InputField
          value={product.product_image}
          onValueChange={(value) => handleChange('product_image', value)}
          errorMessage={errors?.errors.product_image}
        />
      </Element>

      {company?.track_inventory && (
        <>
          <Element leftSide={t('stock_quantity')}>
            <InputField
              type="number"
              value={product.in_stock_quantity}
              onValueChange={(value) => {
                handleChange('in_stock_quantity', Number(value));

                if (type === 'edit') {
                  setSearchParams((params) => ({
                    ...params,
                    update_in_stock_quantity: 'true',
                  }));
                }
              }}
              errorMessage={errors?.errors.in_stock_quantity}
            />
          </Element>

          <Element leftSide={t('stock_notifications')}>
            <Toggle
              checked={product.stock_notification}
              onValueChange={(value) =>
                handleChange('stock_notification', value)
              }
            />
          </Element>

          <Element leftSide={t('notification_threshold')}>
            <InputField
              type="number"
              value={product.stock_notification_threshold}
              onValueChange={(value) =>
                handleChange('stock_notification_threshold', value)
              }
              errorMessage={errors?.errors.stock_notification_threshold}
            />
          </Element>
        </>
      )}

      {company && company.enabled_item_tax_rates > 0 && (
        <Element leftSide={t('tax')}>
          <TaxRateSelector
            onChange={(value) => {
              handleChange('tax_rate1', value.resource?.rate);
              handleChange('tax_name1', value.resource?.name);
            }}
            defaultValue={product.tax_name1}
            onClearButtonClick={() => {
              handleChange('tax_rate1', 0);
              handleChange('tax_name1', '');
            }}
            onTaxCreated={(taxRate) => {
              handleChange('tax_rate1', taxRate.rate);
              handleChange('tax_name1', taxRate.name);
            }}
          />
        </Element>
      )}

      {company && company.enabled_item_tax_rates > 1 && (
        <Element leftSide={t('tax')}>
          <TaxRateSelector
            onChange={(value) => {
              handleChange('tax_rate2', value.resource?.rate);
              handleChange('tax_name2', value.resource?.name);
            }}
            defaultValue={product.tax_name2}
            onClearButtonClick={() => {
              handleChange('tax_rate2', 0);
              handleChange('tax_name2', '');
            }}
            onTaxCreated={(taxRate) => {
              handleChange('tax_rate2', taxRate.rate);
              handleChange('tax_name2', taxRate.name);
            }}
          />
        </Element>
      )}

      {company && company.enabled_item_tax_rates > 2 && (
        <Element leftSide={t('tax')}>
          <TaxRateSelector
            onChange={(value) => {
              handleChange('tax_rate3', value.resource?.rate);
              handleChange('tax_name3', value.resource?.name);
            }}
            defaultValue={product.tax_name3}
            onClearButtonClick={() => {
              handleChange('tax_rate3', 0);
              handleChange('tax_name3', '');
            }}
            onTaxCreated={(taxRate) => {
              handleChange('tax_rate3', taxRate.rate);
              handleChange('tax_name3', taxRate.name);
            }}
          />
        </Element>
      )}

      {company?.custom_fields?.product1 && (
        <CustomField
          field="custom_value1"
          defaultValue={product.custom_value1}
          value={company.custom_fields.product1}
          onValueChange={(value) => handleChange('custom_value1', value)}
        />
      )}

      {company?.custom_fields?.product2 && (
        <CustomField
          field="custom_value2"
          defaultValue={product.custom_value2}
          value={company.custom_fields.product2}
          onValueChange={(value) => handleChange('custom_value2', value)}
        />
      )}

      {company?.custom_fields?.product3 && (
        <CustomField
          field="custom_value3"
          defaultValue={product.custom_value3}
          value={company.custom_fields.product3}
          onValueChange={(value) => handleChange('custom_value3', value)}
        />
      )}

      {company?.custom_fields?.product4 && (
        <CustomField
          field="custom_value4"
          defaultValue={product.custom_value4}
          value={company.custom_fields.product4}
          onValueChange={(value) => handleChange('custom_value4', value)}
        />
      )}
    </>
  );
}
