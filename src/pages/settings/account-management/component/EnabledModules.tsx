/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../../components/cards';
import Toggle from '../../../../components/forms/Toggle';

interface Module {
  label: string;
}

export function EnabledModules() {
  const [t] = useTranslation();

  const modules: Module[] = [
    { label: t('invoices') },
    { label: t('recurring_invoices') },
    { label: t('quotes') },
    { label: t('credits') },
    { label: t('projects') },
    { label: t('tasks') },
    { label: t('vendor') },
    { label: t('expenses') },
    { label: t('recurring_expenses') },
  ];

  return (
    <Card title={t('enabled_modules')}>
      {modules.map((module, index) => (
        <Element key={index} leftSide={module.label}>
          <Toggle key={module.label} />
        </Element>
      ))}
    </Card>
  );
}
