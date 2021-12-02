/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Image } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../../components/cards';

export function Documents() {
  const [t] = useTranslation();

  return (
    <Card title={t('documents')}>
      <Element leftSide={t('upload')}>
        <div className="flex flex-col md:flex-row md:items-center">
          <button
            type="button"
            className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Image className="mx-auto h-12 w-12 text-gray-400" />
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Drag and drop your files here
            </span>
          </button>
        </div>
      </Element>
    </Card>
  );
}
