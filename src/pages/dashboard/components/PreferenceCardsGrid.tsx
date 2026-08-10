/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { DashboardCard } from './DashboardCard';

interface Props {
  currentDashboardFields: string[];
  dateRange: string;
  startDate: string;
  endDate: string;
  currencyId: string;
  layoutBreakpoint: string;
}

export function PreferenceCardsGrid({
  currentDashboardFields,
  dateRange,
  startDate,
  endDate,
  currencyId,
}: Props) {
  // `dashboard_fields` ordering/composition is owned by `DashboardCardSelector`
  // — that component reads from and writes to `reactSettings.dashboard_fields`
  // via `useSaveReactSettings`. This grid only renders the current list.
  const refreshKey = 0;

  return (
    <div>
      <div className="grid grid-cols-4 gap-4 w-full">
        {currentDashboardFields.map((key, index) => (
          <div key={`${key}-${index}`} style={{ height: '130px' }}>
            <DashboardCard
              fieldKey={key}
              dateRange={dateRange}
              startDate={startDate}
              endDate={endDate}
              currencyId={currencyId}
              refreshKey={refreshKey}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
