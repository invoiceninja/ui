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

export function useDataTableOptions() {
  const [t] = useTranslation();

  return [
    {
      value: 'active',
      label: t('active'),
      color: 'black',
      backgroundColor: '#e4e4e4',
    },
    {
      value: 'archived',
      label: t('archived'),
      color: 'white',
      backgroundColor: '#e6b05c',
    },
    {
      value: 'deleted',
      label: t('deleted'),
      color: 'white',
      backgroundColor: '#c95f53',
    },
  ];
}
