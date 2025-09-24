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
import { endpoint, trans } from '$app/common/helpers';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import classNames from 'classnames';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useColorScheme } from '$app/common/colors';
import { ErrorMessage } from '../ErrorMessage';

interface Props {
  defaultValue?: string | number | boolean;
  clearButton?: boolean;
  className?: string;
  onChange?: (value: Entry<Product>) => unknown;
  onClearButtonClick?: () => unknown;
  onProductCreated?: (product: Product) => unknown;
  onInputFocus?: () => unknown;
  errorMessage?: string | string[];
  displayStockQuantity?: boolean;
  onInputValueChange?: (value: string) => void;
  label?: string | undefined;
  withoutAction?: boolean;
  clearInputAfterSelection?: boolean;
  withShadow?: boolean;
}

export function ProductSelector(props: Props) {
  const [t] = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const colors = useColorScheme();
  const currentCompany = useCurrentCompany();

  const hasPermission = useHasPermission();

  return (
    <>
      <ProductCreate
        setIsModalOpen={setIsModalOpen}
        isModalOpen={isModalOpen}
        onProductCreated={props.onProductCreated}
      />

      <ComboboxAsync<Product>
        endpoint={endpoint('/api/v1/products?per_page=800')}
        inputOptions={{ value: props.defaultValue ?? null, label: props.label }}
        entryOptions={{
          id: 'id',
          label: 'product_key',
          value: 'id',
          searchable: 'notes',
          dropdownLabelFn: (product) => (
            <div className="flex flex-col flex-1 max-w-64">
              <div className="flex space-x-1">
                <p className="font-medium truncate">{product.product_key}</p>

                {currentCompany?.track_inventory &&
                  props.displayStockQuantity && (
                    <p
                      className={classNames({
                        'text-red-700': product.in_stock_quantity <= 0,
                      })}
                    >
                      (
                      {trans('stock_quantity_number', {
                        quantity: product.in_stock_quantity,
                      })}
                      )
                    </p>
                  )}
              </div>

              <p
                className="text-xs font-medium truncate"
                style={{ color: colors.$22 }}
              >
                {product.notes}
              </p>
            </div>
          ),
        }}
        onChange={(product) => props.onChange && props.onChange(product)}
        onInputValueChange={props.onInputValueChange}
        action={{
          label: t('new_product'),
          onClick: () => setIsModalOpen(true),
          visible: hasPermission('create_product') && !props.withoutAction,
        }}
        onDismiss={props.onClearButtonClick}
        sortBy="product_key|asc"
        nullable
        key="product_selector"
        clearInputAfterSelection={props.clearInputAfterSelection}
        withShadow={props.withShadow}
      />

      <ErrorMessage className="mt-2">{props.errorMessage}</ErrorMessage>
    </>
  );
}
