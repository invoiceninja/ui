/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router';
import { endpoint } from '../../common/helpers';
import { bulk, useProductQuery } from '../../common/queries/products';
import { Alert } from '../../components/Alert';
import { Container } from '../../components/Container';
import { Button } from '../../components/forms/Button';
import { InputField } from '../../components/forms/InputField';
import { Textarea } from '../../components/forms/Textarea';
import { Default } from '../../components/layouts/Default';
import { Spinner } from '../../components/Spinner';
import { Badge } from '../../components/Badge';
import { useQueryClient } from 'react-query';
import { defaultHeaders } from 'common/queries/common/headers';
import toast from 'react-hot-toast';
import { Breadcrumbs } from 'components/Breadcrumbs';
import { Tab, Tabs } from '../../components/Tabs';
interface UpdateProductDto {
  product_key: string;
  notes: string;
  cost: string;
}

export function View() {
  const [t] = useTranslation();
  const { id } = useParams();
  //   console.log(id);

  //   Tabs
  const tabs: Tab[] = [
    { name: t('overview'), href: generatePath('/products/:id', { id }) },

    {
      name: t('document'),
      href: generatePath('/products/:id/payments', { id }),
    },
  ];
  //   pages
  const pages = [
    { name: t('products'), href: '/products' },
    {
      name: t('product'),
      href: generatePath('/products/:id', { id }),
    },
  ];

  const { data, isLoading } = useProductQuery({ id });

  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${
      data?.data.data.product_key
    }`;
  }, [data]);

  if (isLoading) {
    return (
      <Default>
        <Container>
          <div className="flex justify-center">
            <Spinner />
          </div>
        </Container>
      </Default>
    );
  }

  return (
    <Default>
      <Container>
        <Breadcrumbs pages={pages} />
        <Tabs tabs={tabs} className="mt-6" />

        <div className="bg-white w-full py-8 px-4 my-1 shadow my-0">
          <p className="text-sm pb-3">{t('Price')}</p>
          <h1 className="text-xl text-gray-600 font-semibold">$143</h1>
        </div>
        <div className="bg-white w-full py-8 px-4 my-1 shadow my-0">
          <p className="text-sm pb-3">{t('Price')}</p>
          <h1 className="text-xl text-gray-600 font-semibold">$143</h1>
        </div>
        <div className="bg-white w-full py-8 px-4 my-1 shadow my-0">
          <p className="text-sm pb-3">{t('Price')}</p>
          <h1 className="text-xl text-gray-600 font-semibold">$143</h1>
        </div>
      </Container>
    </Default>
  );
}
