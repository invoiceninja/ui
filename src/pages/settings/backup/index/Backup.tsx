/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '@invoiceninja/cards';
import { Settings } from 'components/layouts/Settings';
import { useTranslation } from 'react-i18next';

export function Backup() {
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    {
      name: `${t('backup')}/${t('restore')}`,
      href: '/settings/backup_restore',
    },
  ];

  return (
    <Settings title={`${t('backup')}/${t('restore')}`} breadcrumbs={pages}>
      <Card className="px-5">
        <div>{`${t('backup')}/${t('restore')}`}</div>
      </Card>
    </Settings>
  );
}
