/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { enterprisePlan } from '$app/common/guards/guards/enterprise-plan';
import { proPlan } from '$app/common/guards/guards/pro-plan';
import { isDemo, isHosted } from '$app/common/helpers';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { useTranslation } from 'react-i18next';

interface Provider {
  value: string;
  label: string;
  enabled: boolean;
}

export function useEmailProviders() {
  const [t] = useTranslation();

  const { isCompanySettingsActive } = useCurrentSettingsLevel();

  const isSMTPConfigurationAllowed =
    import.meta.env.VITE_HOSTED_SHOW_SMTP_SETTINGS === 'true';

  const hostedProviders: Provider[] = [
    {
      value: 'default',
      label: `${t('default')} (Postmark)`,
      enabled: true,
    },
    {
      value: 'mailgun',
      label: 'Mailgun (Hosted)',
      enabled: true,
    },
    {
      value: 'gmail',
      label: 'Gmail (OAuth)',
      enabled: true,
    },
    {
      value: 'office365',
      label: 'Microsoft (OAuth)',
      enabled: true,
    },
    {
      value: 'client_postmark',
      label: 'Postmark',
      enabled: true,
    },
    {
      value: 'client_mailgun',
      label: 'Mailgun',
      enabled: true,
    },
    {
      value: 'client_brevo',
      label: 'Brevo',
      enabled: true,
    },
    {
      value: 'smtp',
      label: 'SMTP',
      enabled:
        (proPlan() || enterprisePlan()) &&
        isSMTPConfigurationAllowed &&
        isCompanySettingsActive &&
        !isDemo(),
    },
  ];

  const selfHostedProviders: Provider[] = [
    {
      value: 'default',
      label: t('default'),
      enabled: true,
    },
    {
      value: 'client_postmark',
      label: 'Postmark',
      enabled: true,
    },
    {
      value: 'client_mailgun',
      label: 'Mailgun',
      enabled: true,
    },
    {
      value: 'client_brevo',
      label: 'Brevo',
      enabled: true,
    },
    {
      value: 'smtp',
      label: 'SMTP',
      enabled: isCompanySettingsActive && !isDemo(),
    },
  ];

  return isHosted() ? hostedProviders : selfHostedProviders;
}
