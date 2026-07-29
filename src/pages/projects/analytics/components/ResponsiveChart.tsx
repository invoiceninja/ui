/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ReactElement } from 'react';
import { CartesianGrid, ResponsiveContainer } from 'recharts';

interface Props {
  children: ReactElement;
}

export function ResponsiveChart({ children }: Props) {
  return (
    <div className="h-full min-h-[240px] min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export function AnalyticsChartGrid() {
  return <CartesianGrid strokeDasharray="3 3" vertical={false} />;
}
