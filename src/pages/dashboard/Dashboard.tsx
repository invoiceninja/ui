/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { Activity } from 'components/totals/Activity';
import { PastDueInvoices } from 'components/totals/PastDueInvoices';
import { RecentPayments } from 'components/totals/RecentPayments';
import { Totals } from 'components/totals/Totals';
import { UpcomingInvoices } from 'components/totals/UpcomingInvoices';
import { useTranslation } from 'react-i18next';
import { Default } from '../../components/layouts/Default';

export function Dashboard() {
  const [t] = useTranslation();

  useTitle('dashboard');

  const pages = [{ name: t('dashboard'), href: '/dashboard' }];

  return (
    <Default title={t('dashboard')} breadcrumbs={pages}>
      <Totals />

      <div className="grid grid-cols-12 gap-4 my-6">
        <div className="col-span-12 lg:col-span-6">
          <Activity />
        </div>

        <div className="col-span-12 lg:gap-4 lg:col-span-6">
          <RecentPayments />
        </div>

        <div className="col-span-12 lg:col-span-6">
          <UpcomingInvoices />
        </div>

        <div className="col-span-12 lg:col-span-6">
          <PastDueInvoices />
        </div>
      </div>
    </Default>
  );
}
