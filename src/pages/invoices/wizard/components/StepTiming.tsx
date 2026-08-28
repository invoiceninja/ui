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
import { updateRecord } from '$app/common/stores/slices/company-users';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Button, InputField } from '$app/components/forms';
import { Callout } from './Callout';
import { Choice } from './Choice';
import { ErrorBanner } from './ErrorBanner';
import { StepFooter } from './StepFooter';
import { StepTransition } from './StepTransition';
import { Wizard, addDays, today } from '../useWizard';

type Term = 'receipt' | '7' | '14' | '30' | 'custom';

const TERMS: { key: Term; days: number | null }[] = [
  { key: 'receipt', days: 0 },
  { key: '7', days: 7 },
  { key: '14', days: 14 },
  { key: '30', days: 30 },
  { key: 'custom', days: null },
];

interface Props {
  wizard: Wizard;
  embedded?: boolean;
}

const termFromDates = (
  date: string | undefined,
  dueDate: string | undefined
): Term | null => {
  if (!dueDate) {
    return null;
  }

  const days = dayjs(dueDate).diff(dayjs(date || today()), 'day');
  const match = TERMS.find(
    (option) => option.days !== null && option.days === days
  );

  return match ? match.key : 'custom';
};

export function StepTiming({ wizard, embedded }: Props) {
  const accentColor = useAccentColor();
  const colors = useColorScheme();
  const [t] = useTranslation();
  const company = useCurrentCompany();
  const dispatch = useDispatch();

  const invoice = wizard.invoice;
  const invoiceDate = invoice?.date || today();

  const [term, setTerm] = useState<Term | null>(() =>
    termFromDates(invoice?.date, invoice?.due_date)
  );
  const [showDate, setShowDate] = useState(false);
  const [defaultSaved, setDefaultSaved] = useState(false);
  const [savingDefault, setSavingDefault] = useState(false);

  const choose = (next: Term) => {
    setTerm(next);

    const entry = TERMS.find((option) => option.key === next);

    if (entry?.days !== null && entry?.days !== undefined) {
      wizard.patch({ due_date: addDays(invoiceDate, entry.days) });
    }
  };

  const chosen = TERMS.find((option) => option.key === term);
  const currentDefault = company?.settings?.payment_terms ?? '';
  const offerDefault =
    chosen &&
    chosen.days !== null &&
    String(chosen.days) !== String(currentDefault);

  const saveDefault = () => {
    if (!company?.id || chosen?.days === null || chosen?.days === undefined) {
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
          payment_terms: String(chosen.days),
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
      {embedded ? null : <ErrorBanner errors={wizard.errors} />}

      <div
        className="space-y-2"
        role="radiogroup"
        aria-label={t('payment_timing')}
      >
        {TERMS.map((option) => (
          <Choice
            key={option.key}
            selected={term === option.key}
            onSelect={() => choose(option.key)}
            title={
              option.days === null
                ? t('custom')
                : option.days === 0
                  ? t('due_on_receipt')
                  : trans('count_days', { count: option.days })
            }
            trailing={
              option.days !== null && option.days > 0
                ? dayjs(addDays(invoiceDate, option.days)).format('D MMM')
                : undefined
            }
          />
        ))}
      </div>

      {term === 'custom' ? (
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
        {showDate ? (
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
                const entry = TERMS.find((option) => option.key === term);
                const dueDate = invoice?.due_date ?? '';

                wizard.patch({
                  date: nextDate,
                  ...(entry?.days !== null && entry?.days !== undefined
                    ? { due_date: addDays(nextDate, entry.days) }
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
                chosen.days === 0
                  ? t('due_on_receipt')
                  : trans('count_days', { count: chosen.days }),
            })}
            onDismiss={() => wizard.dismiss('terms')}
            dismissLabel={t('not_now')}
          >
            <Button
              type="secondary"
              behavior="button"
              disabled={savingDefault}
              onClick={saveDefault}
            >
              {t('yes_make_it_my_default')}
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
            onClick={() => {
              void wizard.flush();
              wizard.next();
            }}
          >
            {t('continue')}
          </Button>
        </StepFooter>
      )}
    </StepTransition>
  );
}
