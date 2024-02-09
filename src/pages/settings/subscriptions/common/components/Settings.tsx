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
import { useTranslation } from 'react-i18next';
import { SubscriptionProps } from './Overview';
import frequencies from '$app/common/constants/frequency';
import { InputField, SelectField } from '$app/components/forms';
import { Inline } from '$app/components/Inline';
import Toggle from '$app/components/forms/Toggle';
import { Subscription } from '$app/common/interfaces/subscription';
import { trans } from '$app/common/helpers';
import { useEffect } from 'react';

export function Settings(props: SubscriptionProps) {
  const [t] = useTranslation();

  const { subscription, handleChange, errors } = props;

  useEffect(() => {
    if (!subscription.allow_cancellation) {
      handleChange('refund_period', 0);
    }

    if (!subscription.trial_enabled) {
      handleChange('trial_duration', 0);
    }
  }, [subscription.trial_enabled, subscription.allow_cancellation]);

  return (
    <Card title={t('settings')}>
      <Element leftSide={t('frequency')}>
        <SelectField
          value={subscription.frequency_id}
          errorMessage={errors?.errors.frequency_id}
          onValueChange={(value) => handleChange('frequency_id', value)}
        >
          <option value="">{t('once')}</option>
          {Object.keys(frequencies).map((frequency, index) => (
            <option key={index} value={frequency}>
              {t(frequencies[frequency as keyof typeof frequencies])}
            </option>
          ))}
        </SelectField>
      </Element>

      <Element leftSide={t('auto_bill')}>
        <SelectField
          value={subscription.auto_bill}
          onValueChange={(value) => handleChange('auto_bill', value)}
          errorMessage={errors?.errors.auto_bill}
        >
          <option defaultChecked></option>
          <option value="always">{t('enabled')}</option>
          <option value="optout">{t('optout')}</option>
          <option value="optin">{t('optin')}</option>
          <option value="off">{t('disabled')}</option>
        </SelectField>
      </Element>

      <Element leftSide={t('promo_code')}>
        <InputField
          value={subscription.promo_code}
          onValueChange={(value) => handleChange('promo_code', value)}
          errorMessage={errors?.errors.promo_code}
        />
      </Element>

      <Element leftSide={t('promo_discount')}>
        <Inline>
          <div className="w-full lg:w-1/2">
            <InputField
              type="number"
              value={subscription.promo_discount || ''}
              onValueChange={(value) =>
                handleChange('promo_discount', parseFloat(value))
              }
              errorMessage={errors?.errors.promo_discount}
            />
          </div>

          <div className="w-full lg:w-1/2">
            <SelectField
              value={subscription.is_amount_discount.toString()}
              onValueChange={(value) =>
                handleChange('is_amount_discount', JSON.parse(value))
              }
              errorMessage={errors?.errors.is_amount_discount}
            >
              <option value="true">{t('amount')}</option>
              <option value="false">{t('percent')}</option>
            </SelectField>
          </div>
        </Inline>
      </Element>

      <Element
        leftSide={t('registration_required')}
        leftSideHelp={t('registration_required_help')}
      >
        <Toggle
          checked={subscription.registration_required}
          onValueChange={(value) =>
            handleChange('registration_required', value)
          }
        />
      </Element>

      <Element
        leftSide={t('use_inventory_management')}
        leftSideHelp={t('use_inventory_management_help')}
      >
        <Toggle
          checked={subscription.use_inventory_management}
          onValueChange={(value) =>
            handleChange('use_inventory_management', value)
          }
        />
      </Element>

      <Element leftSide={t('return_url')}>
        <InputField
          value={subscription.webhook_configuration.return_url}
          onValueChange={(value) =>
            handleChange(
              'webhook_configuration.return_url' as keyof Subscription,
              value
            )
          }
          errorMessage={errors?.errors['webhook_configuration.return_url']}
        />
      </Element>

      <Element leftSide={t('allow_query_overrides')}>
        <Toggle
          checked={subscription.allow_query_overrides}
          onValueChange={(value) =>
            handleChange('allow_query_overrides', value)
          }
        />
      </Element>

      <Element leftSide={t('allow_plan_changes')}>
        <Toggle
          checked={subscription.allow_plan_changes}
          onValueChange={(value) => handleChange('allow_plan_changes', value)}
        />
      </Element>

      <Element leftSide={t('allow_cancellation')}>
        <Toggle
          checked={subscription.allow_cancellation}
          onValueChange={(value) => handleChange('allow_cancellation', value)}
        />
      </Element>

      {subscription.allow_cancellation && (
        <Element>
          <SelectField
            label={t('refund_period')}
            value={subscription.refund_period}
            onValueChange={(value) =>
              handleChange('refund_period', parseFloat(value) || 0)
            }
            withBlank
            blankOptionValue={0}
            errorMessage={errors?.errors.refund_period}
          >
            <option value={86400}>{t('count_day')}</option>
            <option value={172800}>{trans('count_days', { count: 2 })}</option>
            <option value={259200}>{trans('count_days', { count: 3 })}</option>
            <option value={604800}>{trans('count_days', { count: 7 })}</option>
            <option value={1209600}>
              {trans('count_days', { count: 14 })}
            </option>
            <option value={2592000}>
              {trans('count_days', { count: 30 })}
            </option>
            <option value={5184000}>
              {trans('count_days', { count: 60 })}
            </option>
          </SelectField>
        </Element>
      )}

      <Element leftSide={t('trial_enabled')}>
        <Toggle
          checked={subscription.trial_enabled}
          onValueChange={(value) => handleChange('trial_enabled', value)}
        />
      </Element>

      {subscription.trial_enabled && (
        <Element>
          <SelectField
            label={t('trial_duration')}
            value={subscription.trial_duration}
            onValueChange={(value) =>
              handleChange('trial_duration', parseFloat(value) || 0)
            }
            withBlank
            blankOptionValue={0}
            errorMessage={errors?.errors.trial_duration}
          >
            <option value={86400}>{t('count_day')}</option>
            <option value={172800}>{trans('count_days', { count: 2 })}</option>
            <option value={259200}>{trans('count_days', { count: 3 })}</option>
            <option value={604800}>{trans('count_days', { count: 7 })}</option>
            <option value={1209600}>
              {trans('count_days', { count: 14 })}
            </option>
            <option value={2592000}>
              {trans('count_days', { count: 30 })}
            </option>
            <option value={5184000}>
              {trans('count_days', { count: 60 })}
            </option>
          </SelectField>
        </Element>
      )}

      <Element leftSide={t('per_seat_enabled')}>
        <Toggle
          checked={subscription.per_seat_enabled}
          onValueChange={(value) => handleChange('per_seat_enabled', value)}
        />
      </Element>

      {subscription.per_seat_enabled && (
        <Element>
          <InputField
            label={t('max_seats_limit')}
            value={subscription.max_seats_limit}
            onValueChange={(value) =>
              handleChange('max_seats_limit', parseFloat(value) || 0)
            }
            errorMessage={errors?.errors.max_seats_limit}
          />
        </Element>
      )}
    </Card>
  );
}
