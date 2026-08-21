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
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useTitle } from '$app/common/hooks/useTitle';
import { Invoice } from '$app/common/interfaces/invoice';
import { route } from '$app/common/helpers/route';
import { AdvancedConfigurationToggle } from '$app/components/AdvancedConfigurationToggle';
import { Page } from '$app/components/Breadcrumbs';
import { Spinner } from '$app/components/Spinner';
import { Card } from '$app/components/cards';
import { Button } from '$app/components/forms';
import { Default } from '$app/components/layouts/Default';
import { InvoicePreview } from '$app/pages/invoices/common/components/InvoicePreview';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { BrandPrompts } from './components/BrandPrompts';
import { StepItems } from './components/StepItems';
import { StepNotes } from './components/StepNotes';
import { StepTiming } from './components/StepTiming';
import { ErrorBanner } from '$app/components/ErrorBanner';
import { PreviewFrame } from '$app/components/PreviewFrame';
import { useWizard } from './useWizard';

export default function Edit() {
  const [t] = useTranslation();

  const { id } = useParams();
  const { documentTitle } = useTitle('edit_invoice');

  const colors = useColorScheme();
  const navigate = useNavigate();
  const company = useCurrentCompany();
  const wizard = useWizard(id);

  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  const pages: Page[] = [
    { name: t('invoices'), href: '/invoices' },
    { name: t('edit_invoice'), href: `/invoices/wizard/edit/${id}` },
  ];

  const recipient = (wizard.client?.contacts ?? []).find(
    (contact) => contact.send_email !== false && contact.email
  )?.email;

  const save = () => {
    setSaving(true);

    wizard
      .flush()
      .then((saved) => {
        if (!saved) {
          return;
        }

        toast.success('updated_invoice');
        $refetch(['invoices']);
      })
      .finally(() => setSaving(false));
  };

  const send = () => {
    setSending(true);

    wizard
      .flush()
      .then((saved) => {
        if (!saved) {
          return Promise.reject(new Error('not saved'));
        }

        $refetch(['invoices']);

        navigate(route('/invoices/:id/email', { id: saved }));
      })
      .catch(() => toast.error())
      .finally(() => {
        return setSending(false);
      });
  };

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      topRight={
        <AdvancedConfigurationToggle
          counterpart={route('/invoices/:id/edit', { id })}
        />
      }
    >
      <div className="mx-auto w-full" style={{ maxWidth: '54rem' }}>
        <Card
          className="shadow-sm"
          title={
            wizard.invoice?.number
              ? `${t('invoice')} ${wizard.invoice.number}`
              : t('invoice')
          }
          childrenClassName="px-4 sm:px-6 pb-4 sm:pb-6"
          style={{ borderColor: colors.$24 }}
          headerStyle={{ borderColor: colors.$20 }}
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
            <div className="pt-4">
              <ErrorBanner errors={wizard.errors} />

              <Section label={t('client')}>
                <div
                  className="flex items-start justify-between gap-4 border px-4 py-3.5"
                  style={{
                    borderColor: colors.$24,
                    borderRadius: '0.375rem',
                  }}
                >
                  <div className="min-w-0">
                    <p
                      className="text-sm"
                      style={{ color: colors.$3, fontWeight: 500 }}
                    >
                      {wizard.client?.display_name || wizard.client?.name}
                    </p>

                    <p className="text-xs mt-0.5" style={{ color: colors.$17 }}>
                      {recipient || t('no_email_address')}
                    </p>
                  </div>
                </div>
              </Section>

              <Section label={t('items')}>
                <StepItems wizard={wizard} embedded />
              </Section>

              <Section label={t('payment')}>
                <StepTiming wizard={wizard} embedded />
              </Section>

              <Section label={t('terms')}>
                <StepNotes wizard={wizard} embedded />
              </Section>

              <Section label={t('preview')} last>
                <BrandPrompts />

                <PreviewFrame
                  className="mt-4 border overflow-hidden"
                  style={{
                    borderColor: colors.$24,
                    borderRadius: '0.375rem',
                  }}
                >
                  <InvoicePreview
                    for="invoice"
                    resource={wizard.invoice as Invoice}
                    entity="invoice"
                    relationType="client_id"
                    endpoint="/api/v1/live_preview?entity=:entity"
                    initiallyVisible
                  />
                </PreviewFrame>
              </Section>

              <div className="mt-8 flex items-center justify-end gap-2">
                <Button
                  type="secondary"
                  behavior="button"
                  disabled={saving}
                  onClick={save}
                >
                  {t('save')}
                </Button>

                <Button behavior="button" disabled={sending} onClick={send}>
                  {t('send_invoice')}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Default>
  );
}

function Section({
  label,
  children,
  last,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  const colors = useColorScheme();

  return (
    <section
      className={last ? '' : 'pb-6 mb-6'}
      style={last ? undefined : { borderBottom: `1px dashed ${colors.$5}` }}
    >
      <h4
        className="text-sm mb-3"
        style={{ color: colors.$22, fontWeight: 500 }}
      >
        {label}
      </h4>

      {children}
    </section>
  );
}
