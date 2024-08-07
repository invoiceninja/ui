/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Default } from '$app/components/layouts/Default';
import { Spinner } from '$app/components/Spinner';
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
    <Default breadcrumbs={[]}>
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

export function SubPageUnauthorized() {
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
  );
}
