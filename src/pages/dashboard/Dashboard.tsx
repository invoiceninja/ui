/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useDashboardChartsQuery } from '../../common/queries/dashboard-charts';
import { Breadcrumbs } from 'components/Breadcrumbs';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Default } from '../../components/layouts/Default';
import { useAccentColor } from 'common/hooks/useAccentColor';

export interface DashboardCard {
  title: string;
  amount: string;
  sold: string;
}

export function Dashboard() {
  const [t] = useTranslation();
  const { data } = useDashboardChartsQuery();
  console.log(data);

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('dashboard')}`;
  });

  const navigation = [{ name: t('dashboard'), href: '/dashboard' }];

  return (
    <Default title={t('dashboard')}>
      <Breadcrumbs pages={navigation} />
    </Default>
  );
}
