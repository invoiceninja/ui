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
import { ProjectBurnupMetricKey } from '$app/common/interfaces/project-burnup';
import { Checkbox } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { ProjectBurnupMetricDefinition } from './metrics';

interface Props {
  title: string;
  metrics: ProjectBurnupMetricDefinition[];
  visibleMetricKeys: ProjectBurnupMetricKey[];
  onToggle: (key: ProjectBurnupMetricKey) => void;
}

export function BurnupMetricGroup({
  title,
  metrics,
  visibleMetricKeys,
  onToggle,
}: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium" style={{ color: colors.$3 }}>
        {title}
      </p>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric, index) => (
          <Checkbox
            key={index}
            value={metric.key}
            label={t(metric.translationKey)}
            checked={visibleMetricKeys.includes(metric.key)}
            onValueChange={() => onToggle(metric.key)}
          />
        ))}
      </div>
    </div>
  );
}
