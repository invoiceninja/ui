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
import { endpoint } from '$app/common/helpers';
import { formatTaxName } from '$app/common/helpers/invoices/round';
import { request } from '$app/common/helpers/request';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { InvoiceItem } from '$app/common/interfaces/invoice-item';
import { TaxRate } from '$app/common/interfaces/tax-rate';
import { Plus } from '$app/components/icons/Plus';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Checkbox,
  InputField,
  InputLabel,
} from '$app/components/forms';
import { Callout, ErrorBanner, Footer, useTheme, radius } from '../kit';
import { Wizard } from '../useWizard';
import { AppliedTax, TaxSetup } from './TaxSetup';
import { WorkPicker, WorkSource } from './WorkPicker';

interface Props {
  wizard: Wizard;
  money: (value: number) => string;
  embedded?: boolean;
}

type TaxTarget = { scope: 'invoice' } | { scope: 'item'; index: number };

export function StepItems({ wizard, money, embedded }: Props) {
  const [translate] = useTranslation();
  const t = useTheme();
  const company = useCurrentCompany();

  const items = wizard.invoice?.line_items ?? [];

  const [picker, setPicker] = useState<WorkSource | null>(null);
  const [taxSetup, setTaxSetup] = useState<TaxTarget | null>(null);
  const [taxOpen, setTaxOpen] = useState(false);
  const [rates, setRates] = useState<TaxRate[]>([]);

  const itemTaxesEnabled = (company?.enabled_item_tax_rates ?? 0) > 0;
  const taxesConfigured =
    itemTaxesEnabled || (company?.enabled_tax_rates ?? 0) > 0;

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

    if (taxSetup?.scope === 'item') {
      update(taxSetup.index, { tax_name1: tax.name, tax_rate1: tax.rate });

      return;
    }

    wizard.patch({
      ...(typeof tax.inclusive === 'boolean'
        ? { uses_inclusive_taxes: tax.inclusive }
        : {}),
      line_items: items.map((item) => ({
        ...item,
        tax_name1: tax.name,
        tax_rate1: tax.rate,
      })),
    });
  };

  const described = items.some((item) => item.notes || item.product_key);
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
    <div className="iw-enter">
      {embedded ? null : <ErrorBanner errors={wizard.errors} />}

      {embedded || !clientName ? null : (
        <div
          className="pb-5 mb-5 flex items-start justify-between gap-4"
          style={{ borderBottom: `1px dashed ${t.colors.$5}` }}
        >
          <div className="min-w-0">
            <p
              className="text-xs mb-1"
              style={{ color: t.label, fontWeight: 500 }}
            >
              Bill to
            </p>

            <p
              className="text-sm truncate"
              style={{ color: t.text, fontWeight: 500 }}
            >
              {clientName}
            </p>

            <p className="text-xs mt-0.5 truncate" style={{ color: t.muted }}>
              {recipientEmail || 'No email address'}
            </p>
          </div>

          <button
            type="button"
            onClick={wizard.detachClient}
            className="shrink-0 text-sm"
            style={{ color: t.accent, fontWeight: 500 }}
          >
            {translate('change')}
          </button>
        </div>
      )}

      <div className="space-y-5">
        {items.map((item, index) => {
          const key = item._id ?? String(index);

          return (
            <div
              key={key}
              className="relative border p-4"
              style={{
                borderColor: t.line,
                borderRadius: radius.panel,
                backgroundColor: t.dark ? t.colors.$25 : t.colors.$2,
              }}
            >
              {items.length > 1 ? (
                <RemoveButton onClick={() => removeRow(index)} />
              ) : null}

              <InputField
                id={`iw-desc-${key}`}
                width="100%"
                label="Description"
                placeholder="Website design"
                value={item.notes}
                changeOverride
                debounceTimeout={0}
                onValueChange={(value) => update(index, { notes: value })}
              />

              <div className="mt-3 flex items-end gap-3">
                <div className="flex-1 min-w-0">
                  <InputField
                    id={`iw-qty-${key}`}
                    width="100%"
                    label="Qty"
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
                    label="Price"
                    value={String(item.cost ?? 0)}
                    changeOverride
                    debounceTimeout={0}
                    onValueChange={(value) =>
                      update(index, { cost: toNumber(value) })
                    }
                  />
                </div>

                <div className="shrink-0 text-right">
                  <InputLabel className="mb-1">{translate('total')}</InputLabel>

                  <div
                    className="text-sm whitespace-nowrap py-2"
                    style={{
                      color: t.text,
                      fontWeight: 500,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {money((item.cost ?? 0) * (item.quantity ?? 0))}
                  </div>
                </div>
              </div>

              {itemTaxesEnabled ? (
                <div className="mt-3">
                  <TaxChip
                    item={item}
                    rates={rates}
                    onChange={(changes) => update(index, changes)}
                    onCreate={() => {
                      setTaxSetup({ scope: 'item', index });
                      setTaxOpen(true);
                    }}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Button type="secondary" behavior="button" onClick={() => addRow()}>
          Add another item
        </Button>

        <button
          type="button"
          onClick={() => setPicker('saved')}
          className="text-sm"
          style={{ color: t.accent, fontWeight: 500 }}
        >
          Choose a saved item
        </button>

        <button
          type="button"
          onClick={() => setPicker('work')}
          className="text-sm"
          style={{ color: t.accent, fontWeight: 500 }}
        >
          Add from existing work
        </button>
      </div>

      <div
        className="mt-6 pt-6 space-y-2"
        style={{ borderTop: `1px dashed ${t.colors.$5}` }}
      >
        <MoneyRow
          label={translate('subtotal')}
          value={money(totals.subtotal)}
        />

        {totals.discount ? (
          <MoneyRow
            label={translate('discount')}
            value={money(totals.discount)}
          />
        ) : null}

        {totals.surchargeRows.map((row, index) => (
          <MoneyRow
            key={`surcharge-${index}`}
            label={row.name || translate('surcharge')}
            value={money(row.total)}
          />
        ))}

        {totals.taxRows.map((row, index) => (
          <MoneyRow
            key={`${row.name}-${index}`}
            label={
              inclusive ? `${translate('includes')} ${row.name}` : row.name
            }
            value={money(row.total)}
          />
        ))}

        <MoneyRow
          label={translate('total')}
          value={money(totals.total)}
          strong
        />
      </div>

      {taxesConfigured ? (
        <div
          className="mt-6 pt-6 flex items-center gap-2.5"
          style={{ borderTop: `1px dashed ${t.colors.$5}` }}
        >
          <Checkbox
            id="iw-inclusive-taxes"
            checked={inclusive}
            onValueChange={(_, next) =>
              wizard.patch({ uses_inclusive_taxes: Boolean(next) })
            }
          />

          <label
            htmlFor="iw-inclusive-taxes"
            className="text-sm cursor-pointer"
            style={{ color: t.text }}
          >
            Prices include tax on this invoice
          </label>
        </div>
      ) : null}

      {!taxesConfigured && !wizard.dismissed('tax') ? (
        <div className="mt-6">
          <Callout title="Do you need to charge tax on this invoice?">
            <div className="flex items-center gap-2">
              <Button
                type="secondary"
                behavior="button"
                onClick={() => {
                  setTaxSetup({ scope: 'invoice' });
                  setTaxOpen(true);
                }}
              >
                Yes, add tax
              </Button>
              <Button
                type="secondary"
                behavior="button"
                onClick={() => wizard.dismiss('tax')}
              >
                No
              </Button>
            </div>
          </Callout>
        </div>
      ) : null}

      {embedded ? null : (
        <>
          {!described ? (
            <p className="text-xs mt-6" style={{ color: t.muted }}>
              Add a description to continue.
            </p>
          ) : null}

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
              disabled={!described}
              disableWithoutIcon
              onClick={wizard.next}
            >
              {translate('continue')}
            </Button>
          </Footer>
        </>
      )}

      <WorkPicker
        open={picker !== null}
        source={picker ?? 'saved'}
        clientId={wizard.invoice?.client_id ?? ''}
        money={money}
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
        onClose={() => setTaxOpen(false)}
        onApplied={applyTax}
      />
    </div>
  );
}

function MoneyRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  const t = useTheme();

  return (
    <div className="flex items-baseline justify-between gap-4">
      <span
        className="text-sm"
        style={{
          color: strong ? t.text : t.muted,
          fontWeight: strong ? 500 : 400,
        }}
      >
        {label}
      </span>

      <span
        className={strong ? 'text-lg' : 'text-sm'}
        style={{
          color: t.text,
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

function TaxChip({
  item,
  rates,
  onChange,
  onCreate,
}: {
  item: InvoiceItem;
  rates: TaxRate[];
  onChange: (changes: Partial<InvoiceItem>) => void;
  onCreate: () => void;
}) {
  const t = useTheme();
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

  const applied = Boolean(item.tax_name1);

  return (
    <div className="inline-block">
      <button
        ref={chip}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 border"
        style={{
          borderRadius: radius.control,
          borderColor: applied ? t.line : hexToRgba(t.accent, 0.35),
          color: applied ? t.text : t.accent,
          backgroundColor: applied ? t.hover : hexToRgba(t.accent, 0.1),
          fontWeight: 500,
          opacity: hovered ? 0.75 : 1,
          transition: 'opacity 150ms ease',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {applied ? null : <Plus size="0.6875rem" color={t.accent} />}
        {applied ? formatTaxName(item.tax_name1, item.tax_rate1) : 'Add tax'}
      </button>

      {open && placement
        ? createPortal(
            <div
              ref={panel}
              className="fixed flex flex-col border overflow-hidden"
              style={{
                left: placement.left,
                top: placement.top,
                width: PANEL_WIDTH,
                maxHeight: placement.maxHeight,
                transform: placement.above ? 'translateY(-100%)' : undefined,
                zIndex: 50,
                backgroundColor: t.surface,
                borderColor: t.line,
                borderRadius: radius.control,
                boxShadow: '0 12px 32px -12px rgba(9,9,11,0.28)',
              }}
            >
              <div className="overflow-y-auto" role="listbox">
                {applied ? (
                  <Option
                    onClick={() => {
                      onChange({ tax_name1: '', tax_rate1: 0 });
                      setOpen(false);
                    }}
                  >
                    No tax
                  </Option>
                ) : null}

                {rates.map((rate) => (
                  <Option
                    key={rate.id ?? rate.name}
                    selected={applied && item.tax_name1 === rate.name}
                    onClick={() => {
                      onChange({ tax_name1: rate.name, tax_rate1: rate.rate });
                      setOpen(false);
                    }}
                  >
                    {formatTaxName(rate.name, rate.rate)}
                  </Option>
                ))}
              </div>

              <div
                className="shrink-0"
                style={{ borderTop: `1px solid ${t.hairline}` }}
              >
                <Option
                  onClick={() => {
                    setOpen(false);
                    onCreate();
                  }}
                  muted
                >
                  Add a different tax…
                </Option>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
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
  const t = useTheme();

  return (
    <button
      type="button"
      role={typeof selected === 'boolean' ? 'option' : undefined}
      aria-selected={typeof selected === 'boolean' ? selected : undefined}
      onClick={onClick}
      className="w-full text-left px-3 py-2 text-xs"
      style={{
        color: muted ? t.muted : t.text,
        backgroundColor: selected ? t.hover : 'transparent',
        fontWeight: selected ? 500 : 400,
      }}
      onMouseEnter={(event) =>
        (event.currentTarget.style.backgroundColor = t.hover)
      }
      onMouseLeave={(event) =>
        (event.currentTarget.style.backgroundColor = selected
          ? t.hover
          : 'transparent')
      }
    >
      {children}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  const t = useTheme();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Remove item"
      className="absolute grid place-items-center leading-none"
      style={{
        top: '0.375rem',
        right: '0.375rem',
        width: '1.5rem',
        height: '1.5rem',
        fontSize: '0.9375rem',
        color: t.muted,
        borderRadius: radius.control,
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.backgroundColor = t.hover;
        event.currentTarget.style.color = t.text;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.backgroundColor = 'transparent';
        event.currentTarget.style.color = t.muted;
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
