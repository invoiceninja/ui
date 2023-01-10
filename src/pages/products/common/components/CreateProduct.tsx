/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { endpoint } from 'common/helpers';
import { Card } from '@invoiceninja/cards';
import { useTitle } from 'common/hooks/useTitle';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useAtom } from 'jotai';
import { productAtom } from '../atoms';
import { Product } from 'common/interfaces/product';
import { toast } from 'common/helpers/toast/toast';
import { useHandleChange } from '../hooks';
import { ProductForm } from './ProductForm';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';

interface Props {
  product?: Product;
}

export function CreateProduct(props: Props) {
  const [t] = useTranslation();

  useTitle(t('new_product'));

  const navigate = useNavigate();

  const [errors, setErrors] = useState<any>();

  const [isFormBusy, setIsFormBusy] = useState(false);

  const [product, setProduct] = useAtom(productAtom);

  const handleChange = useHandleChange({ setErrors, setProduct });

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormBusy) {
      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/products'), product)
        .then((response: GenericSingleResourceResponse<Product>) => {
          toast.success('created_product');

          navigate(
            route('/products/:id/edit', {
              id: response.data.data.id,
            })
          );
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            setErrors(error.response.data);
            toast.dismiss();
          } else {
            console.log(error);
            toast.error();
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  useEffect(() => {
    if (!product) {
      setProduct(props.product);
    }

    return () => setProduct(undefined);
  }, [props.product]);

  return (
    <Card
      title={t('new_product')}
      withSaveButton
      disableSubmitButton={isFormBusy}
      onFormSubmit={handleSave}
    >
      {product && (
        <ProductForm
          errors={errors}
          handleChange={handleChange}
          product={product}
        />
      )}
    </Card>
  );
}
