/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Product } from '$app/common/interfaces/product';
import { ProductCreate } from '$app/pages/invoices/common/components/ProductCreate';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ComboboxAsync, Entry } from '../forms/Combobox';
import { Alert } from '../Alert';

interface Props {
  defaultValue?: string | number | boolean;
  clearButton?: boolean;
  className?: string;
  onChange?: (value: Entry<Product>) => unknown;
  onClearButtonClick?: () => unknown;
  onProductCreated?: (product: Product) => unknown;
  onInputFocus?: () => unknown;
  errorMessage?: string | string[];
}

export function ProductSelector(props: Props) {
  const [t] = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <ProductCreate
        setIsModalOpen={setIsModalOpen}
        isModalOpen={isModalOpen}
        onProductCreated={props.onProductCreated}
      />

      <ComboboxAsync<Product>
        endpoint="/api/v1/products?per_page=500"
        inputOptions={{ value: props.defaultValue ?? null }}
        entryOptions={{ id: 'id', label: 'product_key', value: 'id' }}
        onChange={(product) => props.onChange && props.onChange(product)}
        action={{
          label: t('new_product'),
          onClick: () => setIsModalOpen(true),
          visible: true,
        }}
        onDismiss={props.onClearButtonClick}
        sortBy="product_key|asc"
        nullable
        key="product_selector"
      />

      {props.errorMessage && (
        <Alert type="danger" className="mt-2">
          {props.errorMessage}
        </Alert>
      )}
    </>
  );
}
