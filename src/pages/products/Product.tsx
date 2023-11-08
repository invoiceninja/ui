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
import { Product as ProductInterface } from '$app/common/interfaces/product';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useProductQuery } from '$app/common/queries/products';
import { Page } from '$app/components/Breadcrumbs';
import { Container } from '$app/components/Container';
import { Default } from '$app/components/layouts/Default';
import { ResourceActions } from '$app/components/ResourceActions';
import { Tabs } from '$app/components/Tabs';
import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams, useSearchParams } from 'react-router-dom';
import { useActions } from './common/hooks';
import { useHandleCompanySave } from '../settings/common/hooks/useHandleCompanySave';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useTabs } from './common/hooks/useTabs';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';

export default function Product() {
  const [t] = useTranslation();

  const saveCompany = useHandleCompanySave();

  const { id } = useParams();

  const hasPermission = useHasPermission();

  const { data: productData } = useProductQuery({ id });

  const actions = useActions();

  const [productValue, setProductValue] = useState<ProductInterface>();

  const [errors, setErrors] = useState<ValidationBag>();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const pages: Page[] = [
    { name: t('products'), href: '/products' },
    {
      name: t('edit_product'),
      href: route('/products/:id', { id }),
    },
  ];

  const tabs = useTabs();

  const [searchParams, setSearchParams] = useSearchParams();

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormBusy) {
      setErrors(undefined);
      setIsFormBusy(true);

      toast.processing();

      await saveCompany(true);

      const url = searchParams.has('update_in_stock_quantity')
        ? endpoint('/api/v1/products/:id?update_in_stock_quantity=true', { id })
        : endpoint('/api/v1/products/:id', { id });

      request('PUT', url, productValue)
        .then(() => {
          toast.success('updated_product');

          $refetch(['products']);

          searchParams.delete('update_in_stock_quantity');
          setSearchParams(searchParams);
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

  return (
    <Default
      title={t('edit_product')}
      breadcrumbs={pages}
      disableSaveButton={!productData || isFormBusy}
      {...(hasPermission('edit_product') &&
        productData && {
          onSaveClick: handleSave,
          navigationTopRight: (
            <ResourceActions
              label={t('more_actions')}
              resource={productData.data.data}
              actions={actions}
            />
          ),
        })}
    >
      <Container>
        <Tabs tabs={tabs} />

        <Outlet
          context={{
            errors,
            setErrors,
            product: productValue,
            setProduct: setProductValue,
          }}
        />
      </Container>
    </Default>
  );
}
