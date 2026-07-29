/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  ProjectBudgetVsActual,
  ProjectInvoiceProgress,
  ProjectProfitability,
} from '$app/common/interfaces/project-analytics';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  ComposedChart,
  Legend,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AnalyticsCard } from '../components/AnalyticsCard';
import {
  AnalyticsChartTooltip,
  AnalyticsValueFormatter,
} from '../components/AnalyticsChartTooltip';
import {
  AnalyticsChartGrid,
  ResponsiveChart,
} from '../components/ResponsiveChart';
import { ANALYTICS_CHART_COLORS } from '../constants';
import {
  axisTick,
  formatCompact,
  singleProjectData,
  toNumber,
  yAxisLabel,
} from '../helpers';
import { useAnalyticsFieldLabel } from '../hooks/useAnalyticsFieldLabel';
import { useColorScheme } from '$app/common/colors';

interface Props {
  projectName: string;
  profitability?: ProjectProfitability;
  budgetVsActual?: ProjectBudgetVsActual;
  invoiceProgress?: ProjectInvoiceProgress;
  formatter: AnalyticsValueFormatter;
}

export function ProfitTab({
  projectName,
  profitability,
  budgetVsActual,
  invoiceProgress,
  formatter,
}: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const fieldLabel = useAnalyticsFieldLabel();

  const profitabilityData = singleProjectData(profitability, projectName, [
    'invoiced_amount',
    'expense_amount',
    'net_margin',
    'margin_ratio',
  ]);

  const budgetData = singleProjectData(budgetVsActual, projectName, [
    'budgeted_amount',
    'actual_amount',
    'labor_value',
    'expense_amount',
  ]);

  const revenueData = singleProjectData(invoiceProgress, projectName, [
    'work_value',
    'invoiced_amount',
    'paid_amount',
    'outstanding_amount',
    'unbilled_amount',
  ]);

  return (
    <div className="grid grid-cols-12 gap-4">
      <AnalyticsCard
        title={t('profit')}
        className="col-span-12 xl:col-span-6"
        height={320}
      >
        <ResponsiveChart>
          <ComposedChart
            data={profitabilityData}
            margin={{ top: 8, right: 48, left: 42, bottom: 26 }}
          >
            <AnalyticsChartGrid />

            <XAxis dataKey="project_name" tick={false} />

            <YAxis
              yAxisId="amount"
              tick={axisTick(colors.$22)}
              tickFormatter={formatCompact}
              label={yAxisLabel(t('amount'), colors.$22)}
            />

            <YAxis
              yAxisId="ratio"
              orientation="right"
              domain={[0, 1]}
              tick={axisTick(colors.$22)}
              tickFormatter={(value) => `${toNumber(value) * 100}%`}
              label={yAxisLabel(t('margin'), colors.$22, 'insideRight')}
            />

            <Tooltip
              content={<AnalyticsChartTooltip formatter={formatter} />}
              cursor={{ fill: 'transparent' }}
              wrapperStyle={{ outline: 'none' }}
            />

            <Legend />

            <Bar
              yAxisId="amount"
              dataKey="invoiced_amount"
              name={fieldLabel('invoiced_amount')}
              fill={ANALYTICS_CHART_COLORS[0]}
            />

            <Bar
              yAxisId="amount"
              dataKey="expense_amount"
              name={fieldLabel('expense_amount')}
              fill={ANALYTICS_CHART_COLORS[2]}
            />

            <Bar
              yAxisId="amount"
              dataKey="net_margin"
              name={fieldLabel('net_margin')}
              fill={ANALYTICS_CHART_COLORS[1]}
            />

            <Line
              yAxisId="ratio"
              type="monotone"
              dataKey="margin_ratio"
              name={fieldLabel('margin_ratio')}
              stroke={ANALYTICS_CHART_COLORS[3]}
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveChart>
      </AnalyticsCard>

      <AnalyticsCard
        title={t('budget_vs_actual')}
        className="col-span-12 xl:col-span-6"
      >
        <ResponsiveChart>
          <BarChart
            data={budgetData}
            margin={{ top: 8, right: 16, left: 42, bottom: 26 }}
          >
            <AnalyticsChartGrid />

            <XAxis dataKey="project_name" tick={false} />

            <YAxis
              tick={axisTick(colors.$22)}
              tickFormatter={formatCompact}
              label={yAxisLabel(t('amount'), colors.$22)}
            />

            <Tooltip
              content={<AnalyticsChartTooltip formatter={formatter} />}
              cursor={{ fill: 'transparent' }}
              wrapperStyle={{ outline: 'none' }}
              shared={false}
            />

            <Legend />

            <Bar
              dataKey="budgeted_amount"
              name={fieldLabel('budgeted_amount')}
              fill={ANALYTICS_CHART_COLORS[0]}
            />

            <Bar
              dataKey="actual_amount"
              name={fieldLabel('actual_amount')}
              fill={ANALYTICS_CHART_COLORS[1]}
            />

            <Bar
              dataKey="labor_value"
              name={fieldLabel('labor_value')}
              fill={ANALYTICS_CHART_COLORS[4]}
            />

            <Bar
              dataKey="expense_amount"
              name={fieldLabel('expense_amount')}
              fill={ANALYTICS_CHART_COLORS[2]}
            />
          </BarChart>
        </ResponsiveChart>
      </AnalyticsCard>

      <AnalyticsCard title={t('revenue')} className="col-span-12 xl:col-span-6">
        <ResponsiveChart>
          <BarChart
            data={revenueData}
            margin={{ top: 8, right: 16, left: 42, bottom: 26 }}
          >
            <AnalyticsChartGrid />

            <XAxis dataKey="project_name" tick={false} />

            <YAxis
              tick={axisTick(colors.$22)}
              tickFormatter={formatCompact}
              label={yAxisLabel(t('amount'), colors.$22)}
            />

            <Tooltip
              content={<AnalyticsChartTooltip formatter={formatter} />}
              cursor={{ fill: 'transparent' }}
              wrapperStyle={{ outline: 'none' }}
              shared={false}
            />

            <Legend />

            <Bar
              dataKey="work_value"
              name={fieldLabel('work_value')}
              fill={ANALYTICS_CHART_COLORS[0]}
            />

            <Bar
              dataKey="invoiced_amount"
              name={fieldLabel('invoiced_amount')}
              fill={ANALYTICS_CHART_COLORS[2]}
            />

            <Bar
              dataKey="paid_amount"
              name={fieldLabel('paid_amount')}
              fill={ANALYTICS_CHART_COLORS[1]}
            />

            <Bar
              dataKey="outstanding_amount"
              name={fieldLabel('outstanding_amount')}
              fill={ANALYTICS_CHART_COLORS[3]}
            />

            <Bar
              dataKey="unbilled_amount"
              name={fieldLabel('unbilled_amount')}
              fill={ANALYTICS_CHART_COLORS[5]}
            />
          </BarChart>
        </ResponsiveChart>
      </AnalyticsCard>
    </div>
  );
}
