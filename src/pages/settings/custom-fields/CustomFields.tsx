/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Settings } from '../../../components/layouts/Settings';
import { useTitle } from '$app/common/hooks/useTitle';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Tabs } from '$app/components/Tabs';
import {
  isCompanySettingsFormBusy,
  useHandleCompanySave,
} from '../common/hooks/useHandleCompanySave';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import { AdvancedSettingsPlanAlert } from '$app/components/AdvancedSettingsPlanAlert';
import { Card } from '$app/components/cards';
import { useColorScheme } from '$app/common/colors';
import { useAtomValue } from 'jotai';

export function CustomFields() {
  useTitle('custom_fields');

  const [t] = useTranslation();

  const colors = useColorScheme();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('custom_fields'), href: '/settings/custom_fields' },
  ];

  const modules = [
    { name: t('company'), href: '/settings/custom_fields/company' },
    { name: t('clients'), href: '/settings/custom_fields/clients' },
    { name: t('products'), href: '/settings/custom_fields/products' },
    { name: t('invoices'), href: '/settings/custom_fields/invoices' },
    { name: t('payments'), href: '/settings/custom_fields/payments' },
    // { name: t('quotes'), href: '/settings/custom_fields/quotes' },
    // { name: t('credits'), href: '/settings/custom_fields/credits' },
    { name: t('projects'), href: '/settings/custom_fields/projects' },
    { name: t('tasks'), href: '/settings/custom_fields/tasks' },
    { name: t('vendors'), href: '/settings/custom_fields/vendors' },
    { name: t('expenses'), href: '/settings/custom_fields/expenses' },
    { name: t('users'), href: '/settings/custom_fields/users' },
  ];

  const location = useLocation();
  const save = useHandleCompanySave();
  const cancel = useDiscardChanges();

  const isFormBusy = useAtomValue(isCompanySettingsFormBusy);

  return (
    <Settings
      title={t('custom_fields')}
      breadcrumbs={pages}
      docsLink="en/advanced-settings/#custom_fields"
      onSaveClick={save}
      onCancelClick={cancel}
      disableSaveButton={isFormBusy}
    >
      {location.pathname.endsWith('custom_fields') && (
        <Navigate to="/settings/custom_fields/company" />
      )}

      <AdvancedSettingsPlanAlert />

      <Card
        title={t('custom_fields')}
        className="shadow-sm"
        style={{ borderColor: colors.$24 }}
        withoutBodyPadding
        withoutHeaderBorder
      >
        <Tabs
          tabs={modules}
          withHorizontalPadding
          horizontalPaddingWidth="1.5rem"
          fullRightPadding
          withHorizontalPaddingOnSmallScreen
        />

        <div className="pt-4 pb-6">
          <Outlet />
        </div>
      </Card>
    </Settings>
  );
}
