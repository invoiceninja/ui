/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useRefreshCompanyUsers } from '$app/common/hooks/useRefreshCompanyUsers';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { Button } from '$app/components/forms';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export function CorpPassSuccess() {
  const { t } = useTranslation();
  const refresh = useRefreshCompanyUsers();
  const navigate = useNavigate();
  const accentColor = useAccentColor();

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-md text-center space-y-6 p-8">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <svg
            className="h-8 w-8"
            style={{ color: accentColor }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold">
          {t('peppol_successfully_configured')}
        </h1>

        <p className="text-gray-600">
          CorpPass verification completed successfully. Your Peppol registration
          is being finalized.
        </p>

        <Button
          behavior="button"
          type="primary"
          onClick={() => navigate('/settings/e_invoice')}
        >
          {t('continue')}
        </Button>
      </div>
    </div>
  );
}
