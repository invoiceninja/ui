/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '$app/components/forms';
import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { useBlankProductQuery } from '$app/common/queries/products';
import { Modal } from '$app/components/Modal';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Product } from '$app/common/interfaces/product';
import { request } from '$app/common/helpers/request';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useHandleChange } from '$app/pages/products/common/hooks';
import { toast } from '$app/common/helpers/toast/toast';
import { ProductForm } from '$app/pages/products/common/components/ProductForm';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { $refetch } from '$app/common/hooks/useRefetch';

interface Props {
  isModalOpen: boolean;
  setIsModalOpen?: any;
  onProductCreated?: (product: Product) => unknown;
}

export function ProductCreate(props: Props) {
  const [t] = useTranslation();

  const { data: blankProduct } = useBlankProductQuery();

  const [errors, setErrors] = useState<ValidationBag>();

  const [isFormBusy, setIsFormBusy] = useState(false);

  const [product, setProduct] = useState<Product>();

  const handleChange = useHandleChange({ setErrors, setProduct });

  const handleSave = () => {
    if (!isFormBusy) {
      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/products'), product)
        .then((response: GenericSingleResourceResponse<Product>) => {
          toast.success('created_product');

          $refetch(['products']);

          setTimeout(() => {
            props.onProductCreated?.(response.data.data);
          }, 200);

          props.setIsModalOpen(false);
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            setErrors(error.response.data);
            toast.dismiss();
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  useEffect(() => {
    if (blankProduct) {
      setProduct(blankProduct);
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
