/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { InputField } from '$app/components/forms';
import { GroupSettings } from '$app/common/interfaces/group-settings';
import { Product } from '$app/common/interfaces/product';
import { Subscription } from '$app/common/interfaces/subscription';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { CopyToClipboard } from '$app/components/CopyToClipboard';
import { DebouncedCombobox, Record } from '$app/components/forms/DebouncedCombobox';
import { UserSelector } from '$app/components/users/UserSelector';
import { useTranslation } from 'react-i18next';
import { MultipleProductSelector } from './MultipleProductSelector';

export interface SubscriptionProps {
  subscription: Subscription;
  handleChange: (
    property: keyof Subscription,
    value: Subscription[keyof Subscription]
  ) => void;
  errors: ValidationBag | undefined;
}

interface OverviewSubscriptionProps extends SubscriptionProps {
  products: Product[] | undefined;
}

export function Overview(props: OverviewSubscriptionProps) {
  const [t] = useTranslation();

  const { subscription, handleChange, errors, products } = props;

  return (
    <Card title={t('overview')}>
      <Element leftSide={t('name')} required>
        <InputField
          value={subscription.name}
          onValueChange={(value) => handleChange('name', value)}
          errorMessage={errors?.errors.name}
        />
      </Element>

      <Element leftSide={t('group')}>
        <DebouncedCombobox
          endpoint={'/api/v1/group_settings'}
          label="name"
          defaultValue={subscription.group_id}
          onChange={(value: Record<GroupSettings>) =>
            value.resource && handleChange('group_id', value.resource.id)
          }
          onClearButtonClick={() => handleChange('group_id', '')}
          queryAdditional
          clearButton
          errorMessage={errors?.errors.group_id}
        />
      </Element>

      <Element leftSide={t('user')}>
        <UserSelector
          value={subscription.assigned_user_id}
          onChange={(user) => handleChange('assigned_user_id', user.id)}
          onClearButtonClick={() => handleChange('assigned_user_id', '')}
          clearButton
          errorMessage={errors?.errors.assigned_user_id}
        />
      </Element>

      <Element leftSide={t('products')}>
        <MultipleProductSelector
          type="product_ids"
          handleChange={handleChange}
          subscription={subscription}
          products={products}
        />
      </Element>

      <Element leftSide={t('recurring_products')}>
        <MultipleProductSelector
          type="recurring_product_ids"
          handleChange={handleChange}
          subscription={subscription}
          products={products}
        />
      </Element>

      <Element leftSide={t('optional_products')}>
        <MultipleProductSelector
          type="optional_product_ids"
          handleChange={handleChange}
          subscription={subscription}
          products={products}
        />
      </Element>

      <Element leftSide={t('optional_recurring_products')}>
        <MultipleProductSelector
          type="optional_recurring_product_ids"
          handleChange={handleChange}
          subscription={subscription}
          products={products}
        />
      </Element>

      <Element leftSide={t('purchase_page')}>
        <CopyToClipboard
          className="break-all"
          text={subscription.purchase_page}
        />
      </Element>
    </Card>
  );
}
