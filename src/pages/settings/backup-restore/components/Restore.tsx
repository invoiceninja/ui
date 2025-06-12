/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { UploadCompanyImport } from '$app/components/import/UploadCompanyImport';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function Restore() {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const [isDataImported, setIsDataImported] = useState<boolean>(false);

  return (
    <div className="grid grid-cols-12">
      <div className="col-span-12">
        {!isDataImported ? (
          <UploadCompanyImport
            entity="company"
            onSuccess={false}
            type="zip"
            onFileImported={() => setIsDataImported(true)}
          />
        ) : (
          <div
            className="px-4 sm:px-6 text-sm pt-2"
            style={{ color: colors.$3 }}
          >
            {t('import_started')}
          </div>
        )}
      </div>
    </div>
  );
}
