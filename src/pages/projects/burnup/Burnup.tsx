/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date as formatDate } from '$app/common/helpers';
import { useColorScheme } from '$app/common/colors';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import {
  ProjectBurnupBucketType,
  ProjectBurnupMetricKey,
} from '$app/common/interfaces/project-burnup';
import { Project } from '$app/common/interfaces/project';
import { useProjectBurnupQuery } from '$app/common/queries/project-burnup';
import { ErrorMessage } from '$app/components/ErrorMessage';
import { Spinner } from '$app/components/Spinner';
import { Card } from '$app/components/cards';
import { Checkbox } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useParams } from 'react-router-dom';
import { ProjectBurnupChart } from './ProjectBurnupChart';
import { resolveProjectBurnupDateRange } from './helpers';
import {
  DEFAULT_PROJECT_BURNUP_METRICS,
  PROJECT_BURNUP_METRICS,
  ProjectBurnupMetricDefinition,
} from './metrics';

interface Context {
  project?: Project;
}

interface Props {
  project?: Project;
  includeDrafts?: boolean;
  onIncludeDraftsChange?: (value: boolean) => void;
  showIncludeDraftsToggle?: boolean;
}

const BUCKET_OPTIONS: {
  value: ProjectBurnupBucketType;
  translationKey: string;
}[] = [
  { value: 'daily', translationKey: 'freq_daily' },
  { value: 'weekly', translationKey: 'freq_weekly' },
  { value: 'monthly', translationKey: 'freq_monthly' },
];

export default function Burnup(props: Props) {
  const { t } = useTranslation();
  const { id } = useParams();
  const colors = useColorScheme();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const outletContext = useOutletContext<Context | null>();

  const [bucketType, setBucketType] =
    useState<ProjectBurnupBucketType>('daily');
  const [localIncludeDrafts, setLocalIncludeDrafts] = useState(false);
  const [visibleMetricKeys, setVisibleMetricKeys] = useState<
    ProjectBurnupMetricKey[]
  >(DEFAULT_PROJECT_BURNUP_METRICS);

  const project = props.project || outletContext?.project;
  const includeDrafts = props.includeDrafts ?? localIncludeDrafts;

  const setIncludeDrafts = (value: boolean) => {
    if (typeof props.includeDrafts === 'undefined') {
      setLocalIncludeDrafts(value);
    }

    props.onIncludeDraftsChange?.(value);
  };

  const projectId = project?.id || id || '';
  const lifecycleDates = useMemo(
    () =>
      resolveProjectBurnupDateRange({
        createdAt: project?.created_at,
        dueDate: project?.due_date,
      }),
    [project?.created_at, project?.due_date]
  );

  const payload = useMemo(
    () => ({
      project_id: projectId,
      start_date: lifecycleDates.start,
      end_date: lifecycleDates.end,
      bucket_type: bucketType,
      include_drafts: includeDrafts,
    }),
    [
      projectId,
      lifecycleDates.start,
      lifecycleDates.end,
      bucketType,
      includeDrafts,
    ]
  );

  const burnup = useProjectBurnupQuery(payload, {
    enabled: Boolean(projectId),
  });

  const handleMetricToggle = (metricKey: ProjectBurnupMetricKey) => {
    setVisibleMetricKeys((current) => {
      if (current.includes(metricKey)) {
        return current.filter((key) => key !== metricKey);
      }

      return [...current, metricKey];
    });
  };

  const translateMetric = (metric: ProjectBurnupMetricDefinition) =>
    t(metric.translationKey);

  const renderMetricGroup = (
    title: string,
    metrics: ProjectBurnupMetricDefinition[]
  ) => (
    <div className="space-y-3">
      <p className="text-sm font-medium" style={{ color: colors.$3 }}>
        {title}
      </p>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <Checkbox
            key={metric.key}
            value={metric.key}
            label={translateMetric(metric)}
            checked={visibleMetricKeys.includes(metric.key)}
            onValueChange={() => handleMetricToggle(metric.key)}
          />
        ))}
      </div>
    </div>
  );

  if (!project) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <Card
      title={t('burn_up')}
      className="shadow-sm"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
      withoutBodyPadding
    >
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div
              className="rounded-md border px-3 py-2 text-sm"
              style={{ backgroundColor: colors.$1, borderColor: colors.$24 }}
            >
              <span className="font-medium">
                {t('range')}:{' '}
              </span>

              <span>
                {formatDate(lifecycleDates.start, dateFormat)} -{' '}
                {formatDate(lifecycleDates.end, dateFormat)}
              </span>
            </div>

            <div
              className="flex w-max overflow-hidden rounded-md border shadow-sm"
              style={{ borderColor: colors.$24 }}
            >
              {BUCKET_OPTIONS.map((bucket, index) => {
                const active = bucketType === bucket.value;

                return (
                  <button
                    key={bucket.value}
                    type="button"
                    className={classNames('px-4 py-2 text-sm font-medium', {
                      'border-l': index > 0,
                    })}
                    style={{
                      borderColor: colors.$24,
                      backgroundColor: active ? colors.$3 : colors.$1,
                      color: active ? colors.$1 : colors.$3,
                    }}
                    onClick={() => setBucketType(bucket.value)}
                  >
                    {t(bucket.translationKey)}
                  </button>
                );
              })}
            </div>
          </div>

          {props.showIncludeDraftsToggle !== false && (
            <Toggle
              label={t('include_drafts')}
              checked={includeDrafts}
              onValueChange={setIncludeDrafts}
            />
          )}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {renderMetricGroup(
            t('hours'),
            PROJECT_BURNUP_METRICS.filter((metric) => metric.axis === 'hours')
          )}

          {renderMetricGroup(
            t('money'),
            PROJECT_BURNUP_METRICS.filter((metric) => metric.axis === 'money')
          )}
        </div>

        {burnup.isLoading && (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        )}

        {burnup.isError && (
          <ErrorMessage>{t('something_went_wrong')}</ErrorMessage>
        )}

        {burnup.data && !burnup.isLoading && (
          <ProjectBurnupChart
            data={burnup.data}
            project={project}
            visibleMetricKeys={visibleMetricKeys}
          />
        )}
      </div>
    </Card>
  );
}
