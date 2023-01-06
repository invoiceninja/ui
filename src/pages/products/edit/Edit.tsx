/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '@invoiceninja/cards';
import { AxiosError } from 'axios';
import { EntityState } from 'common/enums/entity-state';
import { endpoint, getEntityState } from 'common/helpers';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { bulk, useProductQuery } from 'common/queries/products';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { useState, useEffect, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { ProductForm } from '../common/components/ProductForm';
import { useHandleChange } from '../common/hooks';
import { toast } from 'common/helpers/toast/toast';
import { Spinner } from 'components/Spinner';
import { productAtom } from '../common/atoms';
import { Product } from 'common/interfaces/product';
import { useUpdateAtom } from 'jotai/utils';
import { Icon } from 'components/icons/Icon';
import {
  MdArchive,
  MdControlPointDuplicate,
  MdDelete,
  MdRestore,
} from 'react-icons/md';

export function Edit() {
  const { id } = useParams();

  const { data: productResponse } = useProductQuery({ id });

  const queryClient = useQueryClient();

  const [t] = useTranslation();

  const navigate = useNavigate();

  const [errors, setErrors] = useState<ValidationBag>();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [product, setProduct] = useState<Product>();

  const setProductAtom = useUpdateAtom(productAtom);

  const cloneToProduct = () => {
    if (product) {
      setProductAtom({ ...product, id: '', documents: [] });

      navigate('/products/create');
    }
  };

  const handleResourcefulAction = (
    action: 'archive' | 'restore' | 'delete',
    id: string
  ) => {
    toast.processing();

    bulk([id], action)
      .then(() => {
        toast.success(t(`${action}d_product`) || '');

        queryClient.invalidateQueries(route('/api/v1/products/:id', { id }));
      })
      .catch((error) => {
        console.error(error);
        toast.error();
      });
  };

  const handleChange = useHandleChange({ setErrors, setProduct });

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormBusy) {
      setErrors(undefined);

      setIsFormBusy(true);

      request('PUT', endpoint('/api/v1/products/:id', { id }), product)
        .then(() => {
          toast.success('updated_product');

          queryClient.invalidateQueries(route('/api/v1/products/:id', { id }));
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            setErrors(error.response.data);
            toast.dismiss();
          } else {
            console.error(error);
            toast.error();
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  useEffect(() => {
    setProduct(productResponse?.data?.data);
  }, [productResponse]);

  return (
    <>
      {product ? (
        <Card
          title={product.product_key || t('edit_product')}
          disableSubmitButton={isFormBusy}
          onFormSubmit={handleSave}
          withSaveButton
        >
          <ProductForm
            product={product}
            errors={errors}
            handleChange={handleChange}
            type="edit"
          />
        </Card>
      ) : (
        <Spinner />
      )}

      {product && (
        <div className="flex justify-end">
          <Dropdown label={t('more_actions')}>
            <DropdownElement
              onClick={cloneToProduct}
              icon={<Icon element={MdControlPointDuplicate} />}
            >
              {t('clone')}
            </DropdownElement>

            {getEntityState(product) === EntityState.Active && (
              <DropdownElement
                onClick={() => handleResourcefulAction('archive', product.id)}
                icon={<Icon element={MdArchive} />}
              >
                {t('archive')}
              </DropdownElement>
            )}

            {(getEntityState(product) === EntityState.Archived ||
              getEntityState(product) === EntityState.Deleted) && (
              <DropdownElement
                onClick={() => handleResourcefulAction('restore', product.id)}
                icon={<Icon element={MdRestore} />}
              >
                {t('restore')}
              </DropdownElement>
            )}

            {(getEntityState(product) === EntityState.Active ||
              getEntityState(product) === EntityState.Archived) && (
              <DropdownElement
                onClick={() => handleResourcefulAction('delete', product.id)}
                icon={<Icon element={MdDelete} />}
              >
                {t('delete')}
              </DropdownElement>
            )}
          </Dropdown>
        </div>
      )}
    </>
  );
}
