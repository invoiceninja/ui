/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ComponentProps } from 'react';
import { ExpensesTab } from './ExpensesTab';
import { TimeTab } from './TimeTab';

interface Props {
  showTimeCharts: boolean;
  time: ComponentProps<typeof TimeTab>;
  expenses: ComponentProps<typeof ExpensesTab>;
}

export function ChartsTab({ showTimeCharts, time, expenses }: Props) {
  return (
    <div className="space-y-8">
      {showTimeCharts && <TimeTab {...time} />}
      <ExpensesTab {...expenses} />
    </div>
  );
}
