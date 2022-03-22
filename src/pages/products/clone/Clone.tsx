/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useProductQuery } from 'common/queries/products';
import { Spinner } from 'components/Spinner';
import { useParams } from 'react-router';
import { CreateProduct } from '../common/components/CreateProduct';

export function Clone() {
  const { id } = useParams();

  const { data: product } = useProductQuery({ id });

  return product?.data.data ? (
    <CreateProduct product={product.data.data} />
  ) : (
    <Spinner />
  );
}
