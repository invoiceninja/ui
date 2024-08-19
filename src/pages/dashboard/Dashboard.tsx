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
import { ResizableDashboardCards } from './components/ResizableDashboardCards';

export default function Dashboard() {
  const { documentTitle } = useTitle('dashboard');

  return (
    <Default title={documentTitle} breadcrumbs={[]}>
      <ResizableDashboardCards />
    </Default>
  );
}
