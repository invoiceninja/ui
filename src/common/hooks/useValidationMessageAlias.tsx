/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '$app/components/forms';
import { useTranslation } from 'react-i18next';

interface Params {
  entity?: 'client';
}
export function useValidationMessageAlias(params?: Params) {
  const [t] = useTranslation();

  const { entity } = params || {};

  return (property: string, message: string[]) => {
    if (property === 'id' && entity === 'client') {
      return (
        <div className="inline-flex flex-col justify-center">
          <div className="flex items-center space-x-2">
            <span>{t('clients_limit')}!</span>

            <Link className="underline" to="/settings/account_management">
              {t('unlock_unlimited_clients')}!
            </Link>
          </div>

          <span>{message}</span>
        </div>
      );
    }

    return message;
  };
}
