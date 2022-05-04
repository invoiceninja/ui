/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, ClickableElement, Element } from '@invoiceninja/cards';
import { InputField, SelectField, Textarea } from '@invoiceninja/forms';
import { Settings } from 'components/layouts/Settings';
import { useTranslation } from 'react-i18next';

export function TemplatesAndReminders() {
  const [t] = useTranslation();
  const pages = [
    { name: t('settings'), href: '/settings' },
    {
      name: t('templates_and_reminders'),
      href: '/settings/templates_and_reminders',
    },
  ];
  return (
    <Settings
      title={t('templates_and_reminders')}
      breadcrumbs={pages}
      docsLink="docs/advanced-settings/#templates_and_reminders"
    >
      <Card title={t('edit')}>
        <Element leftSide={t('template')}>
          <SelectField>
            <option value="invoices">{t('invoices')}</option>
          </SelectField>
        </Element>

        <Element leftSide={t('subject')}>
          <InputField id="subject" />
        </Element>

        <Element leftSide={t('body')}>
          <Textarea />
        </Element>

        <ClickableElement>{t('variables')}</ClickableElement>
      </Card>

      <Card title={t('preview')}>
        <div className="flex flex-col md:flex-row md:items-center px-5">
          <button
            type="button"
            className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Preview will show here
            </span>
          </button>
        </div>
      </Card>
    </Settings>
  );
}
