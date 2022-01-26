/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { useEffect, useState } from 'react';
import { ProductDetails } from 'common/interfaces/ProductDetail';
import { Card, Element } from '@invoiceninja/cards';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router';
import { useProductQuery } from '../../common/queries/products';
import { Container } from '../../components/Container';
import { Default } from '../../components/layouts/Default';
import { Spinner } from '../../components/Spinner';
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
  const [ProductDetails, setProductDetails] = useState<ProductDetails>(
    {} as ProductDetails
  );
  const [customValues, setCustomValues] = useState<string[]>([]);
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

  useEffect(() => {
    if (data?.data?.data) {
      const details = data.data.data;
      // fetch object props with keys matching cutom_value..
      const customValues: string[] = [];
      Object.keys(details).filter((key) => {
        if (key.includes('custom_value')) {
          if (details[key]) {
            customValues.push(details[key]);
          }
        }
      });
      setCustomValues(customValues);
      setProductDetails(details);
    }
  }, [data]);

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

        <Card>
          <Element leftSide={t('price')}>
            ${ProductDetails?.price?.toFixed(2)}
          </Element>
          <Element leftSide={t('Description')}>Product Description</Element>
          <Element>
            <ul>
              {customValues.map((item) => (
                <li key={item} className="py-1">
                  {item}
                </li>
              ))}
            </ul>
          </Element>
        </Card>
      </Container>
    </Default>
  );
}
