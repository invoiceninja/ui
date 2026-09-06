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
import { formatTaxName } from '$app/common/helpers/invoices/round';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { updateRecord } from '$app/common/stores/slices/company-users';
import { InvoiceItem } from '$app/common/interfaces/invoice-item';
import { TaxRate } from '$app/common/interfaces/tax-rate';
import { Plus } from '$app/components/icons/Plus';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Button, InputField, InputLabel } from '$app/components/forms';
import { HiddenResourceTaxesAlert } from '$app/components/HiddenResourceTaxesAlert';
import { Callout } from './Callout';
import { ErrorBanner } from './ErrorBanner';
import { StepFooter } from './StepFooter';
import { StepTransition } from './StepTransition';
import { Wizard } from '../useWizard';
import { AppliedTax, TaxSetup } from './TaxSetup';
import { WorkPicker, WorkSource } from './WorkPicker';

interface Props {
  wizard: Wizard;
  embedded?: boolean;
}

type TaxTarget =
  | { scope: 'invoice' }
  | { scope: 'item'; index: number; slot: TaxSlot };

const TAX_SLOTS = [1, 2, 3] as const;

type TaxSlot = (typeof TAX_SLOTS)[number];

const TAX_FIELDS: Record<
  TaxSlot,
  {
    name: 'tax_name1' | 'tax_name2' | 'tax_name3';
    rate: 'tax_rate1' | 'tax_rate2' | 'tax_rate3';
  }
> = {
  1: { name: 'tax_name1', rate: 'tax_rate1' },
  2: { name: 'tax_name2', rate: 'tax_rate2' },
  3: { name: 'tax_name3', rate: 'tax_rate3' },
};

const visibleSlots = (item: InvoiceItem, enabled: number) => {
  const applied = TAX_SLOTS.filter(
    (slot) => slot <= enabled && Boolean(item[TAX_FIELDS[slot].name])
  );

  const free = TAX_SLOTS.find(
    (slot) => slot <= enabled && !item[TAX_FIELDS[slot].name]
  );

  return free ? [...applied, free] : applied;
};

const SLOT_LABELS: Record<TaxSlot, string> = {
  1: 'one_tax_rate',
  2: 'two_tax_rates',
  3: 'three_tax_rates',
};

export function StepItems({ wizard, embedded }: Props) {
  const reactSettings = useReactSettings();
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
  const [missingDescription, setMissingDescription] = useState<string | null>(
    null
  );
  const [rates, setRates] = useState<TaxRate[]>([]);
  const [inclusiveAnswered, setInclusiveAnswered] = useState(false);
  const [enablingTaxes, setEnablingTaxes] = useState(false);

  const enabledTaxSlots = company?.enabled_item_tax_rates ?? 0;
  const taxesConfigured =
    enabledTaxSlots > 0 || (company?.enabled_tax_rates ?? 0) > 0;

  useEffect(() => {
    if (!taxesConfigured) {
      return;
    }

    request(
      'GET',
      endpoint('/api/v1/tax_rates?status=active&per_page=50'),
      {},
      { skipIntercept: true }
    )
      .then((response) => setRates(response.data.data ?? []))
      .catch(() => setRates([]));
  }, [taxesConfigured]);

  const update = (index: number, changes: Partial<InvoiceItem>) => {
    if (typeof changes.notes === 'string') {
      setMissingDescription(null);
    }

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

  const enableTaxSlots = (count: number) => {
    if (!company?.id) {
      return;
    }

    setEnablingTaxes(true);

    request(
      'PUT',
      endpoint('/api/v1/companies/:id', { id: company.id }),
      { ...company, enabled_item_tax_rates: count },
      { skipIntercept: true }
    )
      .then((response) =>
        dispatch(updateRecord({ object: 'company', data: response.data.data }))
      )
      .catch(() => toast.error())
      .finally(() => setEnablingTaxes(false));
  };

  const described = items.some((item) => item.notes || item.product_key);

  const continueForward = () => {
    if (!described) {
      const key = items[0]?._id ?? '0';

      setMissingDescription(key);
      document.getElementById(`iw-desc-${key}`)?.focus();

      return;
    }

    setMissingDescription(null);
    wizard.next();
  };
  const clientName = wizard.client?.display_name || wizard.client?.name || '';
  const contacts = wizard.client?.contacts ?? [];
  const recipientEmail =
    contacts.find((entry) => entry.send_email !== false && entry.email)
      ?.email ??
    contacts[0]?.email ??
    '';
  const totals = wizard.totals;
  const inclusive = Boolean(wizard.invoice?.uses_inclusive_taxes);

  return (
    <StepTransition>
      {embedded ? null : <ErrorBanner errors={wizard.errors} />}

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

            <p
              className="text-xs mt-0.5 truncate"
              style={{ color: colors.$17 }}
            >
              {recipientEmail || t('no_email_address')}
            </p>
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
                <RemoveButton onClick={() => removeRow(index)} />
              ) : null}

              <InputField
                id={`iw-desc-${key}`}
                width="100%"
                required
                label={t('description')}
                placeholder={t('item_description')}
                value={item.notes}
                changeOverride
                debounceTimeout={0}
                onValueChange={(value) => update(index, { notes: value })}
                errorMessage={
                  missingDescription === key
                    ? t('field_is_required')
                    : undefined
                }
              />

              <div className="mt-3 flex items-end gap-3">
                <div className="flex-1 min-w-0">
                  <InputField
                    id={`iw-qty-${key}`}
                    width="100%"
                    label={t('quantity')}
                    value={String(item.quantity ?? 0)}
                    changeOverride
                    debounceTimeout={0}
                    onValueChange={(value) =>
                      update(index, { quantity: toNumber(value) })
                    }
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <InputField
                    id={`iw-price-${key}`}
                    width="100%"
                    label={t('price')}
                    value={String(item.cost ?? 0)}
                    changeOverride
                    debounceTimeout={0}
                    onValueChange={(value) =>
                      update(index, { cost: toNumber(value) })
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
                {enabledTaxSlots === 0 ? (
                  <TaxSlotsChip
                    busy={enablingTaxes}
                    onSelect={enableTaxSlots}
                  />
                ) : (
                  visibleSlots(item, enabledTaxSlots).map((slot) => (
                    <TaxChip
                      key={slot}
                      item={item}
                      slot={slot}
                      rates={rates}
                      onChange={(changes) => update(index, changes)}
                      onCreate={() => {
                        setTaxSetup({ scope: 'item', index, slot });
                        setTaxOpen(true);
                      }}
                    />
                  ))
                )}
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
          {t('product_list', { defaultValue: 'Product List' })}
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
                {`${t('yes')}, ${t('add_a_tax').toLowerCase()}`}
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
            <Button behavior="button" onClick={continueForward}>
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
        scope={taxSetup?.scope ?? 'invoice'}
        askInclusive={rates.length === 0 && !inclusiveAnswered}
        onClose={() => setTaxOpen(false)}
        onApplied={applyTax}
      />
    </StepTransition>
  );
}

function MoneyRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string | number;
  strong?: boolean;
}) {
  const colors = useColorScheme();

  return (
    <div className="flex items-baseline justify-between gap-4">
      <span
        className="text-sm"
        style={{
          color: strong ? colors.$3 : colors.$17,
          fontWeight: strong ? 500 : 400,
        }}
      >
        {label}
      </span>

      <span
        className={strong ? 'text-lg' : 'text-sm'}
        style={{
          color: colors.$3,
          fontWeight: strong ? 600 : 400,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  );
}

const PANEL_WIDTH = 288;
const PANEL_MARGIN = 12;
const PANEL_MAX_HEIGHT = 320;
const PANEL_MIN_HEIGHT = 160;

interface Placement {
  left: number;
  top: number;
  maxHeight: number;
  above: boolean;
}

function ChipMenu({
  label,
  applied,
  disabled,
  children,
}: {
  label: ReactNode;
  applied: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  const accentColor = useAccentColor();
  const colors = useColorScheme();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [placement, setPlacement] = useState<Placement>();
  const chip = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const reposition = useCallback(() => {
    const anchor = chip.current?.getBoundingClientRect();

    if (!anchor) {
      return;
    }

    const roomBelow = window.innerHeight - anchor.bottom - PANEL_MARGIN;
    const roomAbove = anchor.top - PANEL_MARGIN;
    const above = roomBelow < PANEL_MIN_HEIGHT && roomAbove > roomBelow;

    setPlacement({
      left: Math.max(
        PANEL_MARGIN,
        Math.min(anchor.left, window.innerWidth - PANEL_MARGIN - PANEL_WIDTH)
      ),
      top: above ? anchor.top - 6 : anchor.bottom + 6,
      maxHeight: Math.max(
        PANEL_MIN_HEIGHT,
        Math.min(PANEL_MAX_HEIGHT, above ? roomAbove : roomBelow)
      ),
      above,
    });
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    reposition();

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (chip.current?.contains(target) || panel.current?.contains(target)) {
        return;
      }

      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        chip.current?.focus();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open, reposition]);

  return (
    <div className="inline-block">
      <button
        ref={chip}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 border"
        style={{
          borderRadius: '0.375rem',
          borderColor: applied ? colors.$24 : hexToRgba(accentColor, 0.35),
          color: applied ? colors.$3 : accentColor,
          backgroundColor: applied ? colors.$25 : hexToRgba(accentColor, 0.1),
          fontWeight: 500,
          opacity: disabled ? 0.6 : hovered ? 0.75 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'opacity 150ms ease',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {applied ? null : <Plus size="0.6875rem" color={accentColor} />}
        {label}
      </button>

      {open && placement
        ? createPortal(
            <div
              ref={panel}
              onClick={() => setOpen(false)}
              className="fixed flex flex-col border overflow-hidden"
              style={{
                left: placement.left,
                top: placement.top,
                width: PANEL_WIDTH,
                maxHeight: placement.maxHeight,
                transform: placement.above ? 'translateY(-100%)' : undefined,
                zIndex: 50,
                backgroundColor: colors.$1,
                borderColor: colors.$24,
                borderRadius: '0.375rem',
                boxShadow: '0 12px 32px -12px rgba(9,9,11,0.28)',
              }}
            >
              {children}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

function TaxChip({
  item,
  slot,
  rates,
  onChange,
  onCreate,
}: {
  item: InvoiceItem;
  slot: TaxSlot;
  rates: TaxRate[];
  onChange: (changes: Partial<InvoiceItem>) => void;
  onCreate: () => void;
}) {
  const colors = useColorScheme();
  const [t] = useTranslation();

  const field = TAX_FIELDS[slot];
  const name = item[field.name] ?? '';
  const rate = item[field.rate] ?? 0;
  const applied = Boolean(name);

  return (
    <ChipMenu
      applied={applied}
      label={applied ? formatTaxName(name, rate) : t('add_tax')}
    >
      <div className="overflow-y-auto" role="listbox">
        {applied ? (
          <Option
            onClick={() => onChange({ [field.name]: '', [field.rate]: 0 })}
          >
            {t('none')}
          </Option>
        ) : null}

        {rates.map((entry) => (
          <Option
            key={entry.id ?? entry.name}
            selected={applied && name === entry.name}
            onClick={() =>
              onChange({ [field.name]: entry.name, [field.rate]: entry.rate })
            }
          >
            {formatTaxName(entry.name, entry.rate)}
          </Option>
        ))}
      </div>

      <div
        className="shrink-0"
        style={{ borderTop: `1px solid ${colors.$20}` }}
      >
        <Option onClick={onCreate} muted>
          {t('create_tax_rate')}
        </Option>
      </div>
    </ChipMenu>
  );
}

function TaxSlotsChip({
  busy,
  onSelect,
}: {
  busy: boolean;
  onSelect: (count: TaxSlot) => void;
}) {
  const [t] = useTranslation();

  return (
    <ChipMenu applied={false} disabled={busy} label={t('add_tax')}>
      <div className="overflow-y-auto" role="listbox">
        {TAX_SLOTS.map((slot) => (
          <Option key={slot} onClick={() => onSelect(slot)}>
            {t(SLOT_LABELS[slot])}
          </Option>
        ))}
      </div>
    </ChipMenu>
  );
}

function Option({
  children,
  onClick,
  muted,
  selected,
}: {
  children: React.ReactNode;
  onClick: () => void;
  muted?: boolean;
  selected?: boolean;
}) {
  const colors = useColorScheme();

  return (
    <button
      type="button"
      role={typeof selected === 'boolean' ? 'option' : undefined}
      aria-selected={typeof selected === 'boolean' ? selected : undefined}
      onClick={onClick}
      className="w-full text-left px-3 py-2 text-xs"
      style={{
        color: muted ? colors.$17 : colors.$3,
        backgroundColor: selected ? colors.$25 : 'transparent',
        fontWeight: selected ? 500 : 400,
      }}
      onMouseEnter={(event) =>
        (event.currentTarget.style.backgroundColor = colors.$25)
      }
      onMouseLeave={(event) =>
        (event.currentTarget.style.backgroundColor = selected
          ? colors.$25
          : 'transparent')
      }
    >
      {children}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  const colors = useColorScheme();
  const [t] = useTranslation();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${t('remove')} ${t('item').toLowerCase()}`}
      className="absolute grid place-items-center leading-none"
      style={{
        top: '0.375rem',
        right: '0.375rem',
        width: '1.5rem',
        height: '1.5rem',
        fontSize: '0.9375rem',
        color: colors.$17,
        borderRadius: '0.375rem',
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.backgroundColor = colors.$25;
        event.currentTarget.style.color = colors.$3;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.backgroundColor = 'transparent';
        event.currentTarget.style.color = colors.$17;
      }}
    >
      ✕
    </button>
  );
}

const hexToRgba = (hex: string, alpha: number): string => {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i.exec(hex);

  if (!match) {
    return `rgba(17, 125, 192, ${alpha})`;
  }

  const [, r, g, b] = match;

  return `rgba(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, ${alpha})`;
};

const toNumber = (raw: unknown): number => {
  const parsed = Number(String(raw ?? '').replace(',', '.'));

  return isNaN(parsed) ? 0 : parsed;
};
