/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useTitle } from '$app/common/hooks/useTitle';
import { Invoice } from '$app/common/interfaces/invoice';
import { Page } from '$app/components/Breadcrumbs';
import { Spinner } from '$app/components/Spinner';
import { Tabs } from '$app/components/Tabs';
import { Card } from '$app/components/cards';
import { Button } from '$app/components/forms';
import { Default } from '$app/components/layouts/Default';
import { InvoicePreview } from '$app/pages/invoices/common/components/InvoicePreview';
import { MouseEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { BrandPrompts } from './components/BrandPrompts';
import { Motion, useTheme } from './kit';
import { STEPS, useWizard } from './useWizard';

export default function Wizard() {
  const [translate] = useTranslation();

  const { documentTitle } = useTitle('new_invoice');

  const t = useTheme();
  const colors = useColorScheme();
  const location = useLocation();
  const company = useCurrentCompany();
  const formatMoney = useFormatMoney();
  const wizard = useWizard();

  const [brandFocus, setBrandFocus] = useState<'name' | 'logo' | null>(null);
  const heading = useRef<HTMLElement>(null);

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [wizard.step]);

  const pages: Page[] = [
    { name: translate('invoices'), href: '/invoices' },
    { name: translate('new_invoice'), href: '/invoices/wizard' },
  ];

  const tabs = STEPS.map((entry) => ({
    name: translate(entry.labelKey),
    href: entry.href,
  }));

  const locked = STEPS.filter((entry, index) =>
    wizard.sent ? entry.key !== 'send' : index > wizard.furthest
  ).map((entry) => entry.href);

  const isLocked = (href: string | null) =>
    Boolean(href) && locked.some((path) => href?.endsWith(path));

  const money = (value: number) =>
    String(
      formatMoney(
        value,
        wizard.client?.country_id || company?.settings?.country_id,
        wizard.client?.settings?.currency_id || company?.settings?.currency_id,
        2
      )
    );

  const previewable =
    Boolean(wizard.invoiceId) && Boolean(wizard.invoice?.client_id);

  if (wizard.ready) {
    const sendStep = STEPS[STEPS.length - 1];

    if (wizard.sent && location.pathname !== sendStep.href) {
      return <Navigate to={sendStep.href} replace />;
    }

    if (location.pathname !== STEPS[0].href && !wizard.invoice?.client_id) {
      return <Navigate to={STEPS[0].href} replace />;
    }
  }

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      navigationTopRight={
        <SaveState state={wizard.sent ? 'idle' : wizard.saveState} />
      }
    >
      <Motion />

      <Card
        className="shadow-sm"
        title={translate('new_invoice')}
        withoutBodyPadding
        withoutHeaderBorder
        style={{ borderColor: colors.$24 }}
      >
        <div
          className="iw-tabs"
          onClickCapture={(event: MouseEvent<HTMLDivElement>) => {
            const anchor = (event.target as HTMLElement).closest('a');

            if (anchor && isLocked(anchor.getAttribute('href'))) {
              event.preventDefault();
              event.stopPropagation();
            }
          }}
        >
          <style>
            {locked
              .map(
                (path) =>
                  `.iw-tabs a[href$="${path}"]{opacity:.45;cursor:default;}`
              )
              .join('')}
          </style>

          <Tabs
            tabs={tabs}
            disableBackupNavigation
            withHorizontalPadding
            fullRightPadding
            withHorizontalPaddingOnSmallScreen
          />
        </div>

        <div className="px-4 sm:px-6 pt-8 pb-8">
          {wizard.loadFailed ? (
            <div className="py-16 text-center">
              <p className="text-sm mb-4" style={{ color: t.text }}>
                {translate('error_title')}
              </p>

              <Button
                type="secondary"
                behavior="button"
                disableWithoutIcon
                onClick={wizard.retryLoad}
              >
                {translate('refresh')}
              </Button>
            </div>
          ) : !wizard.ready ? (
            <div className="py-16">
              <Spinner />
            </div>
          ) : (
            <div className="grid gap-8 lg:gap-12 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
              <section
                key={wizard.step}
                ref={heading}
                tabIndex={-1}
                className="min-w-0 focus:outline-none"
              >
                <Outlet context={{ wizard, money }} />
              </section>

              <section className="min-w-0 space-y-4">
                {wizard.sent ? null : (
                  <BrandPrompts
                    focus={brandFocus}
                    onFocusHandled={() => setBrandFocus(null)}
                  />
                )}

                {previewable ? (
                  <InvoicePreview
                    for="invoice"
                    resource={wizard.invoice as Invoice}
                    entity="invoice"
                    relationType="client_id"
                    endpoint="/api/v1/live_preview?entity=:entity"
                    initiallyVisible
                  />
                ) : (
                  <div
                    className="border flex items-center justify-center text-center px-8"
                    style={{
                      borderColor: t.line,
                      borderRadius: '0.375rem',
                      backgroundColor: t.surface,
                      minHeight: '28rem',
                    }}
                  >
                    <p className="text-sm" style={{ color: t.muted }}>
                      {translate('preview')}
                    </p>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </Card>
    </Default>
  );
}

function SaveState({
  state,
}: {
  state: ReturnType<typeof useWizard>['saveState'];
}) {
  const t = useTheme();
  const [translate] = useTranslation();

  if (state === 'idle') {
    return null;
  }

  const failed = state === 'failed';

  return (
    <span
      role="status"
      aria-live="polite"
      className="text-xs"
      style={{ color: failed ? '#DC2626' : t.muted }}
    >
      {state === 'saving'
        ? `${translate('saving')}…`
        : failed
          ? "Draft didn't save"
          : 'Draft saved'}
    </span>
  );
}
