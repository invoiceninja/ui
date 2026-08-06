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
import { Badge } from '$app/components/Badge';
import { Page } from '$app/components/Breadcrumbs';
import { Spinner } from '$app/components/Spinner';
import { Card } from '$app/components/cards';
import { Button } from '$app/components/forms';
import { Default } from '$app/components/layouts/Default';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
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

  const heading = useRef<HTMLElement>(null);

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [wizard.step]);

  const pages: Page[] = [
    { name: translate('invoices'), href: '/invoices' },
    { name: translate('new_invoice'), href: '/invoices/wizard' },
  ];

  const money = (value: number) =>
    String(
      formatMoney(
        value,
        wizard.client?.country_id || company?.settings?.country_id,
        wizard.client?.settings?.currency_id || company?.settings?.currency_id,
        2
      )
    );

  const current = STEPS[wizard.stepIndex] ?? STEPS[0];
  const onSendStep = wizard.step === 'send';

  const described = (wizard.invoice?.line_items ?? []).some(
    (item) => item.notes || item.product_key
  );

  if (wizard.ready) {
    if (location.pathname !== STEPS[0].href && !wizard.invoice?.client_id) {
      return <Navigate to={STEPS[0].href} replace />;
    }

    if (!described && (wizard.step === 'when' || wizard.step === 'send')) {
      return <Navigate to={STEPS[1].href} replace />;
    }

    if (wizard.step === 'send' && !wizard.invoice?.due_date) {
      return <Navigate to={STEPS[2].href} replace />;
    }
  }

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      navigationTopRight={<SaveState state={wizard.saveState} />}
    >
      <Motion />

      <div
        className="mx-auto w-full"
        style={{ maxWidth: onSendStep ? '54rem' : '40rem' }}
      >
        <Card
          className="shadow-sm"
          title={current.title}
          childrenClassName="px-4 sm:px-6 pb-4 sm:pb-6"
          style={{ borderColor: colors.$24 }}
          headerStyle={{ borderColor: colors.$20 }}
          topRight={
            <Badge variant="primary" className="shrink-0">
              {`${wizard.stepIndex + 1} / ${STEPS.length}`}
            </Badge>
          }
        >
          {wizard.loadFailed ? (
            <div className="py-14 text-center">
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
            <div className="py-14 flex justify-center">
              <Spinner />
            </div>
          ) : (
            <section
              key={wizard.step}
              ref={heading}
              tabIndex={-1}
              className="min-w-0 focus:outline-none pt-2"
            >
              <Outlet context={{ wizard, money }} />
            </section>
          )}
        </Card>
      </div>
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
          ? 'Draft not saved'
          : 'Draft saved'}
    </span>
  );
}
