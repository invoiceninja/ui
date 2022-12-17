/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useResolveLanguage } from 'common/hooks/useResolveLanguage';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { routes } from './common/routes';
import { RootState } from './common/stores/store';

export function App() {
  const company = useCurrentCompany();

  const location = useLocation();

  const resolveLanguage = useResolveLanguage();

  const shouldEnableResolving = !location.pathname.startsWith('/login');

  const resolvedLanguage = shouldEnableResolving
    ? resolveLanguage(company?.settings.language_id)
    : undefined;

  console.log(resolvedLanguage);

  const darkMode = useSelector((state: RootState) => state.settings.darkMode);

  useEffect(() => {
    document.body.classList.add('bg-gray-50', 'dark:bg-gray-900');

    darkMode
      ? document.querySelector('html')?.classList.add('dark')
      : document.querySelector('html')?.classList.remove('dark');
  }, [darkMode, company]);

  return (
    <div className="App">
      <Toaster position="top-center" />
      {routes}
    </div>
  );
}
