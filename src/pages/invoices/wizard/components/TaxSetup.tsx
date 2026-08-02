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
import { useDispatch } from 'react-redux';
import {
  Action,
  Choice,
  Hint,
  Legend,
  Sheet,
  TextField,
  useTheme,
} from '../kit';

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
    <Sheet open={open} onClose={onClose} title="Charge tax on this invoice">
      <div className="space-y-5">
        <TextField
          label="What is it called?"
          placeholder="GST, VAT, Sales tax…"
          value={name}
          autoFocus
          onChange={(event) => setName(event.target.value)}
        />

        <TextField
          label="What percentage is it?"
          placeholder="20"
          inputMode="decimal"
          value={rate}
          suffix="%"
          onChange={(event) => setRate(event.target.value)}
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

          {inclusive === null ? (
            <Hint>
              Most people add tax on top. Pick whichever matches your prices.
            </Hint>
          ) : null}
        </div>

        {error ? (
          <p className="text-xs" style={{ color: '#DC2626' }}>
            {error}
          </p>
        ) : null}

        <div className="flex items-center gap-2 pt-1">
          <Action
            tone="solid"
            busy={busy}
            disabled={inclusive === null}
            onClick={apply}
          >
            Apply tax
          </Action>

          <Action tone="quiet" onClick={onClose}>
            Cancel
          </Action>
        </div>

        <p className="text-xs" style={{ color: t.muted }}>
          We'll remember this for your next invoice.
        </p>
      </div>
    </Sheet>
  );
}
