/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { CheckCircle, DownloadCloud } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../../components/cards';

export function Licence() {
  const [t] = useTranslation();

  return (
    <Card title="Licences">
      <button className="inline-flex items-center block w-full text-left px-4 sm:px-6 block hover:bg-gray-50 py-4 space-x-3 text-gray-800 hover:text-gray-900">
        <DownloadCloud />
        <span>{t('purchase_license')}</span>
      </button>
      <button className="inline-flex items-center block w-full text-left px-4 sm:px-6 block hover:bg-gray-50 py-4 space-x-3 text-gray-800 hover:text-gray-900">
        <CheckCircle />
        <span>{t('apply_license')}</span>
      </button>
    </Card>
  );
}
