/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Product } from 'common/interfaces/product';
import { DebouncedCombobox, Record } from 'components/forms/DebouncedCombobox';
import { ProductCreate } from 'pages/invoices/common/components/ProductCreate';
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
}

export function ProductSelector(props: Props) {
  const [t] = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <DebouncedCombobox
        endpoint="/api/v1/products?limit=500"
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
        withShadowRecord
      />

      <ProductCreate
        setIsModalOpen={setIsModalOpen}
        isModalOpen={isModalOpen}
        onProductCreated={props.onProductCreated}
      />
    </>
  );
}
