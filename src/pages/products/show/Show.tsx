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
import { Card, Element } from '@invoiceninja/cards';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router';
import { useProductQuery } from '../../../common/queries/products';
import { Container } from '../../../components/Container';
import { Default } from '../../../components/layouts/Default';
import { Tab, Tabs } from '../../../components/Tabs';
import { Product } from 'common/interfaces/product';

export function Show() {
  const [t] = useTranslation();
  const { id } = useParams();
  const [productDetails, setProductDetails] = useState<Product>({} as Product);
  const [customValues, setCustomValues] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  const tabs: Tab[] = [
    { name: t('overview'), href: generatePath('/products/:id', { id }) },

    {
      name: t('document'),
      href: generatePath('/products/:id/documents', { id }),
    },
  ];

  const pages = [
    { name: t('products'), href: '/products' },
    {
      name: t('product'),
      href: generatePath('/products/:id', { id }),
    },
  ];

  const { data } = useProductQuery({ id });

  useEffect(() => {
    if (data?.data?.data) {
      const details = data.data.data;
      setDescription(details.notes);
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

  return (
    <>
      {data && (
        <Card title={t('overview')}>
          <Element leftSide={t('price')}>
            ${productDetails?.price?.toFixed(2)}
          </Element>
          <Element leftSide={t('Description')}>{description}</Element>
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
      )}
    </>
  );
}
