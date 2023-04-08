/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useLogo } from '$app/common/hooks/useLogo';
import { Button } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export function NotFound() {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const logo = useLogo();

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-10 py-16 px-5">
      <div className="flex flex-col flex-1 justify-center items-center space-y-7">
        <h1 className="text-8xl font-bold">404</h1>

        <div className="flex flex-col text-center">
          <h3 className="text-lg">Oops! Page not found!</h3>
          <span>
            <i>
              We are sorry, it looks like the page you are looking for is not in
              our system.
            </i>
          </span>
        </div>

        <Button onClick={() => navigate('/dashboard')}>
          Back To Dashboard
        </Button>
      </div>

      <div className="flex">
        <div className="bg-gray-900 rounded-lg p-4 self-end">
          <img
            src={logo}
            alt={t('company_logo') ?? 'Company logo'}
            className="w-64"
          />
        </div>
      </div>
    </div>
  );
}
