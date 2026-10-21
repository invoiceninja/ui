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
import frequencies from '$app/common/constants/frequency';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { Button, InputField, SelectField } from '$app/components/forms';
import { ErrorMessage } from '$app/components/ErrorMessage';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StepFooter } from './StepFooter';
import { StepTransition } from './StepTransition';
import { Wizard } from '../hooks/useWizard';
import { toDateInput, today } from '../helpers/dates';
import { upcomingDates } from '../helpers/schedule';

const CYCLES = Array.from({ length: 36 }, (_, index) => index + 1);

interface Props {
  wizard: Wizard;
  embedded?: boolean;
}

export function StepSchedule({ wizard, embedded }: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const accentColor = useAccentColor();

  const recurringInvoice = wizard.recurringInvoice;
  const serverErrors = wizard.errors?.errors;

  const frequencyId = recurringInvoice?.frequency_id ?? '';
  const start = toDateInput(recurringInvoice?.next_send_date);
  const cycles = Number(recurringInvoice?.remaining_cycles ?? -1);

  const [showCycles, setShowCycles] = useState(false);

  const upcoming = upcomingDates(start, frequencyId, cycles, 3);

  return (
    <StepTransition>
      <div>
        <p
          className="text-[0.8125rem] mb-2.5"
          style={{ color: colors.$22, fontWeight: 500 }}
        >
          {t('frequency')}
        </p>

        <div
          className="grid grid-cols-2 sm:grid-cols-3 gap-2"
          role="radiogroup"
          aria-label={t('frequency')}
        >
          {Object.entries(frequencies).map(([id, label]) => {
            const active = frequencyId === id;

            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => wizard.patch({ frequency_id: id })}
                className="text-sm px-3.5 py-2 border text-left"
                style={{
                  borderRadius: '0.375rem',
                  borderColor: active ? colors.$3 : colors.$24,
                  backgroundColor: active ? colors.$25 : colors.$1,
                  color: colors.$3,
                  fontWeight: 500,
                  boxShadow: active ? `inset 0 0 0 1px ${colors.$3}` : 'none',
                }}
              >
                {t(label)}
              </button>
            );
          })}
        </div>

        <ErrorMessage className="mt-2">
          {serverErrors?.frequency_id}
        </ErrorMessage>
      </div>

      <div className="mt-6">
        <InputField
          id="iw-start-date"
          label={t('start_date')}
          type="date"
          value={start}
          min={today()}
          changeOverride
          debounceTimeout={0}
          errorMessage={serverErrors?.next_send_date}
          onValueChange={(value) => {
            if (value === start) {
              return;
            }

            wizard.patch({ next_send_date: value });
          }}
        />
      </div>

      <div className="mt-6">
        {showCycles || serverErrors?.remaining_cycles ? (
          <SelectField
            id="iw-remaining-cycles"
            label={t('remaining_cycles')}
            value={String(cycles)}
            onValueChange={(value) =>
              wizard.patch({ remaining_cycles: parseInt(value, 10) })
            }
            errorMessage={serverErrors?.remaining_cycles}
            customSelector
            dismissable={false}
          >
            <option value="-1">{t('endless')}</option>

            {(cycles === 0 ? [0, ...CYCLES] : CYCLES).map((count) => (
              <option key={count} value={String(count)}>
                {count}
              </option>
            ))}
          </SelectField>
        ) : (
          <p className="text-sm" style={{ color: colors.$17 }}>
            {`${t('remaining_cycles')}: ${cycles < 0 ? t('endless') : cycles}`}{' '}
            <button
              type="button"
              onClick={() => setShowCycles(true)}
              style={{ color: accentColor, fontWeight: 500 }}
            >
              {t('change')}
            </button>
          </p>
        )}
      </div>

      {upcoming.length ? (
        <div
          className="mt-6 border px-4 py-3.5"
          style={{
            borderColor: colors.$24,
            borderRadius: '0.375rem',
            backgroundColor: colors.$1,
          }}
        >
          <p
            className="text-xs mb-2"
            style={{ color: colors.$22, fontWeight: 500 }}
          >
            {t('upcoming_invoices')}
          </p>

          <ul className="space-y-1">
            {upcoming.map((date) => (
              <li
                key={date}
                className="text-sm"
                style={{
                  color: colors.$3,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {dayjs(date).format('D MMMM YYYY')}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {embedded ? null : (
        <StepFooter
          back={
            <Button
              type="secondary"
              behavior="button"
              disableWithoutIcon
              onClick={wizard.back}
            >
              {t('back')}
            </Button>
          }
        >
          <Button behavior="button" disableWithoutIcon onClick={wizard.next}>
            {t('continue')}
          </Button>
        </StepFooter>
      )}
    </StepTransition>
  );
}
