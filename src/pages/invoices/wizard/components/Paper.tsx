/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Client } from '$app/common/interfaces/client';
import { Invoice } from '$app/common/interfaces/invoice';
import dayjs from 'dayjs';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Totals } from '../useWizard';
import { useTheme } from '../kit';

const INK = '#18181B';
const INK_SOFT = '#52525B';
const INK_FAINT = '#A1A1AA';
const RULE = '#E4E4E7';

interface Props {
  invoice: Invoice | undefined;
  client: Client | undefined;
  totals: Totals;
  money: (value: number) => string;
  accent: string;
  focus: 'recipient' | 'items' | 'timing' | null;
  onFixBusinessName?: () => void;
  onAddLogo?: () => void;
}

export function Paper({
  invoice,
  client,
  totals,
  money,
  accent,
  focus,
  onFixBusinessName,
  onAddLogo,
}: Props) {
  const t = useTheme();
  const company = useCurrentCompany();

  const businessName: string = company?.settings?.name ?? '';
  const logo: string = company?.settings?.company_logo ?? '';

  const items = (invoice?.line_items ?? []).filter(
    (item) => item.notes || item.product_key || item.cost
  );

  return (
    <div
      className="relative"
      style={
        {
          '--iw-settle': hexToRgba(accent, 0.14),
        } as React.CSSProperties
      }
    >
      <div
        className="p-6 sm:p-8"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '0.375rem',
          border: `1px solid ${t.dark ? 'rgba(255,255,255,0.10)' : 'rgba(9,9,11,0.08)'}`,
          boxShadow: t.dark
            ? '0 24px 60px -20px rgba(0,0,0,0.75), 0 2px 6px rgba(0,0,0,0.35)'
            : '0 18px 44px -18px rgba(9,9,11,0.28), 0 1px 3px rgba(9,9,11,0.08)',
          minHeight: 'min(70vh, 40rem)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <Resolves when={Boolean(logo)}>
              {logo ? (
                <img
                  src={logo}
                  alt=""
                  style={{
                    maxHeight: '2.5rem',
                    maxWidth: '11rem',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <Ghost
                  label="Your logo"
                  onClick={onAddLogo}
                  width="6rem"
                  height="2.5rem"
                />
              )}
            </Resolves>

            <div className="mt-2.5">
              <Resolves when={Boolean(businessName)}>
                {businessName ? (
                  <p
                    style={{
                      color: INK,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {businessName}
                  </p>
                ) : (
                  <Ghost
                    label="Your business name"
                    onClick={onFixBusinessName}
                    width="9rem"
                  />
                )}
              </Resolves>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p
              style={{
                color: INK,
                fontSize: '0.9375rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Invoice
            </p>

            <p
              style={{
                color: INK_FAINT,
                fontSize: '0.6875rem',
                marginTop: '0.25rem',
              }}
            >
              {invoice?.number
                ? `No. ${invoice.number}`
                : 'Number assigned on save'}
            </p>

            <p
              style={{
                color: INK_SOFT,
                fontSize: '0.6875rem',
                marginTop: '0.125rem',
              }}
            >
              {formatDate(invoice?.date)}
            </p>
          </div>
        </div>

        <Rule />

        <Region active={focus === 'recipient'} accent={accent}>
          <Caption>Bill to</Caption>

          <Resolves when={Boolean(client)}>
            {client ? (
              <div>
                <p
                  style={{ color: INK, fontSize: '0.8125rem', fontWeight: 500 }}
                >
                  {client.display_name || client.name}
                </p>

                {client.contacts?.[0]?.email ? (
                  <p
                    style={{
                      color: INK_SOFT,
                      fontSize: '0.75rem',
                      marginTop: '0.125rem',
                    }}
                  >
                    {client.contacts[0].email}
                  </p>
                ) : null}

                {client.address1 ? (
                  <p
                    style={{
                      color: INK_SOFT,
                      fontSize: '0.75rem',
                      marginTop: '0.125rem',
                    }}
                  >
                    {[client.address1, client.city, client.postal_code]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                ) : null}
              </div>
            ) : (
              <Ghost
                label="Who you're invoicing"
                width="12rem"
                height="2.75rem"
              />
            )}
          </Resolves>
        </Region>

        <Region active={focus === 'items'} accent={accent} className="mt-6">
          <div
            className="grid gap-2 sm:gap-3 pb-1.5 grid-cols-[1fr_1.75rem_4.25rem_4.5rem] sm:grid-cols-[1fr_3rem_5rem_5.5rem]"
            style={{ borderBottom: `1px solid ${RULE}` }}
          >
            <HeadCell>Description</HeadCell>
            <HeadCell align="right">Qty</HeadCell>
            <HeadCell align="right">Price</HeadCell>
            <HeadCell align="right">Total</HeadCell>
          </div>

          <Resolves when={items.length > 0}>
            {items.length ? (
              <div>
                {items.map((item, index) => (
                  <div
                    key={item._id ?? index}
                    className="grid gap-2 sm:gap-3 py-2 grid-cols-[1fr_1.75rem_4.25rem_4.5rem] sm:grid-cols-[1fr_3rem_5rem_5.5rem]"
                    style={{ borderBottom: `1px solid ${RULE}` }}
                  >
                    <span
                      style={{
                        color: INK,
                        fontSize: '0.75rem',
                        overflowWrap: 'break-word',
                      }}
                    >
                      {item.notes || item.product_key}
                      {item.tax_name1 ? (
                        <span style={{ color: INK_FAINT }}>
                          {'  '}· {item.tax_name1} {item.tax_rate1}%
                        </span>
                      ) : null}
                    </span>
                    <Num>{item.quantity}</Num>
                    <Num>{money(item.cost)}</Num>
                    <Num>{money(item.cost * item.quantity)}</Num>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pt-3">
                <Ghost
                  label="What you're charging for"
                  width="100%"
                  height="1.75rem"
                />
              </div>
            )}
          </Resolves>

          <div className="flex justify-end mt-5">
            <div className="w-full max-w-[13rem]">
              <TotalRow label="Subtotal" value={money(totals.subtotal)} />

              {totals.discount ? (
                <TotalRow
                  label="Discount"
                  value={`− ${money(totals.discount)}`}
                />
              ) : null}

              {totals.taxes ? (
                <TotalRow label="Tax" value={money(totals.taxes)} />
              ) : null}

              <div
                className="flex items-baseline justify-between pt-2 mt-2"
                style={{ borderTop: `1px solid ${RULE}` }}
              >
                <span
                  style={{ color: INK, fontSize: '0.75rem', fontWeight: 600 }}
                >
                  Total
                </span>
                <span
                  style={{
                    color: INK,
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {money(totals.total)}
                </span>
              </div>
            </div>
          </div>
        </Region>

        <div className="flex-1" />

        <Region active={focus === 'timing'} accent={accent} className="mt-6">
          <Rule />

          <Resolves when={Boolean(invoice?.due_date)}>
            {invoice?.due_date ? (
              <p style={{ color: INK, fontSize: '0.75rem' }}>
                {invoice.due_date === invoice.date
                  ? 'Payment due on receipt'
                  : `Payment due ${formatDate(invoice.due_date)}`}
              </p>
            ) : (
              <Ghost label="When payment is due" width="11rem" />
            )}
          </Resolves>

          {invoice?.terms ? (
            <p
              style={{
                color: INK_SOFT,
                fontSize: '0.6875rem',
                marginTop: '0.5rem',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
              }}
            >
              {invoice.terms}
            </p>
          ) : null}
        </Region>
      </div>
    </div>
  );
}

function Resolves({ when, children }: { when: boolean; children: ReactNode }) {
  const [settling, setSettling] = useState(false);
  const previous = useRef(when);

  useEffect(() => {
    if (when && !previous.current) {
      setSettling(true);

      const handle = setTimeout(() => setSettling(false), 640);

      previous.current = when;

      return () => clearTimeout(handle);
    }

    previous.current = when;
  }, [when]);

  return (
    <div
      className={settling ? 'iw-settle' : undefined}
      style={{ borderRadius: '0.25rem' }}
    >
      {children}
    </div>
  );
}

function Region({
  active,
  accent,
  className,
  children,
}: {
  active: boolean;
  accent: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        paddingLeft: '0.75rem',
        marginLeft: '-0.75rem',
        borderLeft: `2px solid ${active ? accent : 'transparent'}`,
        transition: 'border-color 200ms ease',
      }}
    >
      {children}
    </div>
  );
}

function Ghost({
  label,
  width,
  height = '1.25rem',
  onClick,
}: {
  label: string;
  width: string;
  height?: string;
  onClick?: () => void;
}) {
  const interactive = Boolean(onClick);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive}
      className="flex items-center px-2"
      style={{
        width,
        height,
        border: '1px dashed rgba(9,9,11,0.18)',
        borderRadius: '0.25rem',
        backgroundColor: 'rgba(9,9,11,0.015)',
        color: INK_FAINT,
        fontSize: '0.6875rem',
        textAlign: 'left',
        cursor: interactive ? 'pointer' : 'default',
      }}
    >
      {label}
      {interactive ? <span style={{ marginLeft: '0.25rem' }}>→</span> : null}
    </button>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        color: INK_FAINT,
        fontSize: '0.625rem',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: '0.375rem',
      }}
    >
      {children}
    </p>
  );
}

function HeadCell({
  children,
  align = 'left',
}: {
  children: ReactNode;
  align?: 'left' | 'right';
}) {
  return (
    <span
      style={{
        color: INK_FAINT,
        fontSize: '0.625rem',
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        textAlign: align,
      }}
    >
      {children}
    </span>
  );
}

function Num({ children }: { children: ReactNode }) {
  return (
    <span
      className="text-[0.6875rem] sm:text-xs"
      style={{
        color: INK_SOFT,
        textAlign: 'right',
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between py-0.5">
      <span style={{ color: INK_SOFT, fontSize: '0.75rem' }}>{label}</span>
      <span
        style={{
          color: INK_SOFT,
          fontSize: '0.75rem',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function Rule() {
  return <div style={{ borderTop: `1px solid ${RULE}`, margin: '1.5rem 0' }} />;
}

function formatDate(value: string | undefined): string {
  if (!value) {
    return '';
  }

  const parsed = dayjs(value);

  return parsed.isValid() ? parsed.format('D MMM YYYY') : value;
}

function hexToRgba(hex: string, alpha: number): string {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i.exec(hex);

  if (!match) {
    return `rgba(17, 125, 192, ${alpha})`;
  }

  const [, r, g, b] = match;

  return `rgba(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, ${alpha})`;
}
