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
import { DebouncedCombobox, Record } from '$app/components/forms/DebouncedCombobox';
import { ProductCreate } from '$app/pages/invoices/common/components/ProductCreate';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  defaultValue?: string | number | boolean;
  clearButton?: boolean;
  className?: string;
  onChange?: (value: Record<Product>) => unknown;
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
      <DebouncedCombobox
        endpoint="/api/v1/products?per_page=500"
        label="product_key"
        onChange={(record: Record<Product>) =>
          props.onChange && props.onChange(record)
        }
        className={props.className}
        onActionClick={() => setIsModalOpen(true)}
        actionLabel={t('new_product')}
        defaultValue={props.defaultValue}
        clearButton={props.clearButton}
        onClearButtonClick={props.onClearButtonClick}
        onInputFocus={props.onInputFocus}
        sortBy="product_key|asc"
        withShadowRecord
        errorMessage={props.errorMessage}
      />

      <ProductCreate
        setIsModalOpen={setIsModalOpen}
        isModalOpen={isModalOpen}
        onProductCreated={props.onProductCreated}
      />
    </>
  );
}
