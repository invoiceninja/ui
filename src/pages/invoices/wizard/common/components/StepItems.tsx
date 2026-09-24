/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { blankLineItem } from '$app/common/constants/blank-line-item';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useColorScheme } from '$app/common/colors';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { updateRecord } from '$app/common/stores/slices/company-users';
import { InvoiceItem } from '$app/common/interfaces/invoice-item';
import { TaxRate } from '$app/common/interfaces/tax-rate';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Button, InputField, InputLabel } from '$app/components/forms';
import { NumberInputField } from '$app/components/forms/NumberInputField';
import { HiddenResourceTaxesAlert } from '$app/components/HiddenResourceTaxesAlert';
import { Callout } from './Callout';
import { ClientContactModal } from './ClientContactModal';
import { StepFooter } from './StepFooter';
import { StepTransition } from './StepTransition';
import { Wizard } from '../hooks/useWizard';
import { TAX_FIELDS, TaxSlot, visibleTaxSlots } from '../helpers/tax-slots';
import { toNumber } from '../helpers/to-number';
import { contactEmail, emailableContact } from '../helpers/client-contact';
import { MoneyRow } from './MoneyRow';
import { RemoveItemButton } from './RemoveItemButton';
import { TaxChip } from './TaxChip';
import { AppliedTax, TaxSetup } from './TaxSetup';
import { WorkPicker, WorkSource } from './WorkPicker';

interface Props {
  wizard: Wizard;
  embedded?: boolean;
}

type TaxTarget =
  | { scope: 'invoice' }
  | { scope: 'item'; index: number; slot: TaxSlot };

export function StepItems({ wizard, embedded }: Props) {
  const reactSettings = useReactSettings();
  const precision =
    reactSettings?.number_precision &&
    reactSettings.number_precision > 0 &&
    reactSettings.number_precision <= 100
      ? reactSettings.number_precision
      : 2;
  const accentColor = useAccentColor();
  const colors = useColorScheme();
  const formatMoney = useFormatMoney();
  const [t] = useTranslation();
  const company = useCurrentCompany();
  const dispatch = useDispatch();

  const items = wizard.invoice?.line_items ?? [];

  const [picker, setPicker] = useState<WorkSource | null>(null);
  const [taxSetup, setTaxSetup] = useState<TaxTarget | null>(null);
  const [taxOpen, setTaxOpen] = useState(false);
  const [rates, setRates] = useState<TaxRate[]>([]);
  const [inclusiveAnswered, setInclusiveAnswered] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const enabledTaxSlots = company?.enabled_item_tax_rates ?? 0;
  const taxSlotCount = Math.max(1, enabledTaxSlots);
  const taxesConfigured =
    enabledTaxSlots > 0 || (company?.enabled_tax_rates ?? 0) > 0;

  useEffect(() => {
    request(
      'GET',
      endpoint('/api/v1/tax_rates?status=active&per_page=50'),
      {},
      { skipIntercept: true }
    )
      .then((response) => setRates(response.data.data ?? []))
      .catch(() => setRates([]));
  }, []);

  const update = (index: number, changes: Partial<InvoiceItem>) => {
    wizard.setLineItems(
      items.map((item, position) =>
        position === index ? { ...item, ...changes } : item
      )
    );
  };

  const addRow = (item?: InvoiceItem) => {
    wizard.setLineItems([
      ...items,
      item ?? { ...blankLineItem(), quantity: 1 },
    ]);
  };

  const removeRow = (index: number) => {
    wizard.setLineItems(items.filter((_, position) => position !== index));
  };

  const applyTax = (tax: AppliedTax) => {
    setRates((current) =>
      current.some((entry) => entry.name === tax.name)
        ? current
        : [...current, { name: tax.name, rate: tax.rate } as TaxRate]
    );

    const applied =
      typeof tax.inclusive === 'boolean'
        ? { uses_inclusive_taxes: tax.inclusive }
        : {};

    if (typeof tax.inclusive === 'boolean') {
      setInclusiveAnswered(true);
    }

    if (taxSetup?.scope === 'item') {
      const { index, slot } = taxSetup;
      const field = TAX_FIELDS[slot];

      wizard.patch({
        ...applied,
        line_items: items.map((item, position) =>
          position === index
            ? { ...item, [field.name]: tax.name, [field.rate]: tax.rate }
            : item
        ),
      });

      return;
    }

    wizard.patch({
      ...applied,
      line_items: items.map((item) => ({
        ...item,
        tax_name1: tax.name,
        tax_rate1: tax.rate,
      })),
    });
  };

  const ensureTaxSlot = () => {
    if (!company?.id || enabledTaxSlots > 0) {
      return;
    }

    request(
      'PUT',
      endpoint('/api/v1/companies/:id', { id: company.id }),
      { ...company, enabled_item_tax_rates: 1 },
      { skipIntercept: true }
    )
      .then((response) =>
        dispatch(updateRecord({ object: 'company', data: response.data.data }))
      )
      .catch(() => toast.error());
  };

  const clientName = wizard.client?.display_name || wizard.client?.name || '';
  const recipientEmail = contactEmail(emailableContact(wizard.client));
  const totals = wizard.totals;
  const inclusive = Boolean(wizard.invoice?.uses_inclusive_taxes);

  return (
    <StepTransition>
      {embedded || !clientName ? null : (
        <div
          className="pb-5 mb-5 flex items-start justify-between gap-4"
          style={{ borderBottom: `1px dashed ${colors.$5}` }}
        >
          <div className="min-w-0">
            <p
              className="text-xs mb-1"
              style={{ color: colors.$22, fontWeight: 500 }}
            >
              {t('to')}
            </p>

            <p
              className="text-sm truncate"
              style={{ color: colors.$3, fontWeight: 500 }}
            >
              {clientName}
            </p>

            <div className="mt-0.5 flex flex-wrap items-center gap-4">
              <span className="text-xs" style={{ color: colors.$17 }}>
                {recipientEmail || t('client_email_not_set')}
              </span>

              {recipientEmail ? null : (
                <Button
                  type="minimal"
                  behavior="button"
                  onClick={() => setContactOpen(true)}
                >
                  {t('contact_details')}
                </Button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={wizard.detachClient}
            className="shrink-0 text-sm"
            style={{ color: accentColor, fontWeight: 500 }}
          >
            {t('change')}
          </button>
        </div>
      )}

      {wizard.invoice ? (
        <HiddenResourceTaxesAlert className="mb-4" resource={wizard.invoice} />
      ) : null}

      <div className="space-y-5">
        {items.map((item, index) => {
          const key = item._id ?? String(index);

          return (
            <div
              key={key}
              className="relative border p-4"
              style={{
                borderColor: colors.$24,
                borderRadius: '0.375rem',
                backgroundColor: reactSettings?.dark_mode
                  ? colors.$25
                  : colors.$2,
              }}
            >
              {items.length > 1 ? (
                <RemoveItemButton onClick={() => removeRow(index)} />
              ) : null}

              <InputField
                id={`iw-desc-${key}`}
                width="100%"
                label={t('description')}
                placeholder={t('item_description')}
                value={item.notes}
                changeOverride
                debounceTimeout={0}
                onValueChange={(value) => update(index, { notes: value })}
                errorMessage={
                  wizard.errors?.errors[`line_items.${index}.notes`]
                }
              />

              <div className="mt-3 flex items-end gap-3">
                <div className="flex-1 min-w-0">
                  <NumberInputField
                    id={`iw-qty-${key}`}
                    width="100%"
                    precision={6}
                    changeOverride
                    label={t('quantity')}
                    value={item.quantity ?? 0}
                    onValueChange={(value) =>
                      update(index, { quantity: toNumber(value) })
                    }
                    errorMessage={
                      wizard.errors?.errors[`line_items.${index}.quantity`]
                    }
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <NumberInputField
                    id={`iw-price-${key}`}
                    width="100%"
                    precision={precision}
                    changeOverride
                    label={t('price')}
                    value={item.cost ?? 0}
                    onValueChange={(value) =>
                      update(index, { cost: toNumber(value) })
                    }
                    errorMessage={
                      wizard.errors?.errors[`line_items.${index}.cost`]
                    }
                  />
                </div>

                <div className="shrink-0 text-right">
                  <InputLabel className="mb-1">{t('total')}</InputLabel>

                  <div
                    className="text-sm whitespace-nowrap py-2"
                    style={{
                      color: colors.$3,
                      fontWeight: 500,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {formatMoney(
                      (item.cost ?? 0) * (item.quantity ?? 0),
                      wizard.client?.country_id,
                      wizard.client?.settings?.currency_id,
                      2
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {visibleTaxSlots(item, taxSlotCount).map((slot) => (
                  <TaxChip
                    key={slot}
                    item={item}
                    slot={slot}
                    rates={rates}
                    onChange={(changes) => {
                      update(index, changes);

                      if (changes[TAX_FIELDS[slot].name]) {
                        ensureTaxSlot();
                      }
                    }}
                    onCreate={() => {
                      setTaxSetup({ scope: 'item', index, slot });
                      setTaxOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Button type="secondary" behavior="button" onClick={() => addRow()}>
          {t('add_item')}
        </Button>

        <button
          type="button"
          onClick={() => setPicker('saved')}
          className="text-sm"
          style={{ color: accentColor, fontWeight: 500 }}
        >
          {t('products')}
        </button>

        <button
          type="button"
          onClick={() => setPicker('work')}
          className="text-sm"
          style={{ color: accentColor, fontWeight: 500 }}
        >
          {t('add_from_existing_work', { defaultValue: 'Add From Tasks' })}
        </button>
      </div>

      <div
        className="mt-6 pt-6 space-y-2"
        style={{ borderTop: `1px dashed ${colors.$5}` }}
      >
        <MoneyRow
          label={t('subtotal')}
          value={formatMoney(
            totals.subtotal,
            wizard.client?.country_id,
            wizard.client?.settings?.currency_id,
            2
          )}
        />

        {totals.discount ? (
          <MoneyRow
            label={t('discount')}
            value={formatMoney(
              totals.discount,
              wizard.client?.country_id,
              wizard.client?.settings?.currency_id,
              2
            )}
          />
        ) : null}

        {totals.surchargeRows.map((row, index) => (
          <MoneyRow
            key={`surcharge-${index}`}
            label={row.name || t('surcharge')}
            value={formatMoney(
              row.total,
              wizard.client?.country_id,
              wizard.client?.settings?.currency_id,
              2
            )}
          />
        ))}

        {totals.taxRows.map((row, index) => (
          <MoneyRow
            key={`${row.name}-${index}`}
            label={inclusive ? `${t('includes')} ${row.name}` : row.name}
            value={formatMoney(
              row.total,
              wizard.client?.country_id,
              wizard.client?.settings?.currency_id,
              2
            )}
          />
        ))}

        <MoneyRow
          label={t('total')}
          value={formatMoney(
            totals.total,
            wizard.client?.country_id,
            wizard.client?.settings?.currency_id,
            2
          )}
          strong
        />
      </div>

      {!taxesConfigured && !wizard.dismissed('tax') ? (
        <div className="mt-6">
          <Callout title={t('do_you_need_to_charge_tax')}>
            <div className="flex items-center gap-2">
              <Button
                type="secondary"
                behavior="button"
                onClick={() => {
                  setTaxSetup({ scope: 'invoice' });
                  setTaxOpen(true);
                }}
              >
                {`${t('yes')}, ${t('add_tax').toLowerCase()}`}
              </Button>
              <Button
                type="secondary"
                behavior="button"
                onClick={() => wizard.dismiss('tax')}
              >
                {t('no')}
              </Button>
            </div>
          </Callout>
        </div>
      ) : null}

      {embedded ? null : (
        <>
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
            <Button behavior="button" onClick={wizard.next}>
              {t('continue')}
            </Button>
          </StepFooter>
        </>
      )}

      <WorkPicker
        open={picker !== null}
        source={picker ?? 'saved'}
        clientId={wizard.invoice?.client_id ?? ''}
        onClose={() => setPicker(null)}
        onPick={(item) => {
          const blankIndex = items.findIndex(
            (existing) =>
              !existing.notes && !existing.product_key && !existing.cost
          );

          if (item.tax_name1 || item.tax_name2 || item.tax_name3) {
            ensureTaxSlot();
          }

          if (blankIndex >= 0) {
            wizard.setLineItems(
              items.map((existing, position) =>
                position === blankIndex ? item : existing
              )
            );
          } else {
            addRow(item);
          }
        }}
      />

      <TaxSetup
        open={taxOpen}
        scope={taxSetup?.scope ?? 'item'}
        askInclusive={rates.length === 0 && !inclusiveAnswered}
        onClose={() => setTaxOpen(false)}
        onApplied={applyTax}
      />

      <ClientContactModal
        open={contactOpen}
        client={wizard.client}
        onClose={() => setContactOpen(false)}
        onSaved={(saved) => wizard.attachClient(saved)}
      />
    </StepTransition>
  );
}
