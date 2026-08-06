/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { updateRecord } from '$app/common/stores/slices/company-users';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Button, InputField } from '$app/components/forms';
import { Callout, Choice, ErrorBanner, Footer, useTheme } from '../kit';
import { Wizard, addDays, today } from '../useWizard';

type Term = 'receipt' | '7' | '14' | '30' | 'custom';

const TERMS: { key: Term; label: string; days: number | null }[] = [
  { key: 'receipt', label: 'Due on receipt', days: 0 },
  { key: '7', label: 'In 7 days', days: 7 },
  { key: '14', label: 'In 14 days', days: 14 },
  { key: '30', label: 'In 30 days', days: 30 },
  { key: 'custom', label: 'Choose a date', days: null },
];

interface Props {
  wizard: Wizard;
  embedded?: boolean;
}

function termFromDates(
  date: string | undefined,
  dueDate: string | undefined
): Term | null {
  if (!dueDate) {
    return null;
  }

  const days = dayjs(dueDate).diff(dayjs(date || today()), 'day');
  const match = TERMS.find(
    (option) => option.days !== null && option.days === days
  );

  return match ? match.key : 'custom';
}

export function StepTiming({ wizard, embedded }: Props) {
  const [translate] = useTranslation();
  const t = useTheme();
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

  function choose(next: Term) {
    setTerm(next);

    const entry = TERMS.find((option) => option.key === next);

    if (entry?.days !== null && entry?.days !== undefined) {
      wizard.patch({ due_date: addDays(invoiceDate, entry.days) });
    }
  }

  const chosen = TERMS.find((option) => option.key === term);
  const currentDefault = company?.settings?.payment_terms ?? '';
  const offerDefault =
    chosen &&
    chosen.days !== null &&
    String(chosen.days) !== String(currentDefault);

  async function saveDefault() {
    if (!company?.id || chosen?.days === null || chosen?.days === undefined) {
      return;
    }

    setSavingDefault(true);

    try {
      const response = await request(
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
      );

      dispatch(updateRecord({ object: 'company', data: response.data.data }));
      setDefaultSaved(true);
      toast.success('updated_settings');
    } catch {
      toast.error();
    } finally {
      setSavingDefault(false);
    }
  }

  const serverErrors = wizard.errors?.errors;

  return (
    <div className="iw-enter">
      {embedded ? null : <ErrorBanner errors={wizard.errors} />}

      <div className="space-y-2" role="radiogroup" aria-label="Payment timing">
        {TERMS.map((option) => (
          <Choice
            key={option.key}
            selected={term === option.key}
            onSelect={() => choose(option.key)}
            title={option.label}
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
            label={translate('due_date')}
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
              label={translate('date')}
              type="date"
              value={invoiceDate}
              changeOverride
              debounceTimeout={0}
              errorMessage={serverErrors?.date}
              onValueChange={(nextDate) => {
                const entry = TERMS.find((option) => option.key === term);

                wizard.patch({
                  date: nextDate,
                  ...(entry?.days !== null && entry?.days !== undefined
                    ? { due_date: addDays(nextDate, entry.days) }
                    : {}),
                });
              }}
            />
          </div>
        ) : (
          <p className="text-sm" style={{ color: t.muted }}>
            Dated {dayjs(invoiceDate).format('D MMMM YYYY')}.{' '}
            <button
              type="button"
              onClick={() => setShowDate(true)}
              style={{ color: t.accent, fontWeight: 500 }}
            >
              Change
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
            title={`Use ${chosen.days === 0 ? 'due on receipt' : `${chosen.days} days`} for future invoices?`}
            onDismiss={() => wizard.dismiss('terms')}
            dismissLabel="Not now"
          >
            <Button
              type="secondary"
              behavior="button"
              disabled={savingDefault}
              onClick={saveDefault}
            >
              Yes, make it my default
            </Button>
          </Callout>
        </div>
      ) : null}

      {defaultSaved ? (
        <p className="text-xs mt-6" style={{ color: t.muted }}>
          New invoices will use this by default.
        </p>
      ) : null}

      {embedded ? null : (
        <Footer
          back={
            <Button
              type="secondary"
              behavior="button"
              disableWithoutIcon
              onClick={wizard.back}
            >
              {translate('back')}
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
            Review and send
          </Button>
        </Footer>
      )}
    </div>
  );
}
