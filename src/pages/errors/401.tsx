/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Default } from 'components/layouts/Default';
import { Spinner } from 'components/Spinner';
import { useEffect, useState } from 'react';
import { AlertTriangle } from 'react-feather';
import { useTranslation } from 'react-i18next';

export function Unauthorized() {
  const [t] = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => {
      setIsLoading(true);
    };
  }, []);

  return (
    <Default>
      <div className="flex flex-col items-center mt-14 space-y-4">
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <AlertTriangle size={128} />

            <h1 className="text-2xl">{t('not_allowed')}.</h1>
          </>
        )}
      </div>
    </Default>
  );
}
