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
import { date as formatDate } from '$app/common/helpers';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { Project } from '$app/common/interfaces/project';
import {
  ProjectBurnupBucketType,
  ProjectBurnupMetricKey,
} from '$app/common/interfaces/project-burnup';
import { useProjectBurnupQuery } from '$app/common/queries/project-burnup';
import { ErrorMessage } from '$app/components/ErrorMessage';
import { Spinner } from '$app/components/Spinner';
import { Card } from '$app/components/cards';
import Toggle from '$app/components/forms/Toggle';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BurnupMetricGroup } from './BurnupMetricGroup';
import { ProjectBurnupChart } from './ProjectBurnupChart';
import { resolveProjectBurnupDateRange } from './helpers';
import {
  DEFAULT_PROJECT_BURNUP_METRICS,
  PROJECT_BURNUP_METRICS,
} from './metrics';

interface Props {
  project: Project;
}

const BUCKET_OPTIONS: {
  value: ProjectBurnupBucketType;
  translationKey: string;
}[] = [
  { value: 'daily', translationKey: 'freq_daily' },
  { value: 'weekly', translationKey: 'freq_weekly' },
  { value: 'monthly', translationKey: 'freq_monthly' },
];

const HOUR_METRICS = PROJECT_BURNUP_METRICS.filter(
  (metric) => metric.axis === 'hours'
);
const MONEY_METRICS = PROJECT_BURNUP_METRICS.filter(
  (metric) => metric.axis === 'money'
);

export function Burnup({ project }: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const [bucketType, setBucketType] =
    useState<ProjectBurnupBucketType>('daily');
  const [includeDrafts, setIncludeDrafts] = useState(false);
  const [visibleMetricKeys, setVisibleMetricKeys] = useState<
    ProjectBurnupMetricKey[]
  >(DEFAULT_PROJECT_BURNUP_METRICS);

  const lifecycleDates = useMemo(() => {
    return resolveProjectBurnupDateRange({
      createdAt: project.created_at,
      dueDate: project.due_date,
    });
  }, [project.created_at, project.due_date]);

  const payload = useMemo(() => {
    return {
      project_id: project.id,
      start_date: lifecycleDates.start,
      end_date: lifecycleDates.end,
      bucket_type: bucketType,
      include_drafts: includeDrafts,
    };
  }, [
    project.id,
    lifecycleDates.start,
    lifecycleDates.end,
    bucketType,
    includeDrafts,
  ]);

  const burnup = useProjectBurnupQuery(payload, {
    enabled: Boolean(project.id),
  });

  const handleMetricToggle = (metricKey: ProjectBurnupMetricKey) => {
    setVisibleMetricKeys((current) => {
      if (current.includes(metricKey)) {
        return current.filter((key) => key !== metricKey);
      }

      return [...current, metricKey];
    });
  };

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
              <span className="font-medium">{t('range')}: </span>

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

          <Toggle
            label={t('include_drafts')}
            checked={includeDrafts}
            onValueChange={setIncludeDrafts}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <BurnupMetricGroup
            title={t('hours')}
            metrics={HOUR_METRICS}
            visibleMetricKeys={visibleMetricKeys}
            onToggle={handleMetricToggle}
          />

          <BurnupMetricGroup
            title={t('money')}
            metrics={MONEY_METRICS}
            visibleMetricKeys={visibleMetricKeys}
            onToggle={handleMetricToggle}
          />
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
