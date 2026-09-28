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
import { useColorScheme } from '$app/common/colors';
import { useTitle } from '$app/common/hooks/useTitle';
import { Card } from '$app/components/cards';
import { Divider } from '$app/components/cards/Divider';
import { Settings } from '../../../../components/layouts/Settings';
import { Export } from '../common/components/Export';
import { Import } from '../common/components/Import';

export function ImportExport() {
  useTitle('import_export');

  const [t] = useTranslation();
  const colors = useColorScheme();

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
      <Card
        title={t('import_export')}
        className="shadow-sm"
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
      >
        <Import />

        <div className="px-4 sm:px-6 py-4">
          <Divider
            className="border-dashed"
            borderColor={colors.$20}
            withoutPadding
          />
        </div>

        <Export />
      </Card>
    </Settings>
  );
}
