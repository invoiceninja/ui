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
import { trans } from '$app/common/helpers';
import { ErrorMessage } from '$app/components/ErrorMessage';
import { SelectField } from '$app/components/forms';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Choice } from './Choice';
import { FieldHeading } from './FieldHeading';
import { Wizard } from '../hooks/useWizard';
import { formatDate } from '../helpers/dates';
import { firstSendDate, lastDate } from '../helpers/schedule';

const CYCLES = Array.from({ length: 36 }, (_, index) => index + 1);

const DEFAULT_CYCLES = 12;

interface Props {
  wizard: Wizard;
  draft: boolean;
}

export function ScheduleEnd({ wizard, draft }: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const recurringInvoice = wizard.recurringInvoice;
  const serverErrors = wizard.errors?.errors;

  const cycles = Number(recurringInvoice?.remaining_cycles ?? -1);

  const [limited, setLimited] = useState(() => cycles >= 0);

  const counts =
    cycles < 0 || CYCLES.includes(cycles)
      ? CYCLES
      : [...CYCLES, cycles].sort((a, b) => a - b);

  const last = lastDate(
    firstSendDate(recurringInvoice, wizard.startLater),
    recurringInvoice?.frequency_id ?? '',
    cycles
  );

  const chooseNever = () => {
    setLimited(false);

    if (cycles !== -1) {
      wizard.patch({ remaining_cycles: -1 });
    }
  };

  const chooseLimited = () => {
    setLimited(true);

    if (cycles < 0) {
      wizard.patch({ remaining_cycles: DEFAULT_CYCLES });
    }
  };

  return (
    <div>
      <FieldHeading label={t('when_should_it_stop')} />

      <div
        className="space-y-2"
        role="radiogroup"
        aria-label={t('when_should_it_stop')}
      >
        <Choice
          selected={!limited}
          onSelect={chooseNever}
          title={t('never')}
          detail={t('recurring_never_help')}
        />

        <Choice
          selected={limited}
          onSelect={chooseLimited}
          title={t('after_number_of_invoices')}
          detail={t('after_number_of_invoices_help')}
        />
      </div>

      {limited ? (
        <div className="mt-3">
          <SelectField
            id="iw-remaining-cycles"
            label={draft ? t('number_of_invoices') : t('invoices_left_to_send')}
            value={String(cycles)}
            onValueChange={(value) =>
              wizard.patch({ remaining_cycles: parseInt(value, 10) })
            }
            errorMessage={serverErrors?.remaining_cycles}
            customSelector
            dismissable={false}
          >
            {counts.map((count) => (
              <option key={count} value={String(count)}>
                {count}
              </option>
            ))}
          </SelectField>

          {last ? (
            <p className="text-sm mt-2" style={{ color: colors.$22 }}>
              {trans('last_invoice_will_be_sent_on', {
                date: formatDate(last),
              })}
            </p>
          ) : null}
        </div>
      ) : (
        <ErrorMessage className="mt-2">
          {serverErrors?.remaining_cycles}
        </ErrorMessage>
      )}
    </div>
  );
}
