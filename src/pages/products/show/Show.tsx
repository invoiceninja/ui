/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { Product } from 'common/interfaces/product';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useProductQuery } from '../../../common/queries/products';
import { Status } from '../components/Status';

export function Show() {
  const [t] = useTranslation();
  const { id } = useParams();

  const { data: product } = useProductQuery({ id });

  return (
    <>
      {product && (
        <Card title={t('overview')}>
          <Element leftSide={t('status')}>
            <Status product={product.data.data as Product} />
          </Element>

          <Element leftSide={t('product')}>
            {product.data.data.product_key}
          </Element>

          <Element leftSide={t('price')}>
            {product.data.data.price?.toFixed(2)}
          </Element>

          <Element leftSide={t('description')}>
            {product.data.data.notes}
          </Element>

          <Element leftSide={t('price')}>{product.data.data.cost}</Element>

          <Element leftSide={t('default_quantity')}>
            {product.data.data.quantity}
          </Element>
        </Card>
      )}
    </>
  );
}
