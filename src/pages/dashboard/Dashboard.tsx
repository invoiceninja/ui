/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { Default } from '../../components/layouts/Default';
// import { GrafanaWorkingDashboard } from './components/GrafanaWorkingDashboard';
// import { TestDragDashboard } from './components/TestDragDashboard';
// import { SmoothDragDashboard } from './components/SmoothDragDashboard';
import { FlexibleDragDashboard } from './components/FlexibleDragDashboard';
import { useSocketEvent } from '$app/common/queries/sockets';
import { $refetch } from '$app/common/hooks/useRefetch';

export default function Dashboard() {
  const { documentTitle } = useTitle('dashboard');

  useSocketEvent({
    on: 'App\\Events\\Invoice\\InvoiceWasPaid',
    callback: () => $refetch(['invoices']),
  });

  return (
    <Default title={documentTitle} breadcrumbs={[]}>
      {/* <GrafanaWorkingDashboard /> */}
      {/* <TestDragDashboard /> */}
      {/* <SmoothDragDashboard /> */}
      <FlexibleDragDashboard />
    </Default>
  );
}
