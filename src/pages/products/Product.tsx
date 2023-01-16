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
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { Product as ProductInterface } from 'common/interfaces/product';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useProductQuery } from 'common/queries/products';
import { Page } from 'components/Breadcrumbs';
import { Container } from 'components/Container';
import { Default } from 'components/layouts/Default';
import { ResourceActions } from 'components/ResourceActions';
import { Tab, Tabs } from 'components/Tabs';
import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { Outlet, useParams } from 'react-router-dom';
import { useActions } from './common/hooks';

export function Product() {
  const [t] = useTranslation();

  const { id } = useParams();

  const queryClient = useQueryClient();

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

  const tabs: Tab[] = [
    {
      name: t('edit'),
      href: route('/products/:id/edit', { id }),
    },
    {
      name: t('documents'),
      href: route('/products/:id/documents', { id }),
    },
    {
      name: t('product_fields'),
      href: route('/products/:id/product_fields', { id }),
    },
  ];

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormBusy) {
      setErrors(undefined);

      setIsFormBusy(true);

      request('PUT', endpoint('/api/v1/products/:id', { id }), productValue)
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

  return (
    <Default
      title={t('edit_product')}
      breadcrumbs={pages}
      disableSaveButton={!productData || isFormBusy}
      onSaveClick={handleSave}
      navigationTopRight={
        productData && (
          <ResourceActions
            label={t('more_actions')}
            resource={productData.data.data}
            actions={actions}
          />
        )
      }
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
