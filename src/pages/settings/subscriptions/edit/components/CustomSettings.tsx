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
import frequency from 'common/constants/frequency';
import { daysToSeconds } from 'common/helpers';
import duration from 'common/interfaces/duration';
import { Subscription } from 'common/interfaces/subscription';
import { WebhookConfiguration } from 'common/interfaces/webhook-configuration';
import { Divider } from 'components/cards/Divider';
import Toggle from 'components/forms/Toggle';
import { useTranslation } from 'react-i18next';

interface Props {
  subscription: Subscription;
  setSubscription: React.Dispatch<
    React.SetStateAction<Subscription | undefined>
  >;
  webhookConfig: WebhookConfiguration;
  setWebhookConfig: React.Dispatch<
    React.SetStateAction<WebhookConfiguration | undefined>
  >;
}

export function CustomSettings(props: Props) {
  const [t] = useTranslation();
  const { subscription, setSubscription, webhookConfig, setWebhookConfig } =
    props;

  const onChange = (field: keyof Subscription, value: unknown) => {
    setSubscription(
      (subscription) => subscription && { ...subscription, [field]: value }
    );
  };

  return (
    <Card title={t('Settings')}>
      <Element leftSide={t('auto_bill')}>
        <SelectField
          value={subscription.auto_bill}
          onValueChange={(value) => onChange('auto_bill', value)}
          id="subscription.auto_bill"
        >
          <option defaultChecked></option>
          <option value="always">{t('enabled')}</option>
          <option value="optout">{t('optout')}</option>
          <option value="optin">{t('optin')}</option>
          <option value="off">{t('disabled')}</option>
        </SelectField>
      </Element>

      <Element leftSide={t('frequency')}>
        <SelectField
          value={subscription.frequency_id}
          onValueChange={(value) => onChange('frequency_id', value)}
        >
          <option defaultChecked></option>
          {Object.entries(frequency).map((frequencyObj) => (
            <option key={frequencyObj[0]} value={frequencyObj[0]}>
              {t(frequencyObj[1])}
            </option>
          ))}
        </SelectField>
      </Element>

      <Divider />

      <Element leftSide={t('promo_code')}>
        <InputField
          value={subscription.promo_code}
          onValueChange={(value) => onChange('promo_code', value)}
        />
      </Element>

      <Element leftSide={t('promo_discount')}>
        <InputField
          type="number"
          value={subscription.promo_discount}
          onValueChange={(value) => onChange('promo_discount', value)}
        />
      </Element>

      <Element>
        <SelectField
          value={subscription.is_amount_discount}
          onValueChange={(value) => onChange('is_amount_discount', value)}
        >
          <option value={1}>{t('amount')}</option>
          <option value={0}>{t('percent')}</option>
        </SelectField>
      </Element>

      <Divider />
      <Element leftSide={t('return_url')}>
        <InputField
          value={webhookConfig.return_url}
          onValueChange={(value) =>
            setWebhookConfig({ ...webhookConfig, return_url: value })
          }
        />
      </Element>

      <Element leftSide={t('allow_query_overrides')}>
        <Toggle
          checked={subscription.allow_query_overrides}
          onChange={(value) => onChange('allow_query_overrides', value)}
        />
      </Element>

      <Element leftSide={t('allow_plan_changes')}>
        <Toggle
          checked={subscription.allow_plan_changes}
          onChange={(value) => onChange('allow_plan_changes', value)}
        />
      </Element>

      <Element leftSide={t('allow_cancellation')}>
        <Toggle
          checked={subscription.allow_cancellation}
          onChange={(value) => onChange('allow_cancellation', value)}
        />
      </Element>
      {subscription.allow_cancellation && (
        <Element leftSide={t('refund_period')}>
          <SelectField
            value={subscription.refund_period}
            onValueChange={(value) => onChange('refund_period', value)}
          >
            <option defaultChecked></option>
            {Object.entries(duration).map((durationObj) => (
              <option
                key={durationObj[0]}
                value={daysToSeconds(parseInt(durationObj[0]))}
              >
                {t(durationObj[1])}
              </option>
            ))}
          </SelectField>
        </Element>
      )}

      <Element leftSide={t('trial_enabled')}>
        <Toggle
          checked={subscription.trial_enabled}
          onChange={(value) => onChange('trial_enabled', value)}
        />
      </Element>
      {subscription.trial_enabled && (
        <Element leftSide={t('trial_duration')}>
          <SelectField
            value={subscription.trial_duration}
            onValueChange={(value) => onChange('trial_duration', value)}
          >
            <option defaultChecked></option>
            {Object.entries(duration).map((durationObj) => (
              <option
                key={durationObj[0]}
                value={daysToSeconds(parseInt(durationObj[0]))}
              >
                {t(durationObj[1])}
              </option>
            ))}
          </SelectField>
        </Element>
      )}

      <Element leftSide={t('per_seat_enabled')}>
        <Toggle
          checked={subscription.per_seat_enabled}
          onChange={(value) => onChange('per_seat_enabled', value)}
        />
      </Element>
      {subscription.per_seat_enabled && (
        <Element leftSide={t('max_seats_limit')}>
          <InputField
            type="number"
            value={subscription.max_seats_limit}
            onValueChange={(value) => onChange('max_seats_limit', value)}
          />
        </Element>
      )}
    </Card>
  );
}
