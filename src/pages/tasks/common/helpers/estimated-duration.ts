/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export type EstimatedDurationUnit = 'minutes' | 'hours' | 'days' | 'weeks';

export interface EstimatedDurationUnitDefinition {
  value: EstimatedDurationUnit;
  seconds: number;
}

export const ESTIMATED_DURATION_UNITS: EstimatedDurationUnitDefinition[] = [
  { value: 'minutes', seconds: 60 },
  { value: 'hours', seconds: 3600 },
  { value: 'days', seconds: 86400 },
  { value: 'weeks', seconds: 604800 },
];

export const DEFAULT_ESTIMATED_DURATION_UNIT: EstimatedDurationUnit = 'hours';

export const estimatedDurationToSeconds = (
  amount: string,
  unit: EstimatedDurationUnit
) => {
  const parsedAmount = parseFloat(amount);

  const unitSeconds =
    ESTIMATED_DURATION_UNITS.find((entry) => entry.value === unit)?.seconds ??
    3600;

  if (!Number.isFinite(parsedAmount)) {
    return null;
  }

  const seconds = Math.round(parsedAmount * unitSeconds);

  return seconds > 0 ? seconds : null;
};

export const secondsToEstimatedDuration = (seconds: number | null) => {
  if (
    typeof seconds !== 'number' ||
    !Number.isFinite(seconds) ||
    seconds <= 0
  ) {
    return { amount: '', unit: DEFAULT_ESTIMATED_DURATION_UNIT };
  }

  const unit =
    [...ESTIMATED_DURATION_UNITS]
      .reverse()
      .find((entry) => seconds % entry.seconds === 0) ??
    ESTIMATED_DURATION_UNITS[0];

  return {
    amount: String(parseFloat((seconds / unit.seconds).toFixed(4))),
    unit: unit.value,
  };
};
