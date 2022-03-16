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
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { CreateComponent, CreateProductDto } from '../create/CreateComponent';

export function Clone() {
  const { id } = useParams();

  const { data: product } = useProductQuery({ id });
  const [initialValues, setInitialValues] = useState<CreateProductDto>();

  useEffect(() => {
    if (product) {
      setInitialValues({
        product_key: product?.data.data.product_key,
        notes: product?.data.data.notes,
        cost: product?.data.data.cost,
        custom_value1: product?.data.data.custom_value1,
        custom_value2: product?.data.data.custom_value2,
        custom_value3: product?.data.data.custom_value3,
        custom_value4: product?.data.data.custom_value4,
      });
    }
    console.log('data:', initialValues);
  }, [product]);

  return initialValues?<CreateComponent product={initialValues} />:<Spinner/>;
  
  
}
