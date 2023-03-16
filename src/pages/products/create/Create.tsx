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
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useBlankProductQuery } from '$app/common/queries/products';
import { Container } from '$app/components/Container';
import { Default } from '$app/components/layouts/Default';
import { Spinner } from '$app/components/Spinner';
import { useAtom } from 'jotai';
import { cloneDeep } from 'lodash';
import { ProductTableResource } from '$app/pages/invoices/common/components/ProductsTable';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productAtom } from '../common/atoms';
import { CreateProduct } from '../common/components/CreateProduct';

export function Create() {
  const [t] = useTranslation();

  const [product, setProduct] = useAtom(productAtom);
  const navigate = useNavigate();

  const { data } = useBlankProductQuery({
    enabled: typeof product === 'undefined',
  });

  const pages = [
    { name: t('products'), href: '/products' },
    { name: t('new_product'), href: '/products/create' },
  ];

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationBag>();
  const [searchParams] = useSearchParams();

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormBusy) {
      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/products'), product)
        .then(
          (response: GenericSingleResourceResponse<ProductTableResource>) => {
            toast.success('created_product');

            navigate(
              route('/products/:id/edit', {
                id: response.data.data.id,
              })
            );
          }
        )
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
    setProduct((current) => {
      let value = current;

      if (searchParams.get('action') !== 'clone') {
        value = undefined;
      }

      if (
        typeof data !== 'undefined' &&
        typeof value === 'undefined' &&
        searchParams.get('action') !== 'clone'
      ) {
        value = cloneDeep(data);
      }

      return value;
    });
  }, [data]);

  return (
    <Default
      title={t('new_product')}
      breadcrumbs={pages}
      disableSaveButton={!data || isFormBusy}
      onSaveClick={handleSave}
    >
      <Container>
        {data ? (
          <CreateProduct errors={errors} setErrors={setErrors} />
        ) : (
          <Spinner />
        )}
      </Container>
    </Default>
  );
}
