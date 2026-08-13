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
import { useColorScheme } from '$app/common/colors';
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
import { Choice } from '$app/components/Choice';
import { Legend } from '$app/components/Legend';

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
  const colors = useColorScheme();
  const [t] = useTranslation();
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
      setNameError(t('enter_tax_name'));
      return;
    }

    if (!rateIsValid) {
      setRateError(t('enter_tax_percentage'));
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
          .catch(() => setError(t('taxes_could_not_be_enabled')));
      })
      .catch((caught: AxiosError<ValidationBag>) => {
        const bag = caught.response?.data?.errors;

        if (!bag) {
          setError(t('tax_rate_not_saved'));

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
      title={invoiceScope ? t('charge_tax_on_this_invoice') : t('add_a_tax')}
      size="small"
    >
      <div className="space-y-5">
        <InputField
          id="iw-tax-name"
          label={t('what_is_it_called')}
          placeholder={t('tax_name_examples')}
          value={name}
          changeOverride
          debounceTimeout={0}
          onValueChange={setName}
          errorMessage={nameError}
        />

        <InputField
          id="iw-tax-rate"
          label={t('what_percentage_is_it')}
          placeholder="20"
          value={rate}
          changeOverride
          debounceTimeout={0}
          onValueChange={setRate}
          errorMessage={rateError}
        />

        {invoiceScope ? (
          <div>
            <Legend>{t('is_tax_included_in_prices')}</Legend>

            <div className="space-y-2" role="radiogroup">
              <Choice
                selected={inclusive === false}
                onSelect={() => setInclusive(false)}
                title={t('no_add_tax_on_top')}
                detail={t('no_add_tax_on_top_help')}
              />
              <Choice
                selected={inclusive === true}
                onSelect={() => setInclusive(true)}
                title={t('yes_prices_include_tax')}
                detail={t('yes_prices_include_tax_help')}
              />
            </div>

            <p className="text-xs mt-2" style={{ color: colors.$17 }}>
              {t('tax_applies_to_whole_invoice')}
            </p>
          </div>
        ) : null}

        {error ? <p className="text-xs text-red-600">{error}</p> : null}

        <div className="flex items-center gap-2 pt-1">
          <Button
            behavior="button"
            disabled={busy || (invoiceScope && inclusive === null)}
            disableWithoutIcon={!busy}
            onClick={apply}
          >
            {`${t('apply')} ${t('tax')}`}
          </Button>

          <Button type="secondary" behavior="button" onClick={onClose}>
            {t('cancel')}
          </Button>
        </div>

        <p className="text-xs" style={{ color: colors.$17 }}>
          {t('tax_saved_for_future_invoices')}
        </p>
      </div>
    </Modal>
  );
}
