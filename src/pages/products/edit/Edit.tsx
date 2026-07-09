/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Dispatch, SetStateAction, useEffect } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { useTitle } from '$app/common/hooks/useTitle';
import { Product } from '$app/common/interfaces/product';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useProductQuery } from '$app/common/queries/products';
import { Card } from '$app/components/cards';
import { Spinner } from '$app/components/Spinner';
import { ProductForm } from '../common/components/ProductForm';
import { useHandleChange } from '../common/hooks';

interface Context {
  errors: ValidationBag | undefined;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  product: Product;
  setProduct: Dispatch<SetStateAction<Product | undefined>>;
}

export default function Edit() {
  const { documentTitle } = useTitle('edit_product');

  const { id } = useParams();

  const colors = useColorScheme();

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
        <Card
          title={productResponse.data.data.product_key || documentTitle}
          className="shadow-sm"
          style={{ borderColor: colors.$24 }}
          headerStyle={{ borderColor: colors.$20 }}
        >
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
