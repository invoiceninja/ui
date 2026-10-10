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
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import {
  useGetSetting,
  useGetSettingWithLevel,
} from '$app/common/hooks/useGetSetting';
import { Client } from '$app/common/interfaces/client';
import { Settings } from '$app/common/interfaces/company.interface';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '$app/components/Badge';
import { ErrorMessage } from '$app/components/ErrorMessage';
import { Button, SelectField } from '$app/components/forms';
import { Choice } from './Choice';
import { StepFooter } from './StepFooter';
import { StepTransition } from './StepTransition';
import { Wizard } from '../hooks/useWizard';

type DueChoice = 'on_receipt' | 'terms' | 'custom';

const DAYS = Array.from({ length: 31 }, (_, index) => String(index + 1));

const AUTO_BILL_OPTIONS = [
  { value: 'always', label: 'enabled' },
  { value: 'optout', label: 'optout' },
  { value: 'optin', label: 'optin' },
  { value: 'off', label: 'disabled' },
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

const withoutBlankSetting = (
  client: Client | undefined,
  key: keyof Settings
): Client | undefined => {
  if (!client) {
    return client;
  }

  const value = client.settings?.[key];

  return value === '' || value === null
    ? { ...client, settings: { ...client.settings, [key]: undefined } }
    : client;
};

export function StepTiming({ wizard, embedded }: Props) {
  const colors = useColorScheme();
  const [t] = useTranslation();
  const company = useCurrentCompany();
  const getSetting = useGetSetting();
  const getSettingWithLevel = useGetSettingWithLevel();

  const recurringInvoice = wizard.recurringInvoice;
  const client = wizard.client;

  const clientTerms = getSetting(
    withoutBlankSetting(client, 'payment_terms'),
    'payment_terms'
  ) as string | null | undefined;
  const terms = clientTerms ?? company?.settings?.payment_terms;
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

  return (
    <StepTransition>
      <p
        className="text-[0.8125rem] mb-2.5"
        style={{ color: colors.$22, fontWeight: 500 }}
      >
        {t('due_date')}
      </p>

      <div className="space-y-2" role="radiogroup" aria-label={t('due_date')}>
        <Choice
          selected={due === 'on_receipt'}
          onSelect={() => chooseDue('on_receipt')}
          title={t('due_on_receipt')}
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
          trailing={
            !hasTerms
              ? t('no_due_date')
              : termDays === 0
                ? t('due_on_receipt')
                : trans('count_days', { count: termDays })
          }
        />

        <Choice
          selected={due === 'custom'}
          onSelect={() => chooseDue('custom')}
          title={t('custom')}
        />
      </div>

      {due === 'custom' ? (
        <div className="mt-4">
          <SelectField
            id="iw-due-day"
            label={t('due_date')}
            value={String(recurringInvoice?.due_date_days ?? '')}
            onValueChange={(value) => wizard.patch({ due_date_days: value })}
            errorMessage={serverErrors?.due_date_days}
            customSelector
            dismissable={false}
          >
            {DAYS.map((day) => (
              <option key={day} value={day}>
                {`${t('day')} ${day}`}
              </option>
            ))}
          </SelectField>
        </div>
      ) : (
        <ErrorMessage className="mt-2">
          {serverErrors?.due_date_days}
        </ErrorMessage>
      )}

      <p
        className="text-[0.8125rem] mt-8 mb-2.5"
        style={{ color: colors.$22, fontWeight: 500 }}
      >
        {t('auto_bill')}
      </p>

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
          />
        ))}
      </div>

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
