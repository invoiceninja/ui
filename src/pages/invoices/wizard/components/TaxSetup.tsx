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
  inclusive: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onApplied: (tax: AppliedTax) => void;
}

export function TaxSetup({ open, onClose, onApplied }: Props) {
  const [translate] = useTranslation();
  const t = useTheme();
  const company = useCurrentCompany();
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [inclusive, setInclusive] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (open) {
      setName('');
      setRate('');
      setInclusive(null);
      setError(undefined);
    }
  }, [open]);

  const parsedRate = Number(rate.replace(',', '.'));
  const rateIsValid =
    rate.trim() !== '' && !isNaN(parsedRate) && parsedRate >= 0;

  async function apply() {
    setError(undefined);

    if (!name.trim()) {
      setError('Give the tax a name so it reads correctly on the invoice.');
      return;
    }

    if (!rateIsValid) {
      setError('Enter the percentage as a number, for example 20.');
      return;
    }

    setBusy(true);

    try {
      await request(
        'POST',
        endpoint('/api/v1/tax_rates'),
        { name: name.trim(), rate: parsedRate },
        { skipIntercept: true }
      );

      $refetch(['tax_rates']);
    } catch {
      setError(
        "We couldn't save the tax rate. Check the details and try again."
      );
      setBusy(false);

      return;
    }

    try {
      if (company?.id) {
        const payload = {
          ...company,
          enabled_item_tax_rates: Math.max(
            1,
            company.enabled_item_tax_rates ?? 0
          ),
          settings: {
            ...company.settings,
            inclusive_taxes: Boolean(inclusive),
          },
        };

        const response = await request(
          'PUT',
          endpoint('/api/v1/companies/:id', { id: company.id }),
          payload,
          { skipIntercept: true }
        );

        dispatch(updateRecord({ object: 'company', data: response.data.data }));
      }

      onApplied({
        name: name.trim(),
        rate: parsedRate,
        inclusive: Boolean(inclusive),
      });

      toast.success('updated_settings');
      onClose();
    } catch {
      onApplied({
        name: name.trim(),
        rate: parsedRate,
        inclusive: Boolean(inclusive),
      });

      toast.error();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      visible={open}
      onClose={onClose}
      title="Charge tax on this invoice"
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
        />

        <InputField
          id="iw-tax-rate"
          label="What percentage is it?"
          placeholder="20"
          value={rate}
          changeOverride
          debounceTimeout={0}
          onValueChange={setRate}
        />

        <div>
          <Legend>Is tax already included in your prices?</Legend>

          <div className="space-y-2" role="radiogroup">
            <Choice
              selected={inclusive === false}
              onSelect={() => setInclusive(false)}
              title="No — add it on top"
              detail="A 100 item becomes 120 with 20% tax."
            />
            <Choice
              selected={inclusive === true}
              onSelect={() => setInclusive(true)}
              title="Yes — my prices already include it"
              detail="A 100 item stays 100, with the tax worked out from inside."
            />
          </div>
        </div>

        {error ? (
          <p className="text-xs" style={{ color: '#DC2626' }}>
            {error}
          </p>
        ) : null}

        <div className="flex items-center gap-2 pt-1">
          <Button
            behavior="button"
            disabled={busy || inclusive === null}
            onClick={apply}
          >
            Apply tax
          </Button>

          <Button type="secondary" behavior="button" onClick={onClose}>
            {translate('cancel')}
          </Button>
        </div>

        <p className="text-xs" style={{ color: t.muted }}>
          Saved for future invoices.
        </p>
      </div>
    </Modal>
  );
}
