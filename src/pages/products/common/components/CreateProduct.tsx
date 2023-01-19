/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Dispatch, SetStateAction, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { isProduction } from 'common/helpers';
import { Card } from '@invoiceninja/cards';
import { useTitle } from 'common/hooks/useTitle';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useAtom } from 'jotai';
import { productAtom } from '../atoms';
import { Product } from 'common/interfaces/product';
import { useHandleChange } from '../hooks';
import { ProductForm } from './ProductForm';

interface Props {
  product?: Product;
  errors: ValidationBag | undefined;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
}

export function CreateProduct(props: Props) {
  const [t] = useTranslation();

  useTitle(t('new_product'));

  const [product, setProduct] = useAtom(productAtom);

  const handleChange = useHandleChange({
    setErrors: props.setErrors,
    setProduct,
  });

  useEffect(() => {
    if (!product) {
      setProduct(props.product);
    }

    return () => {
      isProduction() && setProduct(undefined);
    };
  }, [props.product]);

  return (
    <Card title={t('new_product')}>
      {product && (
        <ProductForm
          errors={props.errors}
          handleChange={handleChange}
          product={product}
        />
      )}
    </Card>
  );
}
