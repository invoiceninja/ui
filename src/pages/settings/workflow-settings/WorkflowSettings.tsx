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
import {
  isCompanySettingsFormBusy,
  useHandleCompanySave,
} from '../common/hooks/useHandleCompanySave';
import { Invoices, Quotes } from './components';
import { Card } from '$app/components/cards';
import { useColorScheme } from '$app/common/colors';
import { useAtomValue } from 'jotai';

export function WorkflowSettings() {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('workflow_settings'), href: '/settings/workflow_settings' },
  ];

  useTitle('workflow_settings');
  useInjectCompanyChanges();

  const isFormBusy = useAtomValue(isCompanySettingsFormBusy);

  const onSave = useHandleCompanySave();
  const onCancel = useDiscardChanges();

  const tabs = [t('invoices'), t('quotes')];

  return (
    <Settings
      onSaveClick={onSave}
      onCancelClick={onCancel}
      title={t('workflow_settings')}
      breadcrumbs={pages}
      docsLink="en/advanced-settings/#workflow_settings"
      disableSaveButton={isFormBusy}
    >
      <Card
        title={t('workflow_settings')}
        className="shadow-sm"
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
        withoutBodyPadding
        withoutHeaderBorder
      >
        <TabGroup
          tabs={tabs}
          horizontalPaddingWidth="1.5rem"
          withHorizontalPadding
          fullRightPadding
          withoutVerticalMargin
        >
          <div className="pt-4 pb-6">
            <Invoices />
          </div>

          <div className="pt-4 pb-6">
            <Quotes />
          </div>
        </TabGroup>
      </Card>
    </Settings>
  );
}
