/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Frequency } from '$app/common/enums/frequency';

export default {
  [Frequency.Daily]: 'freq_daily',
  [Frequency.Weekly]: 'freq_weekly',
  [Frequency.TwoWeeks]: 'freq_two_weeks',
  [Frequency.FourWeeks]: 'freq_four_weeks',
  [Frequency.Monthly]: 'freq_monthly',
  [Frequency.TwoMonths]: 'freq_two_months',
  [Frequency.ThreeMonths]: 'freq_three_months',
  [Frequency.FourMonths]: 'freq_four_months',
  [Frequency.SixMonths]: 'freq_six_months',
  [Frequency.Annually]: 'freq_annually',
  [Frequency.TwoYears]: 'freq_two_years',
  [Frequency.ThreeYears]: 'freq_three_years',
};
