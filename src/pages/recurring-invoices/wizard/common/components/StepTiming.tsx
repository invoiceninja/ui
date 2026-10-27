/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { trans } from '$app/common/helpers';
import { useColorScheme } from '$app/common/colors';
import { useGetSettingWithLevel } from '$app/common/hooks/useGetSetting';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '$app/components/Badge';
import { ErrorMessage } from '$app/components/ErrorMessage';
import { Button } from '$app/components/forms';
import { AutoBillTiming } from './AutoBillTiming';
import { Choice } from './Choice';
import { DueDayPicker } from './DueDayPicker';
import { FieldHeading } from './FieldHeading';
import { StepFooter } from './StepFooter';
import { StepTransition } from './StepTransition';
import { UpcomingInvoices } from './UpcomingInvoices';
import { usePaymentTerms } from '../hooks/usePaymentTerms';
import { Wizard } from '../hooks/useWizard';
import { today } from '../helpers/dates';
import { dueDate, firstSendDate, upcomingDates } from '../helpers/schedule';
import { withoutBlankSetting } from '../helpers/settings';

type DueChoice = 'on_receipt' | 'terms' | 'custom';

const DAYS = Array.from({ length: 31 }, (_, index) => String(index + 1));

const AUTO_BILL_OPTIONS = [
  { value: 'always', label: 'enabled', detail: 'auto_bill_always_detail' },
  { value: 'optout', label: 'optout', detail: 'auto_bill_optout_detail' },
  { value: 'optin', label: 'optin', detail: 'auto_bill_optin_detail' },
  { value: 'off', label: 'disabled', detail: 'auto_bill_off_detail' },
];

interface Props {
  wizard: Wizard;
  embedded?: boolean;
}

const toDays = (value: unknown): number => {
  const days = parseInt(String(value ?? ''), 10);

  return Number.isFinite(days) && days > 0 ? days : 0;
};

const dueChoiceOf = (value: string | undefined): DueChoice => {
  if (value === 'on_receipt') {
    return 'on_receipt';
  }

  return DAYS.includes(String(value)) ? 'custom' : 'terms';
};

export function StepTiming({ wizard, embedded }: Props) {
  const colors = useColorScheme();
  const [t] = useTranslation();
  const getSettingWithLevel = useGetSettingWithLevel();

  const recurringInvoice = wizard.recurringInvoice;
  const client = wizard.client;

  const terms = usePaymentTerms(client);
  const termDays = toDays(terms);
  const hasTerms = terms !== '' && terms !== null && terms !== undefined;

  const autoBillSetting = getSettingWithLevel(
    withoutBlankSetting(client, 'auto_bill'),
    'auto_bill'
  );
  const defaultAutoBill =
    (autoBillSetting.value as string | undefined) || 'off';

  const [due, setDue] = useState<DueChoice>(() =>
    dueChoiceOf(recurringInvoice?.due_date_days)
  );

  const defaulted = useRef(false);

  useEffect(() => {
    if (defaulted.current || autoBillSetting.level === null) {
      return;
    }

    defaulted.current = true;

    if (wizard.recurringInvoiceId || recurringInvoice?.auto_bill) {
      return;
    }

    wizard.patch({ auto_bill: defaultAutoBill });
  }, [autoBillSetting.level]);

  const chooseDue = (next: DueChoice) => {
    setDue(next);

    if (next === 'custom') {
      if (!DAYS.includes(String(recurringInvoice?.due_date_days))) {
        wizard.patch({ due_date_days: DAYS[0] });
      }

      return;
    }

    wizard.patch({ due_date_days: next });
  };

  const serverErrors = wizard.errors?.errors;

  const first = firstSendDate(recurringInvoice, wizard.startLater);
  const dueTerms = hasTerms ? terms : null;

  const upcoming = upcomingDates(
    first,
    recurringInvoice?.frequency_id ?? '',
    Number(recurringInvoice?.remaining_cycles ?? -1),
    3
  );

  const hasDueDate =
    dueDate(first || today(), recurringInvoice?.due_date_days, dueTerms) !==
    null;

  return (
    <StepTransition>
      <FieldHeading label={t('due_date')} help={t('recurring_due_date_hint')} />

      <div className="space-y-2" role="radiogroup" aria-label={t('due_date')}>
        <Choice
          selected={due === 'on_receipt'}
          onSelect={() => chooseDue('on_receipt')}
          title={t('due_on_receipt')}
          detail={t('due_on_receipt_help')}
        />

        <Choice
          selected={due === 'terms'}
          onSelect={() => chooseDue('terms')}
          title={
            <>
              {t('use_payment_terms')}

              <Badge className="ml-2" variant="primary">
                {t('default')}
              </Badge>
            </>
          }
          detail={
            !hasTerms
              ? t('no_payment_terms_help')
              : termDays === 0
                ? t('due_on_receipt_help')
                : trans('due_count_days_after_sent', { count: termDays })
          }
        />

        <Choice
          selected={due === 'custom'}
          onSelect={() => chooseDue('custom')}
          title={t('day_of_the_month')}
          detail={t('day_of_the_month_help')}
        />
      </div>

      {due === 'custom' ? (
        <div className="mt-3">
          <DueDayPicker
            value={String(recurringInvoice?.due_date_days ?? '')}
            label={t('day_of_the_month')}
            onChange={(day) => wizard.patch({ due_date_days: day })}
          />

          <p className="text-[0.8125rem] mt-2.5" style={{ color: colors.$22 }}>
            {t('day_of_the_month_rule')}
          </p>
        </div>
      ) : null}

      <ErrorMessage className="mt-2">
        {serverErrors?.due_date_days}
      </ErrorMessage>

      <div className="mt-6">
        <UpcomingInvoices
          dates={upcoming}
          due={{
            dueDateDays: recurringInvoice?.due_date_days,
            terms: dueTerms,
          }}
        />
      </div>

      <div className="mt-8">
        <FieldHeading
          label={t('auto_bill')}
          help={t('recurring_auto_bill_help')}
        />
      </div>

      <div className="space-y-2" role="radiogroup" aria-label={t('auto_bill')}>
        {AUTO_BILL_OPTIONS.map((option) => (
          <Choice
            key={option.value}
            selected={recurringInvoice?.auto_bill === option.value}
            onSelect={() => wizard.patch({ auto_bill: option.value })}
            title={
              <>
                {t(option.label)}

                {option.value === defaultAutoBill ? (
                  <Badge className="ml-2" variant="primary">
                    {t('default')}
                  </Badge>
                ) : null}
              </>
            }
            detail={t(option.detail)}
          />
        ))}
      </div>

      <AutoBillTiming wizard={wizard} hasDueDate={hasDueDate} />

      <ErrorMessage className="mt-2">
        {serverErrors?.auto_bill ?? serverErrors?.auto_bill_enabled}
      </ErrorMessage>

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
          <Button
            behavior="button"
            disabled={!recurringInvoice?.auto_bill}
            disableWithoutIcon
            onClick={wizard.next}
          >
            {t('continue')}
          </Button>
        </StepFooter>
      )}
    </StepTransition>
  );
}
