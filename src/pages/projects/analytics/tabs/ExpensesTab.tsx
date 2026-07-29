/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import {
  ProjectCumulativeSpendRow,
  ProjectExpenseCategoryRow,
} from '$app/common/interfaces/project-analytics';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
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
  cleanTooltipText,
  formatCompact,
  normalizeRows,
  sumChartValues,
  xAxisLabel,
  yAxisLabel,
} from '../helpers';
import { useAnalyticsFieldLabel } from '../hooks/useAnalyticsFieldLabel';

const PIE_THRESHOLD = 6;

interface Props {
  expenseBreakdown: ProjectExpenseCategoryRow[];
  cumulativeSpend: ProjectCumulativeSpendRow[];
  formatter: AnalyticsValueFormatter;
}

export function ExpensesTab({
  expenseBreakdown,
  cumulativeSpend,
  formatter,
}: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const fieldLabel = useAnalyticsFieldLabel();

  const breakdownData = normalizeRows(expenseBreakdown, [
    'expense_amount',
    'expense_count',
  ]);

  const breakdownTotal = sumChartValues(breakdownData, 'expense_amount');
  const spendData = normalizeRows(cumulativeSpend, [
    'cumulative_labor_value',
    'cumulative_expense_amount',
    'cumulative_actual_amount',
  ]);

  return (
    <div className="grid grid-cols-12 gap-4">
      <AnalyticsCard
        title={t('expenses')}
        className="col-span-12 xl:col-span-6"
      >
        {breakdownData.length <= PIE_THRESHOLD ? (
          <ResponsiveChart>
            <PieChart>
              <Pie
                data={breakdownData}
                dataKey="expense_amount"
                nameKey="category_name"
                cx="34%"
                cy="50%"
                innerRadius={54}
                outerRadius={92}
                paddingAngle={2}
              >
                {breakdownData.map((entry, index) => (
                  <Cell
                    key={String(entry.category_name ?? index)}
                    fill={
                      ANALYTICS_CHART_COLORS[
                        index % ANALYTICS_CHART_COLORS.length
                      ]
                    }
                  />
                ))}
              </Pie>

              <Tooltip
                content={
                  <AnalyticsChartTooltip
                    formatter={formatter}
                    options={{
                      labelKey: 'category_name',
                      nameKey: 'category_name',
                      percentTotal: breakdownTotal,
                      showPercent: true,
                    }}
                  />
                }
                cursor={{ fill: 'transparent' }}
                wrapperStyle={{ outline: 'none' }}
              />

              <Legend
                align="right"
                iconType="circle"
                layout="vertical"
                verticalAlign="middle"
                wrapperStyle={{
                  color: colors.$22,
                  fontSize: 12,
                  lineHeight: '18px',
                  maxWidth: 168,
                  paddingLeft: 12,
                  right: 8,
                }}
                formatter={(value) => (
                  <span
                    style={{
                      color: colors.$22,
                      display: 'inline-block',
                      maxWidth: 132,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      verticalAlign: 'middle',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {cleanTooltipText(value) || '-'}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveChart>
        ) : (
          <ResponsiveChart>
            <BarChart
              data={breakdownData}
              margin={{ top: 8, right: 16, left: 42, bottom: 48 }}
            >
              <AnalyticsChartGrid />

              <XAxis
                dataKey="category_name"
                tick={axisTick(colors.$22)}
                angle={-25}
                textAnchor="end"
                height={54}
                label={xAxisLabel(t('expense_category'), colors.$22, -12)}
              />

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
                dataKey="expense_amount"
                name={fieldLabel('expense_amount')}
                fill={ANALYTICS_CHART_COLORS[2]}
              />
            </BarChart>
          </ResponsiveChart>
        )}
      </AnalyticsCard>

      <AnalyticsCard
        title={`${t('expenses')} / ${t('time')}`}
        className="col-span-12 xl:col-span-6"
      >
        <ResponsiveChart>
          <LineChart
            data={spendData}
            margin={{ top: 8, right: 16, left: 42, bottom: 26 }}
          >
            <AnalyticsChartGrid />

            <XAxis dataKey="period" tick={axisTick(colors.$22)} />

            <YAxis
              tick={axisTick(colors.$22)}
              tickFormatter={formatCompact}
              label={yAxisLabel(t('amount'), colors.$22)}
            />

            <Tooltip
              content={<AnalyticsChartTooltip formatter={formatter} />}
              cursor={{ fill: 'transparent' }}
              wrapperStyle={{ outline: 'none' }}
            />

            <Legend />

            <Line
              type="monotone"
              dataKey="cumulative_labor_value"
              name={fieldLabel('cumulative_labor_value')}
              stroke={ANALYTICS_CHART_COLORS[0]}
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="cumulative_expense_amount"
              name={fieldLabel('cumulative_expense_amount')}
              stroke={ANALYTICS_CHART_COLORS[2]}
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="cumulative_actual_amount"
              name={fieldLabel('cumulative_actual_amount')}
              stroke={ANALYTICS_CHART_COLORS[1]}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveChart>
      </AnalyticsCard>
    </div>
  );
}
