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
import { Link, SelectField } from '@invoiceninja/forms';
import { MdClose } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useAccentColor } from 'common/hooks/useAccentColor';
import { route } from 'common/helpers/route';
import { BsBox } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

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

  const navigate = useNavigate();

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

      <div className="flex justify-center">
        <ul role="list" className="-mb-8 mt-3">
          {selectedProducts.map((product, index) => (
            <li key={index}>
              <div className="relative pb-8">
                {index !== selectedProducts.length - 1 && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <span
                    className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    <BsBox
                      className="h-4 w-4 text-white cursor-pointer"
                      aria-hidden="true"
                      onClick={() =>
                        navigate(
                          route(`/products/:id/edit`, { id: product.id })
                        )
                      }
                    />
                  </span>

                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div className="flex flex-1 justify-between space-x-5">
                      <Link
                        to={route(`/products/:id/edit`, { id: product.id })}
                      >
                        {product.product_key}
                      </Link>

                      <span>
                        {formatMoney(
                          product.price,
                          company?.settings.country_id,
                          company?.settings.currency_id
                        )}
                      </span>
                    </div>

                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      <MdClose
                        className="cursor-pointer ml-10 xl:ml-20"
                        color={accentColor}
                        fontSize={19}
                        onClick={() => handleRemoveProduct(product.id)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
