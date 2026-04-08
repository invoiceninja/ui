/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export function CorpPassFailed() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-md text-center space-y-6 p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold">{t('error')}</h1>

        <p className="text-gray-600">
          CorpPass verification failed or was cancelled. Please try again from
          the e-invoice settings page.
        </p>

        <Button
          behavior="button"
          type="primary"
          onClick={() => navigate('/settings/e_invoice')}
        >
          {t('try_again')}
        </Button>
      </div>
    </div>
  );
}
