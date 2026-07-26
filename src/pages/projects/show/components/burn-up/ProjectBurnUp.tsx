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
import { Project } from '$app/common/interfaces/project';
import { Card } from '$app/components/cards';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { computeBurnUp } from './burn-up';
import { BurnUpChart } from './BurnUpChart';
import { BurnUpEmptyState } from './BurnUpEmptyState';
import { BurnUpStatusBadge } from './BurnUpStatusBadge';
import { BurnUpSummary } from './BurnUpSummary';

interface Props {
  project: Project;
}

export function ProjectBurnUp({ project }: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const data = useMemo(() => computeBurnUp(project), [project]);

  return (
    <Card
      title={t('burn_up')}
      className="shadow-sm"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
      topRight={<BurnUpStatusBadge status={data.summary.status} />}
      childrenClassName="px-4 sm:px-6"
    >
      <BurnUpSummary data={data} />

      {!data.hasTasks && <BurnUpEmptyState message={t('no_records_found')} />}

      {data.hasTasks && !data.hasScope && (
        <BurnUpEmptyState message={t('no_budgeted_hours')} />
      )}

      {data.hasTasks && data.hasScope && (
        <div className="mt-6">
          <BurnUpChart data={data} />
        </div>
      )}
    </Card>
  );
}
