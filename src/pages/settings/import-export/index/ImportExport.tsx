/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { useTranslation } from 'react-i18next';
import { Settings } from '../../../../components/layouts/Settings';
import { Export } from '../common/components/Export';
import { Import } from '../common/components/Import';

export function ImportExport() {
  useTitle('import_export');

  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('import_export'), href: '/settings/import_export' },
  ];

  return (
    <Settings
      title={t('import_export')}
      breadcrumbs={pages}
      docsLink="en/basic-settings/#import_export"
    >
      <Import />

      <Export />
    </Settings>
  );
}
