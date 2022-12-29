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
import { useTranslation } from 'react-i18next';
import { SubscriptionProps } from './Overview';
import frequencies from 'common/constants/frequency';
import { InputField, SelectField } from '@invoiceninja/forms';
import { Inline } from 'components/Inline';
import Toggle from 'components/forms/Toggle';
import { Subscription } from 'common/interfaces/subscription';

export function Settings(props: SubscriptionProps) {
  const [t] = useTranslation();

  return (
    <Card title={t('settings')}>
      <Element leftSide={t('frequency')}>
        <SelectField
          value={props.subscription.frequency_id}
          onValueChange={(value) => props.handleChange('frequency_id', value)}
        >
          {Object.keys(frequencies).map((frequency, index) => (
            <option key={index} value={frequency}>
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              {t(frequencies[frequency])}
            </option>
          ))}
        </SelectField>
      </Element>

      <Element leftSide={t('auto_bill')}>
        <SelectField
          value={props.subscription.auto_bill}
          onValueChange={(value) => props.handleChange('auto_bill', value)}
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
          value={props.subscription.promo_code}
          onValueChange={(value) => props.handleChange('promo_code', value)}
          errorMessage={props.errors?.errors.promo_code}
        />
      </Element>

      <Element leftSide={t('promo_discount')}>
        <Inline>
          <div className="w-full lg:w-1/2">
            <InputField
              value={props.subscription.promo_discount}
              onValueChange={(value) =>
                props.handleChange('promo_discount', parseFloat(value) || 0)
              }
              errorMessage={props.errors?.errors.promo_discount}
            />
          </div>

          <div className="w-full lg:w-1/2">
            <SelectField
              value={props.subscription.is_amount_discount.toString()}
              onValueChange={(value) =>
                props.handleChange('is_amount_discount', JSON.parse(value))
              }
              errorMessage={props.errors?.errors.is_amount_discount}
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
          checked={props.subscription.registration_required}
          onValueChange={(value) =>
            props.handleChange('registration_required', value)
          }
        />
      </Element>

      <Element
        leftSide={t('use_inventory_management')}
        leftSideHelp={t('use_inventory_management_help')}
      >
        <Toggle
          checked={props.subscription.use_inventory_management}
          onValueChange={(value) =>
            props.handleChange('use_inventory_management', value)
          }
        />
      </Element>

      <Element leftSide={t('return_url')}>
        <InputField
          value={props.subscription.webhook_configuration.return_url}
          onValueChange={(value) =>
            props.handleChange(
              'webhook_configuration.return_url' as keyof Subscription,
              value
            )
          }
          errorMessage={props.errors?.errors.return_url}
        />
      </Element>

      <Element leftSide={t('allow_query_overrides')}>
        <Toggle
          checked={props.subscription.allow_query_overrides}
          onValueChange={(value) =>
            props.handleChange('allow_query_overrides', value)
          }
        />
      </Element>

      <Element leftSide={t('allow_plan_changes')}>
        <Toggle
          checked={props.subscription.allow_plan_changes}
          onValueChange={(value) =>
            props.handleChange('allow_plan_changes', value)
          }
        />
      </Element>

      <Element leftSide={t('allow_cancellation')}>
        <Toggle
          checked={props.subscription.allow_cancellation}
          onValueChange={(value) =>
            props.handleChange('allow_cancellation', value)
          }
        />
      </Element>

      {props.subscription.allow_cancellation && (
        <Element>
          <InputField
            label={t('refund_period')}
            value={props.subscription.refund_period}
            onValueChange={(value) =>
              props.handleChange('refund_period', parseFloat(value) || 0)
            }
            errorMessage={props.errors?.errors.refund_period}
          />
        </Element>
      )}

      <Element leftSide={t('trial_enabled')}>
        <Toggle
          checked={props.subscription.trial_enabled}
          onValueChange={(value) => props.handleChange('trial_enabled', value)}
        />
      </Element>

      {props.subscription.trial_enabled && (
        <Element>
          <InputField
            label={t('trial_duration')}
            value={props.subscription.trial_duration}
            onValueChange={(value) =>
              props.handleChange('trial_duration', parseFloat(value) || 0)
            }
            errorMessage={props.errors?.errors.trial_duration}
          />
        </Element>
      )}

      <Element leftSide={t('per_seat_enabled')}>
        <Toggle
          checked={props.subscription.per_seat_enabled}
          onValueChange={(value) =>
            props.handleChange('per_seat_enabled', value)
          }
        />
      </Element>

      {props.subscription.per_seat_enabled && (
        <Element>
          <InputField
            label={t('max_seats_limit')}
            value={props.subscription.max_seats_limit}
            onValueChange={(value) =>
              props.handleChange('max_seats_limit', parseFloat(value) || 0)
            }
            errorMessage={props.errors?.errors.max_seats_limit}
          />
        </Element>
      )}
    </Card>
  );
}
