/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, ClickableElement } from '../../../components/cards';
import { Settings } from '../../../components/layouts/Settings';
import { Settings as SettingsComponent } from './components/Settings';

export function GeneratedNumbers() {
  const [t] = useTranslation();
  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('generated_numbers'), href: '/settings/generated_numbers' },
  ];
  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t(
      'generated_numbers'
    )}`;
  });

  return (
    <Settings
      title={t('generated_numbers')}
      breadcrumbs={pages}
      docsLink="docs/advanced-settings/#generated_numbers"
    >
      <SettingsComponent />

      <Card>
        <ClickableElement to="/settings/generated_numbers/clients">
          {t('clients')}
        </ClickableElement>

        <ClickableElement to="/settings/generated_numbers/invoices">
          {t('invoices')}
        </ClickableElement>

        <ClickableElement to="/settings/generated_numbers/recurring_invoices">
          {t('recurring_invoices')}
        </ClickableElement>

        <ClickableElement to="/settings/generated_numbers/payments">
          {t('payments')}
        </ClickableElement>

        <ClickableElement to="/settings/generated_numbers/quotes">
          {t('quotes')}
        </ClickableElement>

        <ClickableElement to="/settings/generated_numbers/credits">
          {t('credits')}
        </ClickableElement>

        <ClickableElement to="/settings/generated_numbers/projects">
          {t('projects')}
        </ClickableElement>

        <ClickableElement to="/settings/generated_numbers/tasks">
          {t('tasks')}
        </ClickableElement>

        <ClickableElement to="/settings/generated_numbers/vendors">
          {t('vendors')}
        </ClickableElement>

        <ClickableElement to="/settings/generated_numbers/expenses">
          {t('expenses')}
        </ClickableElement>

        <ClickableElement to="/settings/generated_numbers/recurring_expenses">
          {t('recurring_expenses')}
        </ClickableElement>
      </Card>
    </Settings>
  );
}
