/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useProductsQuery } from '$app/common/queries/products';
import { Element } from '$app/components/cards';
import { SelectOption } from '$app/components/datatables/Actions';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select, { MultiValue, StylesConfig } from 'react-select';
import { Report } from '../useReports';
import { useColorScheme } from '$app/common/colors';

interface Props {
  setReport: Dispatch<SetStateAction<Report>>;
}
export function ProductItemsSelector(props: Props) {
  const [t] = useTranslation();

  const { setReport } = props;

  const [productItems, setProductItems] = useState<SelectOption[]>([]);

  const { data: products } = useProductsQuery();
  const colors = useColorScheme();

  useEffect(() => {
    if (products) {
      setProductItems(
        products.map((product) => ({
          value: product.product_key,
          label: product.product_key,
          color: colors.$3,
          backgroundColor: colors.$1,
        }))
      );
    }
  }, [products]);

  const handleChange = (
    products: MultiValue<{ value: string; label: string }>
  ) => {
    const values: Array<string> = (products as SelectOption[]).map(
      (option: { value: string; label: string }) => option.value
    );

    setReport((current) => ({
      ...current,
      payload: { ...current.payload, product_key: values.join(',') },
    }));
  };

  const customStyles: StylesConfig<SelectOption, true> = {
    multiValue: (styles, { data }) => {
      return {
        ...styles,
        backgroundColor: data.backgroundColor,
        color: data.color,
        borderRadius: '3px',
      };
    },
    multiValueLabel: (styles, { data }) => ({
      ...styles,
      color: data.color,
    }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    multiValueRemove: (styles) => ({
      ...styles,
      ':hover': {
        color: 'white',
      },
      color: '#999999',
    }),
    menu: (base) => ({
      ...base,
      width: 'max-content',
      minWidth: '100%',
      backgroundColor: colors.$4,
      borderColor: colors.$4,
    }),
    control: (base) => ({
      ...base,
      borderRadius: '3px',
      backgroundColor: colors.$1,
      color: colors.$3,
      borderColor: colors.$5,
    }),
    option: (base) => ({
      ...base,
      backgroundColor: colors.$1,
      ':hover': {
        backgroundColor: colors.$7,
      },
    }),
  };


  return (
    <Element leftSide={t('products')}>
      <Select
        styles={customStyles}
        defaultValue={null}
        onChange={(options) => handleChange(options)}
        placeholder={t('products')}
        options={productItems}
        isMulti={true}
      />
    </Element>
  );
}
