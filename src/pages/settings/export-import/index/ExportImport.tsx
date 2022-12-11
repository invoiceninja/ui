/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { UploadImport } from 'components/import/UploadImport';
import { Settings } from 'components/layouts/Settings';
import { useTranslation } from 'react-i18next';

export function Backup() {
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    {
      name: `${t('export')}/${t('import')}`,
      href: '/settings/export_import',
    },
  ];

  return (
    <Settings title={`${t('export')}/${t('import')}`} breadcrumbs={pages}>
      <div className="grid grid-cols-12">
        <div className="col-span-12">
          <UploadImport entity="company" onSuccess={false} type="zip" />
        </div>
      </div>
    </Settings>
  );
}
