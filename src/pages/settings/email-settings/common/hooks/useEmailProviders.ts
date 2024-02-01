/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { isHosted } from '$app/common/helpers';
import { useTranslation } from 'react-i18next';

interface Provider {
  value: string;
  label: string;
}

export function useEmailProviders() {
  const [t] = useTranslation();

  const hostedProviders: Provider[] = [
    {
      value: 'default',
      label: `${t('default')} (Postmark)`,
    },
    {
      value: 'mailgun',
      label: 'Mailgun (Hosted)',
    },
    {
      value: 'gmail',
      label: 'Gmail (OAuth)',
    },
    {
      value: 'office365',
      label: 'Microsoft (OAuth)',
    },
    {
      value: 'client_postmark',
      label: 'Postmark',
    },
    {
      value: 'client_mailgun',
      label: 'Mailgun',
    },
  ];

  const selfHostedProviders: Provider[] = [
    {
      value: 'default',
      label: t('default'),
    },
    {
      value: 'client_postmark',
      label: 'Postmark',
    },
    {
      value: 'client_mailgun',
      label: 'Mailgun',
    },
  ];

  return isHosted() ? hostedProviders : selfHostedProviders;
}
