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
import { endpoint } from '$app/common/helpers';

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
        endpoint={new URL(endpoint('/api/v1/products?per_page=500'))}
        inputOptions={{ value: props.defaultValue ?? null }}
        entryOptions={{
          id: 'id',
          label: 'product_key',
          value: 'id',
          searchable: 'notes',
          dropdownLabelFn: (product) => (
            <div>
              <p className="font-semibold">{product.product_key}</p>
              <p className="text-sm text-gray-800 truncate">
                {product.notes.length > 35
                  ? product.notes.substring(0, 35).concat('...')
                  : product.notes}
              </p>
            </div>
          ),
        }}
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
