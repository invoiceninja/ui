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
import { SelectField } from '@invoiceninja/forms';
import { MdClose } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useAccentColor } from 'common/hooks/useAccentColor';
import { BiChevronRight } from 'react-icons/bi';
import classNames from 'classnames';

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
  const accentColor = useAccentColor();

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

  const getOptionLabelText = (productKey: string, price: number) => {
    return (
      productKey +
      ' ' +
      formatMoney(
        price,
        company?.settings.country_id,
        company?.settings.currency_id
      ).toString()
    );
  };

  useEffect(() => {
    if (props.products) {
      let filteredProducts: Product[] = [];

      props.subscription[props.type].split(',').forEach((productId) => {
        filteredProducts = filteredProducts.concat(
          props.products?.filter(({ id }) => id === productId) || []
        );
      });

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
              {getOptionLabelText(product.product_key, product.price)}
            </option>
          ))}
        </SelectField>
      )}

      <div
        className={classNames('flex justify-center', {
          'border-b border-gray-200': selectedProducts.length,
        })}
      >
        <ul
          className={classNames('flex flex-col justify-start', {
            'pb-3': selectedProducts.length,
          })}
        >
          {selectedProducts?.map((product, index) => (
            <li
              key={index}
              className="flex flex-1 justify-between items-center mt-3"
            >
              <BiChevronRight fontSize={18} />

              <div className="flex flex-1 justify-between items-center">
                <div className="flex space-x-2 font-medium">
                  <span>{product.product_key}</span>

                  <span>
                    {formatMoney(
                      product.price,
                      company?.settings.country_id,
                      company?.settings.currency_id
                    )}
                  </span>
                </div>

                <MdClose
                  className="cursor-pointer ml-20"
                  color={accentColor}
                  fontSize={19}
                  onClick={() => handleRemoveProduct(product.id)}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
