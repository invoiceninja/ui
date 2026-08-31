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
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useTitle } from '$app/common/hooks/useTitle';
import { route } from '$app/common/helpers/route';
import { AdvancedConfigurationToggle } from './components/AdvancedConfigurationToggle';
import { Badge } from '$app/components/Badge';
import { Page } from '$app/components/Breadcrumbs';
import { Spinner } from '$app/components/Spinner';
import { Card } from '$app/components/cards';
import { Button } from '$app/components/forms';
import { Default } from '$app/components/layouts/Default';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { STEPS, useWizard } from './useWizard';

export default function Wizard() {
  const [t] = useTranslation();

  const { documentTitle } = useTitle('new_invoice');

  const colors = useColorScheme();
  const location = useLocation();
  const company = useCurrentCompany();
  const wizard = useWizard();

  const heading = useRef<HTMLElement>(null);

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [wizard.step]);

  const pages: Page[] = [
    { name: t('invoices'), href: '/invoices' },
    { name: t('new_invoice'), href: '/invoices/wizard' },
  ];

  const current = STEPS[wizard.stepIndex] ?? STEPS[0];
  const wideStep = wizard.step === 'send' || wizard.step === 'notes';

  const described = (wizard.invoice?.line_items ?? []).some(
    (item) => item.notes || item.product_key
  );

  if (wizard.ready) {
    if (location.pathname !== STEPS[0].href && !wizard.invoice?.client_id) {
      return <Navigate to={STEPS[0].href} replace />;
    }

    if (
      !described &&
      (wizard.step === 'when' ||
        wizard.step === 'notes' ||
        wizard.step === 'send')
    ) {
      return <Navigate to={STEPS[1].href} replace />;
    }

    if (
      (wizard.step === 'notes' || wizard.step === 'send') &&
      !wizard.invoice?.due_date
    ) {
      return <Navigate to={STEPS[2].href} replace />;
    }
  }

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      navigationTopRight={<SaveState state={wizard.saveState} />}
      topRight={
        <AdvancedConfigurationToggle
          counterpart={
            wizard.invoiceId
              ? route('/invoices/:id/edit', { id: wizard.invoiceId })
              : '/invoices/create'
          }
        />
      }
    >
      <div
        className="mx-auto w-full"
        style={{ maxWidth: wideStep ? '54rem' : '40rem' }}
      >
        <Card
          className="shadow-sm"
          title={t(current.title)}
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
              <p className="text-sm mb-4" style={{ color: colors.$3 }}>
                {t('error_title')}
              </p>

              <Button
                type="secondary"
                behavior="button"
                disableWithoutIcon
                onClick={wizard.retryLoad}
              >
                {t('refresh')}
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
              <Outlet context={{ wizard }} />
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
  const colors = useColorScheme();
  const [t] = useTranslation();

  if (state === 'idle') {
    return null;
  }

  const failed = state === 'failed';

  return (
    <span
      role="status"
      aria-live="polite"
      className={failed ? 'text-xs text-red-600' : 'text-xs'}
      style={failed ? undefined : { color: colors.$17 }}
    >
      {state === 'saving'
        ? `${t('saving')}…`
        : failed
          ? t('draft_not_saved')
          : t('draft_saved')}
    </span>
  );
}
