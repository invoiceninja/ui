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

interface Props {
  numberOfDocuments: number | undefined;
}
export function DocumentsTabLabel(props: Props) {
  const [t] = useTranslation();

  const { numberOfDocuments } = props;

  return (
    <div className="flex space-x-1">
      <span>{t('documents')}</span>
      {Boolean(numberOfDocuments) && (
        <span className="font-bold">({numberOfDocuments})</span>
      )}
    </div>
  );
}
