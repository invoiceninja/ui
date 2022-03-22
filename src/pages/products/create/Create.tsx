/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useBlankProductQuery } from 'common/queries/products';
import { Container } from 'components/Container';
import { Default } from 'components/layouts/Default';
import { Spinner } from 'components/Spinner';
import { useTranslation } from 'react-i18next';
import { CreateProductComponent } from '../common/CreateProductComponent';

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
          <CreateProductComponent product={product.data.data} />
        ) : (
          <Spinner />
        )}
      </Container>
    </Default>
  );
}
