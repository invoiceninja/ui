/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCompanyChanges } from 'common/hooks/useCompanyChanges';
import { updateChanges } from 'common/stores/slices/company-users';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Card, Element } from '../../../../components/cards';
import Toggle from '../../../../components/forms/Toggle';

interface Module {
  label: string;
  bitmask: number;
}

export function EnabledModules() {
  const [t] = useTranslation();
  const companyChanges = useCompanyChanges();
  const dispatch = useDispatch();

  const modules: Module[] = [
    { label: t('invoices'), bitmask: 4096 },
    { label: t('recurring_invoices'), bitmask: 1 },
    { label: t('quotes'), bitmask: 4 },
    { label: t('credits'), bitmask: 2 },
    { label: t('projects'), bitmask: 32 },
    { label: t('tasks'), bitmask: 8 },
    { label: t('vendors'), bitmask: 64 },
    { label: t('expenses'), bitmask: 16 },
    { label: t('recurring_expenses'), bitmask: 512 },

    // { label: t('tickets'), bitmask: 128 },
    // { label: t('proposals'), bitmask: 256 },
    // { label: t('recurring_tasks'), bitmask: 1024 },
    // { label: t('recurring_quotes'), bitmask: 2048 },
    // { label: t('proformal_invoices'), bitmask: 8192 },
    // { label: t('purchase_orders'), bitmask: 16384 },
  ];

  const handleToggleChange = (value: boolean, bitmask: number) =>
    dispatch(
      updateChanges({
        object: 'company',
        property: 'enabled_modules',
        value: companyChanges?.enabled_modules ^ bitmask,
      })
    );

  return (
    <Card title={t('enabled_modules')}>
      {modules.map((module, index) => (
        <Element key={index} leftSide={module.label}>
          <Toggle
            checked={Boolean(companyChanges?.enabled_modules & module.bitmask)}
            key={module.label}
            onChange={(value: boolean) =>
              handleToggleChange(value, module.bitmask)
            }
          />
        </Element>
      ))}
    </Card>
  );
}
