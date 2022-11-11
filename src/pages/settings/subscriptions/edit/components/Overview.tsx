/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { InputField, SelectField } from '@invoiceninja/forms';
import { numberFormat } from 'common/helpers/number-format';
import { GroupSettings } from 'common/interfaces/group-settings';
import { Subscription } from 'common/interfaces/subscription';
import { User } from 'common/interfaces/user';
import { useGroupSettingsQuery } from 'common/queries/group-settings';
import { useProductsQueryNoParams } from 'common/queries/products';
import { useUsersQuery } from 'common/queries/users';
import { Divider } from 'components/cards/Divider';
import { X } from 'react-feather';
import { useTranslation } from 'react-i18next';

interface Props {
  subscription: Subscription;
  setSubscription: React.Dispatch<
    React.SetStateAction<Subscription | undefined>
  >;
  productsIDs: string[] | undefined;
  setProductsIDs: React.Dispatch<React.SetStateAction<string[] | undefined>>;

  recurringProductsIDs: string[] | undefined;
  setRecurringProductsIDs: React.Dispatch<
    React.SetStateAction<string[] | undefined>
  >;
}

export function Overview(props: Props) {
  const [t] = useTranslation();
  const {
    subscription,
    setSubscription,
    productsIDs,
    setProductsIDs,
    recurringProductsIDs,
    setRecurringProductsIDs,
  } = props;

  const onChange = (field: keyof Subscription, value: unknown) => {
    setSubscription(
      (subscription) => subscription && { ...subscription, [field]: value }
    );
  };

  const { data: products } = useProductsQueryNoParams();
  const { data: groups } = useGroupSettingsQuery();
  const { data: users } = useUsersQuery();

  function getProductKeyById(id: string) {
    return products?.find((p) => p.id === id)?.product_key;
  }

  return (
    <Card title={t('overview')}>
      <Element leftSide={t('name')}>
        <InputField
          value={subscription.name}
          onValueChange={(value) => onChange('name', value)}
        />
      </Element>

      <Element leftSide={t('group')}>
        <SelectField
          value={subscription.user_id}
          onValueChange={(value) => onChange('group_id', value)}
        >
          <option></option>
          {groups?.data.data &&
            groups.data.data.map((group: GroupSettings, index: number) => (
              <option value={group.id} key={index}>
                {`${group.name}`}
              </option>
            ))}
        </SelectField>
      </Element>

      <Element leftSide={t('user')}>
        <SelectField
          value={subscription.user_id}
          onValueChange={(value) => onChange('user_id', value)}
        >
          <option></option>
          {users?.data.data &&
            users.data.data.map((user: User, index: any) => (
              <option value={user.id} key={index}>
                {`${user.first_name} ${user.last_name}`}
              </option>
            ))}
        </SelectField>
      </Element>

      <Divider />

      <Element leftSide={t('products')}>
        <SelectField
          onValueChange={(value) => {
            setProductsIDs((productsIDs) => [...(productsIDs || []), value]);
          }}
        >
          <option></option>
          {products &&
            products.map((product, index) => (
              <option value={product.id} key={index}>
                {`${product.product_key} $${numberFormat(product.price)}`}
              </option>
            ))}
        </SelectField>
      </Element>
      <Element>
        {products && productsIDs?.map((product) => (
          <div
            className="flex justify-between items-center space-x-4"
            key={product}
          >
            {getProductKeyById(product)}
            <X
              size={'12px'}
              className="cursor-pointer"
              onClick={() => setProductsIDs(productsIDs.filter((item) => item !== product))}
            />
          </div>
        ))}
      </Element>

      <Element leftSide={t('recurring_products')}>
        <SelectField
          onValueChange={(value) => {
            setRecurringProductsIDs((recurringProductsIDs) => [
              ...(recurringProductsIDs || []),
              value,
            ]);
          }}
        >
          <option></option>
          {products &&
            products.map((product, index) => (
              <option value={product.id} key={index}>
                {`${product.product_key} $${numberFormat(product.price)}`}
              </option>
            ))}
        </SelectField>
      </Element>
      <Element>
      {products && recurringProductsIDs?.map((recurringProduct) => (
          <div
            className="flex justify-between items-center space-x-4"
            key={recurringProduct}
          >
            {getProductKeyById(recurringProduct)}
            <X
              size={'12px'}
              className="cursor-pointer"
              onClick={() => setRecurringProductsIDs(recurringProductsIDs.filter((item) => item !== recurringProduct))}
            />
          </div>
        ))}
      </Element>
    </Card>
  );
}
