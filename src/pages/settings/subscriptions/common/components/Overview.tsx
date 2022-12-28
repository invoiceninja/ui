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
import { InputField } from '@invoiceninja/forms';
import { GroupSettings } from 'common/interfaces/group-settings';
import { Product } from 'common/interfaces/product';
import { Subscription } from 'common/interfaces/subscription';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { DebouncedCombobox, Record } from 'components/forms/DebouncedCombobox';
import { UserSelector } from 'components/users/UserSelector';
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

  return (
    <Card title={t('overview')}>
      <Element leftSide={t('name')} required>
        <InputField
          value={props.subscription.name}
          onValueChange={(value) => props.handleChange('name', value)}
          errorMessage={props.errors?.errors.name}
        />
      </Element>

      <Element leftSide={t('group')}>
        <DebouncedCombobox
          endpoint={'/api/v1/group_settings'}
          label="name"
          defaultValue={props.subscription.group_id}
          onChange={(value: Record<GroupSettings>) =>
            value.resource && props.handleChange('group_id', value.resource.id)
          }
          onClearButtonClick={() => props.handleChange('group_id', '')}
          queryAdditional
          clearButton
          errorMessage={props.errors?.errors.group_id}
        />
      </Element>

      <Element leftSide={t('user')}>
        <UserSelector
          value={props.subscription.assigned_user_id}
          onChange={(user) => props.handleChange('assigned_user_id', user.id)}
          onClearButtonClick={() => props.handleChange('assigned_user_id', '')}
          clearButton
          errorMessage={props.errors?.errors.assigned_user_id}
        />
      </Element>

      <Element leftSide={t('products')}>
        <MultipleProductSelector
          type="product_ids"
          handleChange={props.handleChange}
          subscription={props.subscription}
          products={props.products}
        />
      </Element>

      <Element leftSide={t('recurring_products')}>
        <MultipleProductSelector
          type="recurring_product_ids"
          handleChange={props.handleChange}
          subscription={props.subscription}
          products={props.products}
        />
      </Element>

      <Element leftSide={t('optional_products')}>
        <MultipleProductSelector
          type="optional_product_ids"
          handleChange={props.handleChange}
          subscription={props.subscription}
          products={props.products}
        />
      </Element>

      <Element leftSide={t('optional_recurring_products')}>
        <MultipleProductSelector
          type="optional_recurring_product_ids"
          handleChange={props.handleChange}
          subscription={props.subscription}
          products={props.products}
        />
      </Element>
    </Card>
  );
}
