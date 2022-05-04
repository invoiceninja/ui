/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useBlankProductQuery } from 'common/queries/products';
import { Container } from 'components/Container';
import { Default } from 'components/layouts/Default';
import { Spinner } from 'components/Spinner';
import { useTranslation } from 'react-i18next';
import { CreateProduct } from '../common/components/CreateProduct';

export function Create() {
  const [t] = useTranslation();
  const { data: product } = useBlankProductQuery();

  const pages = [
    { name: t('products'), href: '/products' },
    { name: t('new_product'), href: '/products/create' },
  ];

  return (
    <Default breadcrumbs={pages}>
      <Container>
        {product?.data.data ? (
          <CreateProduct product={product.data.data} />
        ) : (
          <Spinner />
        )}
      </Container>
    </Default>
  );
}
