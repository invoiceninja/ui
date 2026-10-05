/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint, trans } from '$app/common/helpers';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useColorScheme } from '$app/common/colors';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useGetSetting } from '$app/common/hooks/useGetSetting';
import { updateRecord } from '$app/common/stores/slices/company-users';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Button, InputField } from '$app/components/forms';
import { Callout } from './Callout';
import { Choice } from './Choice';
import { StepFooter } from './StepFooter';
import { StepTransition } from './StepTransition';
import { Wizard } from '../hooks/useWizard';
import { addDays, today } from '../helpers/dates';

type Term = number | 'custom';

const PRESET_DAYS = [0, 7, 14, 30];

interface Props {
  wizard: Wizard;
  embedded?: boolean;
}

const toDays = (value: unknown): number => {
  const days = parseInt(String(value ?? ''), 10);

  return Number.isFinite(days) && days > 0 ? days : 0;
};

const termFromDates = (
  date: string | undefined,
  dueDate: string | undefined,
  options: number[]
): Term | null => {
  if (!dueDate) {
    return null;
  }

  const days = dayjs(dueDate).diff(dayjs(date || today()), 'day');

  return options.includes(days) ? days : 'custom';
};

export function StepTiming({ wizard, embedded }: Props) {
  const accentColor = useAccentColor();
  const colors = useColorScheme();
  const [t] = useTranslation();
  const company = useCurrentCompany();
  const dispatch = useDispatch();
  const getSetting = useGetSetting();

  const invoice = wizard.invoice;
  const invoiceDate = invoice?.date || today();

  const client = wizard.client;

  const clientTerms = getSetting(
    client?.settings?.payment_terms === '' ||
      client?.settings?.payment_terms === null
      ? {
          ...client,
          settings: { ...client.settings, payment_terms: undefined },
        }
      : client,
    'payment_terms'
  ) as string | null | undefined;
  const defaultDays = toDays(clientTerms ?? company?.settings?.payment_terms);
  const options = PRESET_DAYS.includes(defaultDays)
    ? PRESET_DAYS
    : [...PRESET_DAYS, defaultDays].sort((a, b) => a - b);

  const [term, setTerm] = useState<Term | null>(() =>
    termFromDates(invoice?.date, invoice?.due_date, options)
  );
  const [showDate, setShowDate] = useState(false);
  const [defaultSaved, setDefaultSaved] = useState(false);
  const [savingDefault, setSavingDefault] = useState(false);

  const defaulted = useRef(false);

  useEffect(() => {
    if (defaulted.current || clientTerms === undefined) {
      return;
    }

    defaulted.current = true;

    if (wizard.invoiceId || invoice?.due_date) {
      setTerm(termFromDates(invoice?.date, invoice?.due_date, options));

      return;
    }

    setTerm(defaultDays);
    wizard.patch({ due_date: addDays(invoiceDate, defaultDays) });
  }, [clientTerms]);

  const choose = (next: Term) => {
    setTerm(next);

    if (next !== 'custom') {
      wizard.patch({ due_date: addDays(invoiceDate, next) });
    }
  };

  const chosenDays = typeof term === 'number' ? term : null;
  const currentDefault = company?.settings?.payment_terms ?? '';
  const offerDefault =
    chosenDays !== null &&
    chosenDays !== defaultDays &&
    String(chosenDays) !== String(currentDefault);

  const saveDefault = () => {
    if (!company?.id || chosenDays === null) {
      return;
    }

    setSavingDefault(true);

    request(
      'PUT',
      endpoint('/api/v1/companies/:id', { id: company.id }),
      {
        ...company,
        settings: {
          ...company.settings,
          payment_terms: String(chosenDays),
        },
      },
      { skipIntercept: true }
    )
      .then((response) => {
        dispatch(updateRecord({ object: 'company', data: response.data.data }));
        setDefaultSaved(true);
        toast.success('updated_settings');
      })
      .catch(() => toast.error())
      .finally(() => setSavingDefault(false));
  };

  const serverErrors = wizard.errors?.errors;

  return (
    <StepTransition>
      <div
        className="space-y-2"
        role="radiogroup"
        aria-label={t('payment_terms')}
      >
        {options.map((days) => (
          <Choice
            key={days}
            selected={term === days}
            onSelect={() => choose(days)}
            title={
              days === 0
                ? t('due_on_receipt')
                : trans('count_days', { count: days })
            }
            trailing={
              days > 0
                ? dayjs(addDays(invoiceDate, days)).format('D MMM')
                : undefined
            }
          />
        ))}

        <Choice
          selected={term === 'custom'}
          onSelect={() => choose('custom')}
          title={t('custom')}
        />
      </div>

      {term === 'custom' || serverErrors?.due_date ? (
        <div className="mt-4">
          <InputField
            id="iw-due-date"
            label={t('due_date')}
            type="date"
            value={invoice?.due_date || ''}
            min={invoiceDate}
            changeOverride
            debounceTimeout={0}
            errorMessage={serverErrors?.due_date}
            onValueChange={(value) => wizard.patch({ due_date: value })}
          />
        </div>
      ) : null}

      <div className="mt-6">
        {showDate || serverErrors?.date ? (
          <div>
            <InputField
              id="iw-invoice-date"
              label={t('invoice_date')}
              type="date"
              value={invoiceDate}
              changeOverride
              debounceTimeout={0}
              errorMessage={serverErrors?.date}
              onValueChange={(nextDate) => {
                const dueDate = invoice?.due_date ?? '';

                wizard.patch({
                  date: nextDate,
                  ...(typeof term === 'number'
                    ? { due_date: addDays(nextDate, term) }
                    : dueDate && dueDate < nextDate
                      ? { due_date: nextDate }
                      : {}),
                });
              }}
            />
          </div>
        ) : (
          <p className="text-sm" style={{ color: colors.$17 }}>
            {`${t('invoice_date')}: ${dayjs(invoiceDate).format('D MMMM YYYY')}`}{' '}
            <button
              type="button"
              onClick={() => setShowDate(true)}
              style={{ color: accentColor, fontWeight: 500 }}
            >
              {t('change')}
            </button>
          </p>
        )}
      </div>

      {!embedded &&
      offerDefault &&
      !defaultSaved &&
      !wizard.dismissed('terms') ? (
        <div className="mt-6">
          <Callout
            title={trans('use_for_future_invoices', {
              value:
                chosenDays === 0
                  ? t('due_on_receipt')
                  : trans('count_days', { count: chosenDays }),
            })}
            onDismiss={() => wizard.dismiss('terms')}
            dismissLabel={t('no_not_now')}
          >
            <Button
              type="secondary"
              behavior="button"
              disabled={savingDefault}
              onClick={saveDefault}
            >
              {t('save_as_default')}
            </Button>
          </Callout>
        </div>
      ) : null}

      {defaultSaved ? (
        <p className="text-xs mt-6" style={{ color: colors.$17 }}>
          {t('new_invoices_use_this_by_default')}
        </p>
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
          <Button
            behavior="button"
            disabled={!invoice?.due_date}
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
