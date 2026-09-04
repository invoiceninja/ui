/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAtomValue } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { useShouldDisableCustomFields } from '$app/common/hooks/useShouldDisableCustomFields';
import { useTitle } from '$app/common/hooks/useTitle';
import { AdvancedSettingsPlanAlert } from '$app/components/AdvancedSettingsPlanAlert';
import { customField } from '$app/components/CustomField';
import { Card } from '$app/components/cards';
import { Tabs } from '$app/components/Tabs';
import { Settings } from '../../../components/layouts/Settings';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import {
  isCompanySettingsFormBusy,
  useHandleCompanySave,
} from '../common/hooks/useHandleCompanySave';
import { AddFieldsToDesignModal } from './components/AddFieldsToDesignModal';

const designCustomFields = [
  'invoice1',
  'invoice2',
  'invoice3',
  'invoice4',
  'product1',
  'product2',
  'product3',
  'product4',
];

const hasLabel = (value: string | undefined) => {
  return Boolean(value && customField(value).label().trim());
};

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
  const company = useCurrentCompany();
  const save = useHandleCompanySave();
  const cancel = useDiscardChanges();

  const disabledCustomFields = useShouldDisableCustomFields();
  const { isCompanySettingsActive } = useCurrentSettingsLevel();

  const isFormBusy = useAtomValue(isCompanySettingsFormBusy);

  const [addedFields, setAddedFields] = useState<string[]>([]);

  const savedCustomFields = useRef<Record<string, string> | null>(null);

  const handleSave = () => {
    savedCustomFields.current = company?.custom_fields ?? {};

    return save();
  };

  useEffect(() => {
    const before = savedCustomFields.current;

    if (!before) {
      return;
    }

    savedCustomFields.current = null;

    if (disabledCustomFields || !isCompanySettingsActive) {
      return;
    }

    const after = company?.custom_fields ?? {};

    setAddedFields(
      designCustomFields.filter(
        (field) => !hasLabel(before[field]) && hasLabel(after[field])
      )
    );
  }, [company]);

  return (
    <Settings
      title={t('custom_fields')}
      breadcrumbs={pages}
      docsLink="en/advanced-settings/#custom_fields"
      onSaveClick={handleSave}
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

      <AddFieldsToDesignModal
        fields={addedFields}
        onSave={save}
        onClose={() => setAddedFields([])}
      />
    </Settings>
  );
}
