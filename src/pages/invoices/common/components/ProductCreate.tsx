/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '@invoiceninja/forms';
import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { useTitle } from 'common/hooks/useTitle';
import { useBlankProductQuery } from 'common/queries/products';
import { Modal } from 'components/Modal';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Product } from 'common/interfaces/product';
import { request } from 'common/helpers/request';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useHandleChange } from 'pages/products/common/hooks';
import { toast } from 'common/helpers/toast/toast';
import { ProductForm } from 'pages/products/common/components/ProductForm';
import { useQueryClient } from 'react-query';

interface Props {
  isModalOpen: boolean;
  setIsModalOpen?: any;
  onProductCreated?: (product: Product) => unknown;
}

export function ProductCreate(props: Props) {
  const [t] = useTranslation();

  const { data: blankProduct } = useBlankProductQuery();

  useTitle(t('new_product'));

  const queryClient = useQueryClient();

  const [errors, setErrors] = useState<ValidationBag>();

  const [isFormBusy, setIsFormBusy] = useState(false);

  const [product, setProduct] = useState<Product>();

  const handleChange = useHandleChange({ setErrors, setProduct });

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormBusy) {
      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/products'), product)
        .then(() => {
          toast.success('created_product');

          queryClient.invalidateQueries('/api/v1/products');

          window.dispatchEvent(
            new CustomEvent('invalidate.combobox.queries', {
              detail: {
                url: endpoint('/api/v1/products'),
              },
            })
          );

          props.setIsModalOpen(false);
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
    if (blankProduct) {
      setProduct(blankProduct.data.data);
    }
  }, [blankProduct]);

  return (
    <Modal
      title={t('new_product')}
      visible={props.isModalOpen}
      onClose={props.setIsModalOpen}
      backgroundColor="gray"
      size="small"
    >
      {product && (
        <ProductForm
          product={product}
          errors={errors}
          handleChange={handleChange}
        />
      )}

      <Button type="primary" behavior="button" onClick={handleSave}>
        {t('save')}
      </Button>
    </Modal>
  );
}
