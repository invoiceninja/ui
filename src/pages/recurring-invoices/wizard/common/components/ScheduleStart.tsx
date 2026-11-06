/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ErrorMessage } from '$app/components/ErrorMessage';
import { InputField } from '$app/components/forms';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Choice } from './Choice';
import { FieldHeading } from './FieldHeading';
import { Wizard } from '../hooks/useWizard';
import { toDateInput, today, tomorrow } from '../helpers/dates';

interface Props {
  wizard: Wizard;
}

export function ScheduleStart({ wizard }: Props) {
  const [t] = useTranslation();

  const start = toDateInput(wizard.recurringInvoice?.next_send_date);
  const serverErrors = wizard.errors?.errors;
  const later = wizard.startLater;

  const laterDate = useRef(start > today() ? start : '');

  const chooseRightAway = () => {
    wizard.setStartLater(false);

    if (start !== today()) {
      wizard.patch({ next_send_date: today() });
    }
  };

  const chooseLater = () => {
    wizard.setStartLater(true);

    if (start <= today()) {
      wizard.patch({
        next_send_date:
          laterDate.current > today() ? laterDate.current : tomorrow(),
      });
    }
  };

  return (
    <div>
      <FieldHeading label={t('when_do_you_want_this_to_start')} />

      <div
        className="space-y-2"
        role="radiogroup"
        aria-label={t('when_do_you_want_this_to_start')}
      >
        <Choice
          selected={!later}
          onSelect={chooseRightAway}
          title={t('right_away')}
          detail={t('right_away_help')}
        />

        <Choice
          selected={later}
          onSelect={chooseLater}
          title={t('on_a_later_date')}
          detail={t('on_a_later_date_help')}
        />
      </div>

      {later ? (
        <div className="mt-3">
          <InputField
            id="iw-start-date"
            label={t('start_date')}
            type="date"
            value={start}
            min={tomorrow()}
            changeOverride
            debounceTimeout={0}
            errorMessage={serverErrors?.next_send_date}
            onValueChange={(value) => {
              if (!value || value === start) {
                return;
              }

              laterDate.current = value;
              wizard.patch({ next_send_date: value });
            }}
          />
        </div>
      ) : (
        <ErrorMessage className="mt-2">
          {serverErrors?.next_send_date}
        </ErrorMessage>
      )}
    </div>
  );
}
