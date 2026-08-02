/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useTitle } from '$app/common/hooks/useTitle';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandPrompts } from './components/BrandPrompts';
import { LivePreview } from './components/LivePreview';
import { Paper } from './components/Paper';
import { StepItems } from './components/StepItems';
import { StepRecipient } from './components/StepRecipient';
import { StepReview } from './components/StepReview';
import { StepTiming } from './components/StepTiming';
import { Action, Motion, Spinner, useTheme } from './kit';
import { STEPS, StepKey, useWizard } from './useWizard';

export default function Wizard() {
  useTitle('invoice');

  const t = useTheme();
  const navigate = useNavigate();
  const company = useCurrentCompany();
  const formatMoney = useFormatMoney();
  const wizard = useWizard();

  const [brandFocus, setBrandFocus] = useState<'name' | 'logo' | null>(null);
  const [closing, setClosing] = useState(false);
  const heading = useRef<HTMLElement>(null);

  useEffect(() => {
    heading.current?.focus();
  }, [wizard.step]);

  async function close() {
    setClosing(true);
    await wizard.flush();
    navigate('/invoices');
  }

  const money = (value: number) =>
    String(
      formatMoney(
        value,
        wizard.client?.country_id || company?.settings?.country_id,
        wizard.client?.settings?.currency_id || company?.settings?.currency_id,
        2
      )
    );

  const focus: 'recipient' | 'items' | 'timing' | null = (
    {
      who: 'recipient',
      what: 'items',
      when: 'timing',
      send: null,
    } as const
  )[wizard.step];

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: t.desk,
        color: t.text,
        colorScheme: t.colors.$0,
      }}
    >
      <Motion />

      <header
        className="sticky top-0 z-30 border-b"
        style={{ backgroundColor: t.desk, borderColor: t.hairline }}
      >
        <div className="mx-auto max-w-[86rem] px-5 lg:px-8 h-14 flex items-center justify-between gap-6">
          <nav
            aria-label="Progress"
            className="flex items-center gap-1 min-w-0"
          >
            {STEPS.map((entry, index) => {
              const active = entry.key === wizard.step;
              const reachable = !wizard.sent && index <= wizard.furthest;

              return (
                <button
                  key={entry.key}
                  type="button"
                  disabled={!reachable}
                  onClick={() => reachable && wizard.goTo(entry.key as StepKey)}
                  aria-current={active ? 'step' : undefined}
                  className="text-sm px-2.5 py-1.5 relative"
                  style={{
                    color: active ? t.text : reachable ? t.colors.$22 : t.muted,
                    fontWeight: active ? 600 : 500,
                    cursor: reachable ? 'pointer' : 'default',
                    opacity: reachable ? 1 : 0.55,
                  }}
                >
                  {entry.rail}

                  <span
                    aria-hidden
                    style={{
                      position: 'absolute',
                      left: '0.625rem',
                      right: '0.625rem',
                      bottom: '-0.4375rem',
                      height: '2px',
                      borderRadius: '2px',
                      backgroundColor: active ? t.accent : 'transparent',
                      transition: 'background-color 200ms ease',
                    }}
                  />
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-4 shrink-0">
            <SaveState state={wizard.sent ? 'idle' : wizard.saveState} />

            <button
              type="button"
              onClick={close}
              disabled={closing}
              className="text-sm"
              style={{ color: t.muted }}
            >
              {closing ? 'Saving…' : 'Close'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[86rem] px-5 lg:px-8 py-8 lg:py-14">
        {wizard.loadFailed ? (
          <div className="py-28 text-center max-w-sm mx-auto">
            <p className="text-base" style={{ color: t.text, fontWeight: 600 }}>
              We couldn't start a new invoice.
            </p>
            <p className="text-sm mt-2 mb-5" style={{ color: t.muted }}>
              Check your connection and try again.
            </p>
            <Action tone="solid" onClick={wizard.retryLoad}>
              Try again
            </Action>
          </div>
        ) : !wizard.ready ? (
          <div className="flex items-center justify-center gap-2 py-32">
            <Spinner tone={t.muted} />
            <span className="text-sm" style={{ color: t.muted }}>
              Getting things ready
            </span>
          </div>
        ) : (
          <div className="grid gap-10 lg:gap-14 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
            <section
              key={wizard.step}
              ref={heading}
              tabIndex={-1}
              className="min-w-0 focus:outline-none"
            >
              {wizard.step === 'who' ? <StepRecipient wizard={wizard} /> : null}
              {wizard.step === 'what' ? (
                <StepItems wizard={wizard} money={money} />
              ) : null}
              {wizard.step === 'when' ? <StepTiming wizard={wizard} /> : null}
              {wizard.step === 'send' ? (
                <StepReview wizard={wizard} money={money} />
              ) : null}
            </section>

            <section className="min-w-0 space-y-4">
              {wizard.sent ? null : (
                <BrandPrompts
                  focus={brandFocus}
                  onFocusHandled={() => setBrandFocus(null)}
                />
              )}

              {wizard.step === 'send' ? (
                <LivePreview
                  invoice={wizard.invoice}
                  invoiceId={wizard.invoiceId}
                />
              ) : (
                <Paper
                  invoice={wizard.invoice}
                  client={wizard.client}
                  totals={wizard.totals}
                  money={money}
                  accent={t.accent}
                  focus={focus}
                  onFixBusinessName={() => setBrandFocus('name')}
                  onAddLogo={() => setBrandFocus('logo')}
                />
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function SaveState({
  state,
}: {
  state: ReturnType<typeof useWizard>['saveState'];
}) {
  const t = useTheme();

  if (state === 'idle') {
    return null;
  }

  const failed = state === 'failed';

  const copy = {
    saving: 'Saving…',
    saved: 'Draft saved',
    failed: "Couldn't save your last change",
  }[state];

  return (
    <span
      role="status"
      aria-live="polite"
      className={`text-xs ${failed ? '' : 'hidden sm:inline'}`}
      style={{ color: failed ? '#DC2626' : t.muted }}
    >
      {copy}
    </span>
  );
}
