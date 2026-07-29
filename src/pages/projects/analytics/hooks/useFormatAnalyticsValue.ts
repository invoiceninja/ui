/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useFormatNumber } from '$app/common/hooks/useFormatNumber';
import { Project } from '$app/common/interfaces/project';
import {
  HOURS_FIELDS,
  MONEY_FIELDS,
  PERCENT_FIELDS,
  RATIO_FIELDS,
} from '../constants';
import { toNumber } from '../helpers';

export function useFormatAnalyticsValue(project: Project) {
  const company = useCurrentCompany();
  const formatMoney = useFormatMoney();
  const formatNumber = useFormatNumber();

  const currencyId =
    project.client?.settings?.currency_id || company?.settings.currency_id;
  const countryId = project.client?.country_id || company?.settings.country_id;

  return (dataKey: string, value: unknown) => {
    if (MONEY_FIELDS.has(dataKey)) {
      return formatMoney(toNumber(value), countryId, currencyId, 2).toString();
    }

    if (HOURS_FIELDS.has(dataKey)) {
      return `${formatNumber(toNumber(value))}h`;
    }

    if (RATIO_FIELDS.has(dataKey)) {
      return `${formatNumber(toNumber(value) * 100)}%`;
    }

    if (PERCENT_FIELDS.has(dataKey)) {
      return `${formatNumber(toNumber(value))}%`;
    }

    if (dataKey === 'schedule_variance_days') {
      return `${formatNumber(toNumber(value))}d`;
    }

    return formatNumber(toNumber(value)).toString();
  };
}
