/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { useTitle } from '$app/common/hooks/useTitle';
import { TabGroup } from '$app/components/TabGroup';

import { useTranslation } from 'react-i18next';
import { Settings } from '../../../components/layouts/Settings';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import { Invoices, Quotes } from './components';

export function WorkflowSettings() {
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('workflow_settings'), href: '/settings/workflow_settings' },
  ];

  useTitle('workflow_settings');
  useInjectCompanyChanges();

  const onSave = useHandleCompanySave();
  const onCancel = useDiscardChanges();

  const tabs = [t('invoices'), t('quotes')];

  return (
    <Settings
      onSaveClick={onSave}
      onCancelClick={onCancel}
      title={t('workflow_settings')}
      breadcrumbs={pages}
      docsLink="docs/advanced-settings/#workflow_settings"
    >
      <TabGroup tabs={tabs}>
        <div>
          <Invoices />
        </div>

        <div>
          <Quotes />
        </div>
      </TabGroup>
    </Settings>
  );
}
