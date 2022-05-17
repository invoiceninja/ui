/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { useCompanyChanges } from 'common/hooks/useCompanyChanges';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useInjectCompanyChanges } from 'common/hooks/useInjectCompanyChanges';
import { useTitle } from 'common/hooks/useTitle';
import {
  injectInChanges,
  resetChanges,
  updateRecord,
} from 'common/stores/slices/company-users';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
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

  return (
    <Settings
      onSaveClick={onSave}
      onCancelClick={onCancel}
      title={t('workflow_settings')}
      breadcrumbs={pages}
      docsLink="docs/advanced-settings/#workflow_settings"
    >
      <Invoices />
      <Quotes />
    </Settings>
  );
}
