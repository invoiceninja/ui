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
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { AxiosError } from 'axios';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { updateRecord } from '$app/common/stores/slices/company-users';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Modal } from '$app/components/Modal';
import { Button, InputField } from '$app/components/forms';
import { Choice, Legend, useTheme } from '../kit';

export interface AppliedTax {
  name: string;
  rate: number;
  inclusive?: boolean;
}

interface Props {
  open: boolean;
  scope: 'invoice' | 'item';
  onClose: () => void;
  onApplied: (tax: AppliedTax) => void;
}

export function TaxSetup({ open, scope, onClose, onApplied }: Props) {
  const [translate] = useTranslation();
  const t = useTheme();
  const company = useCurrentCompany();
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [inclusive, setInclusive] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [nameError, setNameError] = useState<string>();
  const [rateError, setRateError] = useState<string>();

  useEffect(() => {
    if (open) {
      setName('');
      setRate('');
      setInclusive(null);
      setError(undefined);
      setNameError(undefined);
      setRateError(undefined);
    }
  }, [open]);

  const parsedRate = Number(rate.replace(',', '.'));
  const rateIsValid =
    rate.trim() !== '' && !isNaN(parsedRate) && parsedRate >= 0;

  const invoiceScope = scope === 'invoice';

  const enableTaxesForCompany = () => {
    if (!invoiceScope || !company?.id) {
      return Promise.resolve();
    }

    const payload = {
      ...company,
      enabled_item_tax_rates: Math.max(1, company.enabled_item_tax_rates ?? 0),
      settings: {
        ...company.settings,
        inclusive_taxes: Boolean(inclusive),
      },
    };

    return request(
      'PUT',
      endpoint('/api/v1/companies/:id', { id: company.id }),
      payload,
      { skipIntercept: true }
    ).then((response) =>
      dispatch(updateRecord({ object: 'company', data: response.data.data }))
    );
  };

  const apply = () => {
    setError(undefined);
    setNameError(undefined);
    setRateError(undefined);

    if (!name.trim()) {
      setNameError('Enter a name for the tax.');
      return;
    }

    if (!rateIsValid) {
      setRateError('Enter the percentage as a number, for example 20.');
      return;
    }

    setBusy(true);

    request(
      'POST',
      endpoint('/api/v1/tax_rates'),
      { name: name.trim(), rate: parsedRate },
      { skipIntercept: true }
    )
      .then(() => {
        $refetch(['tax_rates']);

        return enableTaxesForCompany()
          .then(() => {
            onApplied({
              name: name.trim(),
              rate: parsedRate,
              ...(invoiceScope ? { inclusive: Boolean(inclusive) } : {}),
            });

            toast.success(
              invoiceScope ? 'updated_settings' : 'created_tax_rate'
            );
            onClose();
          })
          .catch(() =>
            setError(
              'The tax rate was saved, but taxes could not be switched on for your company. Try again.'
            )
          );
      })
      .catch((caught: AxiosError<ValidationBag>) => {
        const bag = caught.response?.data?.errors;

        if (!bag) {
          setError(
            'The tax rate could not be saved. Check the details and try again.'
          );

          return;
        }

        Object.entries(bag).forEach(([key, messages]) => {
          if (key === 'name') {
            setNameError(messages[0]);
          } else if (key === 'rate') {
            setRateError(messages[0]);
          } else {
            setError(messages[0]);
          }
        });
      })
      .finally(() => setBusy(false));
  };

  return (
    <Modal
      visible={open}
      onClose={onClose}
      title={invoiceScope ? 'Charge tax on this invoice' : 'Add a tax'}
      size="small"
    >
      <div className="space-y-5">
        <InputField
          id="iw-tax-name"
          label="What is it called?"
          placeholder="GST, VAT, Sales tax"
          value={name}
          changeOverride
          debounceTimeout={0}
          onValueChange={setName}
          errorMessage={nameError}
        />

        <InputField
          id="iw-tax-rate"
          label="What percentage is it?"
          placeholder="20"
          value={rate}
          changeOverride
          debounceTimeout={0}
          onValueChange={setRate}
          errorMessage={rateError}
        />

        {invoiceScope ? (
          <div>
            <Legend>Is tax already included in your prices?</Legend>

            <div className="space-y-2" role="radiogroup">
              <Choice
                selected={inclusive === false}
                onSelect={() => setInclusive(false)}
                title="No, add it on top"
                detail="A 100 item becomes 120 with 20% tax."
              />
              <Choice
                selected={inclusive === true}
                onSelect={() => setInclusive(true)}
                title="Yes, my prices already include it"
                detail="A 100 item stays 100, and the tax is included in that."
              />
            </div>

            <p className="text-xs mt-2" style={{ color: t.muted }}>
              This applies to the whole invoice and becomes the default for new
              ones.
            </p>
          </div>
        ) : null}

        {error ? (
          <p className="text-xs" style={{ color: '#DC2626' }}>
            {error}
          </p>
        ) : null}

        <div className="flex items-center gap-2 pt-1">
          <Button
            behavior="button"
            disabled={busy || (invoiceScope && inclusive === null)}
            disableWithoutIcon={!busy}
            onClick={apply}
          >
            Apply tax
          </Button>

          <Button type="secondary" behavior="button" onClick={onClose}>
            {translate('cancel')}
          </Button>
        </div>

        <p className="text-xs" style={{ color: t.muted }}>
          This tax is saved for future invoices.
        </p>
      </div>
    </Modal>
  );
}
