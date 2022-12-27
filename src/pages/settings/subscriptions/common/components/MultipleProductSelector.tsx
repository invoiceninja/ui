/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Product } from 'common/interfaces/product';
import { Subscription } from 'common/interfaces/subscription';
import { Button, SelectField } from '@invoiceninja/forms';
import { MdClose } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';

interface Props {
  type:
    | 'product_ids'
    | 'recurring_product_ids'
    | 'optional_product_ids'
    | 'optional_recurring_product_ids';
  subscription: Subscription;
  handleChange: (
    property: keyof Subscription,
    value: Subscription[keyof Subscription]
  ) => void;
  products: Product[] | undefined;
}

export function MultipleProductSelector(props: Props) {
  const company = useCurrentCompany();

  const formatMoney = useFormatMoney();

  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const [selectedProductId, setSelectedProductId] = useState<string>();

  const handleRemoveProduct = (productId: string) => {
    const productIndex = selectedProducts.findIndex(
      ({ id }) => id === productId
    );

    if (productIndex > -1) {
      const updatedSelectedProducts = selectedProducts.filter(
        (product, index) => index !== productIndex
      );

      setSelectedProducts(updatedSelectedProducts);

      const productIdsList = updatedSelectedProducts.map(({ id }) => id);

      props.handleChange(props.type, productIdsList.join(','));
    }
  };

  useEffect(() => {
    if (props.products) {
      const filteredProducts = props.products.filter(({ id }) =>
        props.subscription[props.type].includes(id)
      );

      setSelectedProducts(filteredProducts);
    }
  }, [props.products]);

  useEffect(() => {
    if (props.products && selectedProductId) {
      const selectedProduct = props.products.filter(
        ({ id }) => selectedProductId === id
      );

      setSelectedProducts((prevState) => [...prevState, ...selectedProduct]);

      setSelectedProductId('');
    }
  }, [selectedProductId]);

  useEffect(() => {
    if (props.products) {
      const productIdsList = selectedProducts.map(({ id }) => id);

      props.handleChange(props.type, productIdsList.join(','));
    }
  }, [selectedProducts]);

  return (
    <>
      {props.products && (
        <SelectField
          onValueChange={(value) => setSelectedProductId(value)}
          value={selectedProductId}
          withBlank
        >
          {props.products.map((product, index) => (
            <option key={index} value={product.id}>
              {product.product_key}{' '}
              {formatMoney(
                product.price,
                company?.settings.country_id,
                company?.settings.currency_id
              )}
            </option>
          ))}
        </SelectField>
      )}

      <div className="flex justify-center">
        <div className="flex flex-col justify-start">
          {selectedProducts?.map((product, index) => (
            <div
              key={index}
              className="flex flex-1 justify-start items-center space-x-2 mt-3"
            >
              <span>
                {product.product_key}{' '}
                {formatMoney(
                  product.price,
                  company?.settings.country_id,
                  company?.settings.currency_id
                )}
              </span>

              <Button
                behavior="button"
                type="minimal"
                onClick={() => handleRemoveProduct(product.id)}
              >
                <MdClose />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
