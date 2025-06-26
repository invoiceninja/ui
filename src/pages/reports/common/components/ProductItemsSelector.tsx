/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Spinner } from '$app/components/Spinner';
import { Element } from '$app/components/cards';
import { SelectOption } from '$app/components/datatables/Actions';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MultiValue } from 'react-select';
import { useColorScheme } from '$app/common/colors';
import { Alert } from '$app/components/Alert';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { Product } from '$app/common/interfaces/product';
import { useQuery, useQueryClient } from 'react-query';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { CustomMultiSelect } from '$app/components/forms/CustomMultiSelect';

interface Props {
  value?: string;
  onValueChange: (productsKeys: string) => void;
  errorMessage?: string[] | string;
}
export function ProductItemsSelector(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const queryClient = useQueryClient();

  const { value, onValueChange, errorMessage } = props;

  const filterTimeOut = useRef<NodeJS.Timeout | undefined>(undefined);

  const [filter, setFilter] = useState<string>('');
  const [isInitial, setIsInitial] = useState<boolean>(Boolean(value));
  const [productItems, setProductItems] = useState<SelectOption[]>();

  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/v1/products', 'perPage=500', 'status=active', filter],
    queryFn: () =>
      request(
        'GET',
        endpoint(
          '/api/v1/products?per_page=:perPage&include=&status=active&filter=:filter',
          {
            filter,
            perPage: import.meta.env.VITE_IS_TEST === 'true' ? 4 : 500,
          }
        )
      ).then(
        (response: GenericSingleResourceResponse<Product[]>) =>
          response.data.data
      ),
    enabled: !isInitial,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (products && !isInitial) {
      const existingValues = value
        ? value
            .split("',")
            .map((val) => val.trim().replace(/'/g, ''))
            .filter(Boolean)
        : [];

      const newProductItems = products.map((product) => ({
        value: product.product_key,
        label: product.product_key,
        color: colors.$3,
        backgroundColor: colors.$1,
      }));

      let finalProductItems;

      if (productItems !== undefined && productItems.length > 0) {
        const newItems = newProductItems.filter(
          (product) =>
            !productItems.some(
              (currentItem) => currentItem.value === product.value
            )
        );

        finalProductItems = [...productItems, ...newItems];
      } else {
        finalProductItems = newProductItems;
      }

      const sortedItems = finalProductItems.sort((a, b) => {
        const aIndex = existingValues.indexOf(a.value);
        const bIndex = existingValues.indexOf(b.value);

        if (aIndex !== -1 && bIndex === -1) return -1;
        if (bIndex !== -1 && aIndex === -1) return 1;
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;

        return 0;
      });

      setProductItems(sortedItems);
    }
  }, [products, isInitial, value]);

  useEffect(() => {
    if (value && isInitial) {
      (async () => {
        for (let index = 0; index < value.split("',").length; index++) {
          const currentFilter =
            value.split("',")[index]?.trim().replace(/'/g, '') || '';

          const productsResponse = await queryClient.fetchQuery<Product[]>(
            ['/api/v1/products', 'perPage=500', 'status=active', currentFilter],
            () =>
              request(
                'GET',
                endpoint(
                  '/api/v1/products?per_page=:perPage&include=&status=active&filter=:filter',
                  {
                    filter: currentFilter,
                    perPage: import.meta.env.VITE_IS_TEST === 'true' ? 4 : 500,
                  }
                )
              ).then(
                (response: GenericSingleResourceResponse<Product[]>) =>
                  response.data.data
              ),
            { staleTime: Infinity }
          );

          setProductItems((currentProductItems) => {
            const productItemsList = currentProductItems || [];

            const currentProductList = !productItemsList.find(
              ({ value }) => value === currentFilter
            )
              ? productsResponse
                  .map((product) => ({
                    value: product.product_key,
                    label: product.product_key,
                    color: colors.$3,
                    backgroundColor: colors.$1,
                  }))
                  .filter((product) => product.value === currentFilter)
              : [];

            return currentProductList[0]
              ? [...productItemsList, currentProductList[0]]
              : [...productItemsList];
          });
        }

        setIsInitial(false);
      })();
    }
  }, [value]);

  const handleChange = (
    products: MultiValue<{ value: string; label: string }>
  ) => {
    return (products as SelectOption[])
      .map((option: { value: string; label: string }) => `'${option.value}'`)
      .join(',');
  };

  console.log(value);

  return (
    <>
      {productItems && !isInitial ? (
        <Element leftSide={t('products')}>
          <div className="flex space-x-3">
            <div className="flex-1">
              <CustomMultiSelect
                id="productItemSelector"
                {...(value && {
                  defaultValue: productItems?.filter((option) =>
                    value
                      .split("',")
                      .find(
                        (productKey) =>
                          productKey.trim().replace(/'/g, '') === option.value
                      )
                  ),
                })}
                onValueChange={(options) =>
                  onValueChange(handleChange(options))
                }
                options={productItems}
                onInputChange={(filterValue) => {
                  clearTimeout(filterTimeOut.current);

                  const currentTimeout = setTimeout(
                    () => setFilter(filterValue),
                    600
                  );

                  filterTimeOut.current = currentTimeout;
                }}
                isSearchable={true}
              />
            </div>

            {isLoading && (
              <div className="flex justify-center items-center">
                <Spinner />
              </div>
            )}
          </div>
        </Element>
      ) : (
        <div className="flex justify-center items-center">
          <Spinner />
        </div>
      )}

      {errorMessage && (
        <Alert className="mt-2" type="danger">
          {errorMessage}
        </Alert>
      )}
    </>
  );
}
