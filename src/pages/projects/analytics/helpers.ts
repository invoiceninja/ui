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
  ProjectAnalyticsValue,
  ProjectHealth,
  ProjectNestedSection,
} from '$app/common/interfaces/project-analytics';
import {
  ANALYTICS_CHART_COLORS,
  ANALYTICS_KEY_FIELDS,
  FIELD_LABELS,
} from './constants';

export type AnalyticsChartDatum = Record<string, unknown>;

interface ProjectScopedRow {
  project_id?: ProjectAnalyticsValue;
  project_name?: string;
}

export const toNumber = (value: unknown) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

export const hasValue = (value: unknown) => {
  return value !== undefined && value !== null && value !== '';
};

export const idsMatch = (left: ProjectAnalyticsValue, right: string) => {
  return String(left ?? '') === String(right ?? '');
};

export const findProjectRow = <T extends ProjectScopedRow>(
  rows: T[] | undefined,
  projectId: string
) => {
  return rows?.find((row) => idsMatch(row.project_id, projectId));
};

export const getNestedRows = <T>(
  feed: ProjectNestedSection<T>[] | undefined,
  projectId: string
) => {
  const projectFeed = feed?.find((row) => idsMatch(row.project_id, projectId));

  if (!projectFeed) {
    return [];
  }

  const nestedRows = Object.entries(projectFeed).find(([key, value]) => {
    return !ANALYTICS_KEY_FIELDS.includes(key) && Array.isArray(value);
  })?.[1];

  return Array.isArray(nestedRows) ? (nestedRows as T[]) : [];
};

const toChartDatum = (row: object) => {
  return Object.fromEntries(Object.entries(row));
};

export const normalizeRows = <T extends object>(
  rows: T[] | undefined,
  numericKeys: string[]
) => {
  return (rows || []).map((row) => {
    const normalized = toChartDatum(row);

    numericKeys.forEach((key) => {
      normalized[key] = toNumber(normalized[key]);
    });

    return normalized;
  });
};

export const singleProjectData = <T extends ProjectScopedRow>(
  row: T | undefined,
  projectName: string,
  numericKeys: string[]
) => {
  if (!row) {
    return [];
  }

  const named = toChartDatum(row);
  named.project_name = row.project_name || projectName;

  return normalizeRows([named], numericKeys);
};

export const sumChartValues = (rows: AnalyticsChartDatum[], key: string) => {
  return rows.reduce((total, row) => {
    return total + toNumber(row[key]);
  }, 0);
};

export const ratioBarWidth = (value: unknown) => {
  return Math.max(0, Math.min(100, toNumber(value) * 100));
};

export const resolveFieldLabelKey = (key: string) => {
  return FIELD_LABELS[key] || key;
};

export const resolveProjectHealthScore = (health?: ProjectHealth) => {
  return health?.score ?? health?.health_score;
};

export const resolveProjectHealthStatus = (health?: ProjectHealth) => {
  return health?.status ?? health?.health_status;
};

export const resolveProjectHealthIndicatorRows = (health?: ProjectHealth) => {
  const indicators = health?.indicators;

  if (!indicators) {
    return [];
  }

  const scheduleColor =
    toNumber(indicators.schedule_variance_days) < 0
      ? ANALYTICS_CHART_COLORS[3]
      : ANALYTICS_CHART_COLORS[1];

  return [
    {
      key: 'budget_utilization',
      value: indicators.budget_utilization,
      color: ANALYTICS_CHART_COLORS[0],
      showBar: true,
      showStrip: false,
    },
    {
      key: 'schedule_variance_days',
      value: indicators.schedule_variance_days,
      color: scheduleColor,
      showBar: false,
      showStrip: true,
    },
    {
      key: 'margin_ratio',
      value: indicators.margin_ratio,
      color: ANALYTICS_CHART_COLORS[1],
      showBar: true,
      showStrip: false,
    },
    {
      key: 'unbilled_ratio',
      value: indicators.unbilled_ratio,
      color: ANALYTICS_CHART_COLORS[4],
      showBar: true,
      showStrip: false,
    },
    {
      key: 'outstanding_ratio',
      value: indicators.outstanding_ratio,
      color: ANALYTICS_CHART_COLORS[3],
      showBar: true,
      showStrip: false,
    },
  ].filter((row) => {
    return hasValue(row.value);
  });
};

export const truncateAxisTick = (value: unknown, maxLength: number) => {
  const text = String(value ?? '');

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1)}…`;
};

export const cleanTooltipText = (value: unknown) => {
  const text = String(value ?? '').trim();

  return text || undefined;
};

export const toFiniteNumber = (value: unknown) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

export const formatCompact = (value: unknown) => {
  return new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(toNumber(value));
};

export const axisTick = (fill: string) => {
  return { fill, fontSize: 12 };
};

export const xAxisLabel = (value: string, fill: string, offset = -6) => {
  return {
    value,
    position: 'insideBottom',
    offset,
    style: { fill, fontSize: 12 },
  };
};

export const yAxisLabel = (
  value: string,
  fill: string,
  position: 'insideLeft' | 'insideRight' = 'insideLeft'
) => {
  return {
    value,
    angle: position === 'insideRight' ? 90 : -90,
    position,
    style: { textAnchor: 'middle', fill, fontSize: 12 },
  };
};

export const formatRatioPercent = (value: number) => {
  const formatted = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
  }).format(value * 100);

  return `${formatted}%`;
};
