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
import { Default } from 'components/layouts/Default';
import { Outlet } from 'react-router-dom';

export function Expense() {
  const { documentTitle } = useTitle('expense');

  return (
    <Default title={documentTitle}>
      <Outlet />
    </Default>
  );
}
