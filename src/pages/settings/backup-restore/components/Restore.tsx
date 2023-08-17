/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '$app/components/cards';
import { UploadImport } from '$app/components/import/UploadImport';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function Restore() {
  const [t] = useTranslation();

  const [isDataImported, setIsDataImported] = useState<boolean>(false);

  return (
    <div className="grid grid-cols-12">
      <div className="col-span-12">
        {!isDataImported ? (
          <UploadImport
            entity="company"
            onSuccess={false}
            type="zip"
            onFileImported={() => setIsDataImported(true)}
          />
        ) : (
          <Card title={t('restore')}>
            <span className="text-gray-600 pl-6">{t('import_started')}</span>
          </Card>
        )}
      </div>
    </div>
  );
}
