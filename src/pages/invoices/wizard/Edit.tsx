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
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
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
import { ErrorBanner, Motion, useTheme, radius } from './kit';
import { useWizard } from './useWizard';

export default function Edit() {
  const [t] = useTranslation();

  const { id } = useParams();
  const { documentTitle } = useTitle('edit_invoice');

  const theme = useTheme();
  const colors = useColorScheme();
  const navigate = useNavigate();
  const company = useCurrentCompany();
  const formatMoney = useFormatMoney();
  const wizard = useWizard(id);

  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  const pages: Page[] = [
    { name: t('invoices'), href: '/invoices' },
    { name: t('edit_invoice'), href: `/invoices/wizard/edit/${id}` },
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

        return request(
          'POST',
          endpoint('/api/v1/invoices/bulk'),
          { action: 'email', ids: [saved] },
          { skipIntercept: true }
        ).then(() => {
          $refetch(['invoices']);

          toast.success('emailed_invoice');
          navigate('/invoices');
        });
      })
      .catch(() => toast.error())
      .finally(() => setSending(false));
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
      <Motion />

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
              <p className="text-sm mb-4" style={{ color: theme.text }}>
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
                    borderColor: theme.line,
                    borderRadius: radius.panel,
                  }}
                >
                  <div className="min-w-0">
                    <p
                      className="text-sm"
                      style={{ color: theme.text, fontWeight: 500 }}
                    >
                      {wizard.client?.display_name || wizard.client?.name}
                    </p>

                    <p
                      className="text-xs mt-0.5"
                      style={{ color: theme.muted }}
                    >
                      {recipient || t('no_email_address')}
                    </p>
                  </div>
                </div>
              </Section>

              <Section label={t('items')}>
                <StepItems wizard={wizard} money={money} embedded />
              </Section>

              <Section label={t('payment')}>
                <StepTiming wizard={wizard} embedded />
              </Section>

              <Section label={t('terms')}>
                <StepNotes wizard={wizard} embedded />
              </Section>

              <Section label={t('preview')} last>
                <BrandPrompts />

                <div
                  className="iw-preview mt-4 border overflow-hidden"
                  style={{
                    borderColor: theme.line,
                    borderRadius: radius.panel,
                  }}
                >
                  <style>
                    {
                      '.iw-preview .flex.flex-col.w-full{height:38rem !important;}'
                    }
                  </style>

                  <InvoicePreview
                    for="invoice"
                    resource={wizard.invoice as Invoice}
                    entity="invoice"
                    relationType="client_id"
                    endpoint="/api/v1/live_preview?entity=:entity"
                    initiallyVisible
                  />
                </div>
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
  const theme = useTheme();

  return (
    <section
      className={last ? '' : 'pb-6 mb-6'}
      style={
        last ? undefined : { borderBottom: `1px dashed ${theme.colors.$5}` }
      }
    >
      <h4
        className="text-sm mb-3"
        style={{ color: theme.label, fontWeight: 500 }}
      >
        {label}
      </h4>

      {children}
    </section>
  );
}
