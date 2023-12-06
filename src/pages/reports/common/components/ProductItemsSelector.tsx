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
import { scheduleParametersAtom } from '$app/pages/settings/schedules/common/components/EmailStatement';
import { useAtom } from 'jotai';

interface Props {
  setReport: Dispatch<SetStateAction<Report>>;
}
export function ProductItemsSelector(props: Props) {
  const [t] = useTranslation();

  const { setReport } = props;

  const [productItems, setProductItems] = useState<SelectOption[]>([]);

  const { data: products } = useProductsQuery();

  const [parametersAtom, setParametersAtom] = useAtom(scheduleParametersAtom);

  useEffect(() => {
    if (products) {
      setProductItems(
        products.map((product) => ({
          value: product.product_key,
          label: product.product_key,
          color: 'black',
          backgroundColor: '#e4e4e4',
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

    setParametersAtom((current) => current && { ...current, product_key: values.join(',') });

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
    multiValueRemove: (styles) => ({
      ...styles,
      ':hover': {
        color: 'white',
      },
      color: '#999999',
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
