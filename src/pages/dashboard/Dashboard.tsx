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
import { RecentPayments } from 'components/totals/RecentPayments';
import { Totals } from 'components/totals/Totals';
import { useTranslation } from 'react-i18next';
import { Default } from '../../components/layouts/Default';

export function Dashboard() {
  const [t] = useTranslation();

  useTitle('dashboard');

  const pages = [{ name: t('dashboard'), href: '/dashboard' }];

  return (
    <Default title={t('dashboard')} breadcrumbs={pages}>
      <Totals />

      <div className="flex grid grid-cols-2 gap-4 mt-4">
        <Activity />
        
        <RecentPayments />
      </div>
      
    </Default>
  );
}
