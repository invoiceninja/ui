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
import Logo from '../resources/images/invoiceninja-logo@dark.png';

export function NotFound() {
  const [t] = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-10 py-16 px-5">
      <div className="flex flex-col flex-1 justify-center items-center space-y-7">
        <h1 className="text-2xl md:text-4xl font-bold text-center">
          {t('api_404')}
        </h1>
      </div>

      <img
        src={Logo}
        alt={t('company_logo') ?? 'Company logo'}
        className="w-52 md:w-64"
      />
    </div>
  );
}
