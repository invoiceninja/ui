/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '$app/components/cards';
import { useProductQuery } from '$app/common/queries/products';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { ProductForm } from '../common/components/ProductForm';
import { useHandleChange } from '../common/hooks';
import { Spinner } from '$app/components/Spinner';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Product } from '$app/common/interfaces/product';
import { useTitle } from '$app/common/hooks/useTitle';

interface Context {
  errors: ValidationBag | undefined;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  product: Product;
  setProduct: Dispatch<SetStateAction<Product | undefined>>;
}

export default function Edit() {
  const { documentTitle } = useTitle('edit_product');

  const { id } = useParams();

  const { data: productResponse } = useProductQuery({ id });

  const context: Context = useOutletContext();

  const { setErrors, setProduct, product, errors } = context;

  const handleChange = useHandleChange({ setErrors, setProduct });

  useEffect(() => {
    if (productResponse) {
      setProduct(productResponse.data.data);
    }
  }, [productResponse]);

  return (
    <>
      {productResponse && product ? (
        <Card title={productResponse.data.data.product_key || documentTitle}>
          <ProductForm
            product={product}
            errors={errors}
            handleChange={handleChange}
            type="edit"
          />
        </Card>
      ) : (
        <Spinner />
      )}
    </>
  );
}
