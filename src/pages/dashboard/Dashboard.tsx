/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Totals } from 'components/totals/Totals';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Default } from '../../components/layouts/Default';

export function Dashboard() {
  const [t] = useTranslation();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('dashboard')}`;
  });

  const pages = [{ name: t('dashboard'), href: '/dashboard' }];

  return <Default title={t('dashboard')} breadcrumbs={pages}>
    <Totals/>
  </Default>;
}
