/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { ErrorMessage } from '$app/components/ErrorMessage';
import { InputLabel, SelectField } from '$app/components/forms';
import {
  DEFAULT_ESTIMATED_DURATION_UNIT,
  ESTIMATED_DURATION_UNITS,
  EstimatedDurationUnit,
  estimatedDurationToSeconds,
  secondsToEstimatedDuration,
} from '../helpers/estimated-duration';

interface Props {
  value: number | null | undefined;
  onValueChange: (seconds: number | null) => void;
  label?: string | null;
  errorMessage?: string | string[];
  disabled?: boolean;
}

export function EstimatedDurationInput(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const reactSettings = useReactSettings();

  const { value, onValueChange, label, errorMessage, disabled } = props;

  const [amount, setAmount] = useState<string>('');
  const [unit, setUnit] = useState<EstimatedDurationUnit>(
    DEFAULT_ESTIMATED_DURATION_UNIT
  );

  const emittedValue = useRef<number | null | undefined>(undefined);

  useEffect(() => {
    if (value === emittedValue.current) {
      return;
    }

    const duration = secondsToEstimatedDuration(value ?? null);

    setAmount(duration.amount);

    if (duration.amount) {
      setUnit(duration.unit);
    }

    emittedValue.current = value;
  }, [value]);

  const handleChange = (
    currentAmount: string,
    currentUnit: EstimatedDurationUnit
  ) => {
    const seconds = estimatedDurationToSeconds(currentAmount, currentUnit);

    emittedValue.current = seconds;

    onValueChange(seconds);
  };

  return (
    <div className="flex flex-col w-full">
      <InputLabel className="mb-1">
        {label ?? t('estimated_duration')}
      </InputLabel>

      <div className="flex items-center space-x-2">
        <input
          type="number"
          min="0"
          step="any"
          value={amount}
          disabled={disabled}
          onChange={(event) => {
            setAmount(event.target.value);
            handleChange(event.target.value, unit);
          }}
          onBlur={(event) => {
            if (estimatedDurationToSeconds(amount, unit) === null) {
              event.currentTarget.value = '';
              setAmount('');
            }
          }}
          className={classNames(
            'flex-1 min-w-0 py-2 px-3 rounded-md text-sm border disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none focus:ring-0',
            {
              'border-[#09090B26] focus:border-black': !reactSettings.dark_mode,
              'border-[#1f2e41] focus:border-white': reactSettings.dark_mode,
            }
          )}
          style={{
            backgroundColor: colors.$1,
            color: colors.$3,
            colorScheme: colors.$0,
          }}
        />

        <div className="w-36">
          <SelectField
            value={unit}
            onValueChange={(selectedUnit) => {
              setUnit(selectedUnit as EstimatedDurationUnit);
              handleChange(amount, selectedUnit as EstimatedDurationUnit);
            }}
            disabled={disabled}
            customSelector
            dismissable={false}
            searchable={false}
          >
            {ESTIMATED_DURATION_UNITS.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {t(entry.value)}
              </option>
            ))}
          </SelectField>
        </div>
      </div>

      <ErrorMessage className="mt-2">{errorMessage}</ErrorMessage>
    </div>
  );
}
