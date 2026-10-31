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
import { Button } from '$app/components/forms';
import { ErrorMessage } from '$app/components/ErrorMessage';
import { useTranslation } from 'react-i18next';
import { FieldHeading } from './FieldHeading';
import { NextSendDate } from './NextSendDate';
import { ScheduleEnd } from './ScheduleEnd';
import { ScheduleStart } from './ScheduleStart';
import { StepFooter } from './StepFooter';
import { StepTransition } from './StepTransition';
import { UpcomingInvoices } from './UpcomingInvoices';
import { Wizard } from '../hooks/useWizard';
import {
  firstSendDate,
  sendsRightAway,
  upcomingDates,
} from '../helpers/schedule';
import { isDraft } from '../helpers/status';

interface Props {
  wizard: Wizard;
  embedded?: boolean;
}

export function StepSchedule({ wizard, embedded }: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const recurringInvoice = wizard.recurringInvoice;
  const serverErrors = wizard.errors?.errors;

  const frequencyId = recurringInvoice?.frequency_id ?? '';
  const cycles = Number(recurringInvoice?.remaining_cycles ?? -1);

  const draft = isDraft(recurringInvoice);
  const rightAway = sendsRightAway(recurringInvoice, wizard.startLater);

  const upcoming = upcomingDates(
    firstSendDate(recurringInvoice, wizard.startLater),
    frequencyId,
    cycles,
    3
  );

  return (
    <StepTransition>
      <div>
        <FieldHeading
          label={t('frequency')}
          help={t('recurring_frequency_help')}
        />

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

      <div className="mt-8">
        {draft ? (
          <ScheduleStart wizard={wizard} />
        ) : (
          <NextSendDate wizard={wizard} />
        )}
      </div>

      <div className="mt-8">
        <ScheduleEnd wizard={wizard} draft={draft} />
      </div>

      {embedded ? null : (
        <div className="mt-8">
          <UpcomingInvoices
            dates={upcoming}
            firstTag={rightAway ? t('right_away') : undefined}
          />
        </div>
      )}

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
