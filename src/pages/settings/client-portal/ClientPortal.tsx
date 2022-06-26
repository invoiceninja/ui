/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useInjectCompanyChanges } from 'common/hooks/useInjectCompanyChanges';
import { useTitle } from 'common/hooks/useTitle';
import { useTranslation } from 'react-i18next';
import { Settings } from '../../../components/layouts/Settings';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import {
  Authorization,
  Customize,
  Messages,
  Registration,
  Settings as SettingsComponent,
} from './components';

export function ClientPortal() {
  useTitle('client_portal');
  useInjectCompanyChanges();

  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('client_portal'), href: '/settings/client_portal' },
  ];

  const onSave = useHandleCompanySave();
  const onCancel = useDiscardChanges();

  return (
    <Settings
      title={t('client_portal')}
      breadcrumbs={pages}
      docsLink="docs/advanced-settings/#client_portal"
      onSaveClick={onSave}
      onCancelClick={onCancel}
    >
      <SettingsComponent />
      <Registration />
      <Authorization />
      <Messages />
      <Customize />
    </Settings>
  );
}
