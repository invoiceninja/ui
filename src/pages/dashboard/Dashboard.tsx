/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { isDemo, isSelfHosted } from 'common/helpers';
import { useAdmin } from 'common/hooks/permissions/useHasPermission';
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { useTitle } from 'common/hooks/useTitle';
import { SwitchToFlutter } from 'components/SwitchToFlutter';
import { Activity } from 'pages/dashboard/components/Activity';
import { PastDueInvoices } from 'pages/dashboard/components/PastDueInvoices';
import { RecentPayments } from 'pages/dashboard/components/RecentPayments';
import { Totals } from 'pages/dashboard/components/Totals';
import { UpcomingInvoices } from 'pages/dashboard/components/UpcomingInvoices';
import { useTranslation } from 'react-i18next';
import { Default } from '../../components/layouts/Default';
import { ExpiredQuotes } from './components/ExpiredQuotes';
import { UpcomingQuotes } from './components/UpcomingQuotes';

export function Dashboard() {
  const [t] = useTranslation();

  useTitle('dashboard');

  // const pages = [{ name: t('dashboard'), href: '/dashboard' }];
  const user = useCurrentUser();

  const { isAdmin } = useAdmin();

  return (
    <Default
      title={t('dashboard')}
      navigationTopRight={
        isSelfHosted() &&
        !isDemo() &&
        (user?.company_user?.is_admin || user?.company_user?.is_owner) && (
          <SwitchToFlutter />
        )
      }
    >
      {isAdmin && <Totals />}
      
      <div className="grid grid-cols-12 gap-4 my-6">
        <div className="col-span-12 lg:col-span-6">
          <Activity />
        </div>

        <div className="col-span-12 lg:col-span-6">
          <RecentPayments />
        </div>

        <div className="col-span-12 lg:col-span-6">
          <UpcomingInvoices />
        </div>

        <div className="col-span-12 lg:col-span-6">
          <PastDueInvoices />
        </div>

        <div className="col-span-12 lg:col-span-6">
          <ExpiredQuotes />
        </div>

        <div className="col-span-12 lg:col-span-6">
          <UpcomingQuotes />
        </div>
      </div>
    </Default>
  );
}
