/**
* Invoice Ninja (https://invoiceninja.com).
*
* @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
*
* @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
*
* @license https://www.elastic.co/licensing/elastic-license
*/

import { useBlankProductQuery } from "common/queries/products";
import { Container } from "components/Container";
import { Modal } from "components/Modal";
import { Spinner } from "components/Spinner";
import { CreateProduct } from "pages/products/common/components/CreateProduct";
import React from "react";
import { useTranslation } from "react-i18next";

interface Props{
    isModalOpen:boolean
    setIsModalOpen?:any
}
export function ProductCreate(props:Props) {
    const [t] = useTranslation();
    const { data: product } = useBlankProductQuery();

  
    return (
     <Modal
     title={t('new_product')}
     visible={props.isModalOpen}
     onClose={props.setIsModalOpen}
     size="large"
     backgroundColor="gray"
     >
        <Container>
          {product?.data.data ? (
            <CreateProduct noTitle noRedirect product={product.data.data} />
          ) : (
            <Spinner />
          )}
        </Container>
      </Modal>
    );
  }
  

