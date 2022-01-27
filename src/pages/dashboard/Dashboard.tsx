/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Breadcrumbs } from 'components/Breadcrumbs';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Default } from '../../components/layouts/Default';
import { Card } from '@invoiceninja/cards';
import { useAccentColor } from 'common/hooks/useAccentColor';

export interface DashboardCard {
  title: string;
  amount: string;
  sold: string;
}

export function Dashboard() {
  const accentColor = useAccentColor();
  const [t] = useTranslation();
  // columns
  const columns: DashboardCard[] = [
    {
      title: 'TOTAL REVENUE',
      amount: 'ZK2,974.37',
      sold: 'ZK0.99',
    },
    {
      title: 'TOTAL EXPENSES',
      amount: 'ZK0.00',
      sold: 'ZK0.00',
    },
    {
      title: 'OUTSTANDING',
      amount: 'ZK7,434.00',
      sold: 'ZK0.00',
    },
  ];

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('dashboard')}`;
  });

  const navigation = [{ name: t('dashboard'), href: '/dashboard' }];

  return (
    <Default title={t('dashboard')}>
      <Breadcrumbs pages={navigation} />
      <div className="container mx-auto my-6">
        <div className="grid grid-cols-12 space-y-4 lg:space-y-0 lg:gap-4">
          {columns.map((card, id) => {
            const { title, amount, sold } = card;
            return (
              <Card className="col-span-12 lg:col-span-4 py-3 px-5" key={id}>
                <h1 className="text-gray-800">{title}</h1>
                <div className="flex flex-row justify-between my-1">
                  <div className="font-bold">{amount}</div>
                  <div style={{ color: accentColor }}>
                    {sold}
                    <p className="text-sm text-right text-sky-700">
                      Last 30 days
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Default>
  );
}
