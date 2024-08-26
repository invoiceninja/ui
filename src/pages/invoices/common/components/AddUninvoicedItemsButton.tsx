/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { Invoice } from '$app/common/interfaces/invoice';
import { Product } from '$app/common/interfaces/product';
import { useProductsQuery } from '$app/common/queries/products';
import { Button, Checkbox } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Modal } from '$app/components/Modal';
import { TabGroup } from '$app/components/TabGroup';
import { Tooltip } from '$app/components/Tooltip';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdAdd } from 'react-icons/md';
import styled from 'styled-components';

const RoundButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
`;

interface Props {
  invoice: Invoice | undefined;
}

interface ProductItemProps {
  product: Product;
  isChecked: boolean;
}

function ProductItem(props: ProductItemProps) {
  const { product, isChecked } = props;

  const formatMoney = useFormatMoney();

  return (
    <div className="flex py-2 justify-between cursor-pointer">
      <div className="flex space-x-5">
        <Checkbox
          checked={isChecked}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            console.log(event.currentTarget.checked)
          }
        />

        <span>{product.product_key}</span>

        <span>{product.notes}</span>
      </div>

      <div>{formatMoney(product.price, '', '')}</div>
    </div>
  );
}

export function AddUninvoicedItemsButton(props: Props) {
  const [t] = useTranslation();

  const { invoice } = props;

  const { data: products } = useProductsQuery();

  const colors = useColorScheme();
  const accentColor = useAccentColor();
  const reactSettings = useReactSettings();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <>
      {invoice ? (
        <div className="fixed right-10 bottom-10">
          <Tooltip
            placement="top"
            message={t('add_item') as string}
            width="auto"
            withoutArrow
            withoutWrapping
          >
            <RoundButton
              onClick={() => setIsModalOpen(true)}
              style={{
                backgroundColor: reactSettings?.dark_mode
                  ? colors.$5
                  : accentColor,
              }}
            >
              <Icon element={MdAdd} size={25} color="white" />
            </RoundButton>
          </Tooltip>
        </div>
      ) : (
        <></>
      )}

      <Modal
        size="regular"
        title={t('add_item')}
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <TabGroup
          tabs={[
            `${t('products')} (${products?.length})`,
            `${t('tasks')}`,
            `${t('expenses')}`,
          ]}
          width="full"
        >
          <div className="overflow-y-auto">
            {products?.map((product) => (
              <ProductItem
                key={product.id}
                product={product}
                isChecked={false}
              />
            ))}
          </div>
          <div className="overflow-y-auto"></div>
          <div className="overflow-y-auto"></div>
        </TabGroup>

        <div className="self-end">
          <Button behavior="button">{t('add')}</Button>
        </div>
      </Modal>
    </>
  );
}
