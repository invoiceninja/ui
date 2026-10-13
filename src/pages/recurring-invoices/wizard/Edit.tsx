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
import { numberBreadcrumb } from '$app/common/helpers/breadcrumbs';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Client } from '$app/common/interfaces/client';
import { useTitle } from '$app/common/hooks/useTitle';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { RecurringInvoiceStatus } from '$app/common/enums/recurring-invoice-status';
import { route } from '$app/common/helpers/route';
import { AdvancedConfigurationToggle } from './common/components/AdvancedConfigurationToggle';
import { Page } from '$app/components/Breadcrumbs';
import { Spinner } from '$app/components/Spinner';
import { Card } from '$app/components/cards';
import { Button } from '$app/components/forms';
import { Default } from '$app/components/layouts/Default';
import { InvoicePreview } from '$app/pages/invoices/common/components/InvoicePreview';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { BrandPrompts } from './common/components/BrandPrompts';
import { ClientContactModal } from './common/components/ClientContactModal';
import { EditSection } from './common/components/EditSection';
import { StepItems } from './common/components/StepItems';
import { StepNotes } from './common/components/StepNotes';
import { StepSchedule } from './common/components/StepSchedule';
import { StepTiming } from './common/components/StepTiming';
import { PreviewFrame } from './common/components/PreviewFrame';
import { useWizard } from './common/hooks/useWizard';
import {
  contactEmail,
  emailableContact,
} from './common/helpers/client-contact';
import { isRunning } from './common/helpers/status';

export default function Edit() {
  const [t] = useTranslation();

  const { id } = useParams();
  const { documentTitle } = useTitle('edit_recurring_invoice');

  const colors = useColorScheme();
  const wizard = useWizard(id);

  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [askEmail, setAskEmail] = useState(false);

  const startAfterContact = useRef(false);

  const pages: Page[] = [
    { name: t('recurring_invoices'), href: '/recurring_invoices' },
    {
      name: numberBreadcrumb(
        wizard.recurringInvoice?.number,
        t('edit_recurring_invoice')
      ),
      href: `/recurring_invoices/${id}/guided`,
    },
  ];

  const startable =
    wizard.recurringInvoice?.status_id === RecurringInvoiceStatus.DRAFT ||
    wizard.recurringInvoice?.status_id === RecurringInvoiceStatus.PAUSED;

  const recipient = contactEmail(emailableContact(wizard.client));

  const save = () => {
    setSaving(true);

    wizard
      .flush()
      .then((saved) => {
        if (!saved) {
          return;
        }

        toast.success('updated_recurring_invoice');
        $refetch(['recurring_invoices']);
      })
      .catch(() => toast.error())
      .finally(() => setSaving(false));
  };

  const launch = () => {
    setStarting(true);

    wizard
      .flush({ start: true })
      .then((saved) => {
        if (!saved) {
          return;
        }

        toast.success(
          isRunning(saved)
            ? 'started_recurring_invoice'
            : 'updated_recurring_invoice'
        );
        $refetch(['recurring_invoices']);
      })
      .catch(() => toast.error())
      .finally(() => {
        return setStarting(false);
      });
  };

  const start = () => {
    if (!recipient) {
      startAfterContact.current = true;
      setAskEmail(true);

      return;
    }

    launch();
  };

  const contactSaved = (saved: Client) => {
    wizard.attachClient(saved);

    if (!startAfterContact.current) {
      return;
    }

    startAfterContact.current = false;

    if (!contactEmail(emailableContact(saved))) {
      return;
    }

    launch();
  };

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      topRight={
        <AdvancedConfigurationToggle
          counterpart={route('/recurring_invoices/:id/edit', { id })}
        />
      }
    >
      <div className="mx-auto w-full" style={{ maxWidth: '54rem' }}>
        <Card
          className="shadow-sm"
          title={
            wizard.recurringInvoice?.number
              ? `${t('recurring_invoice')} ${wizard.recurringInvoice.number}`
              : t('recurring_invoice')
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
              <EditSection label={t('client')}>
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

                    <div className="mt-0.5 flex flex-wrap items-center gap-4">
                      <span className="text-xs" style={{ color: colors.$17 }}>
                        {recipient || t('client_email_not_set')}
                      </span>

                      {recipient ? null : (
                        <Button
                          type="minimal"
                          behavior="button"
                          onClick={() => setAskEmail(true)}
                        >
                          {t('contact_details')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </EditSection>

              <EditSection label={t('items')}>
                <StepItems wizard={wizard} embedded />
              </EditSection>

              <EditSection label={t('schedule')}>
                <StepSchedule wizard={wizard} embedded />
              </EditSection>

              <EditSection label={t('payment')}>
                <StepTiming wizard={wizard} embedded />
              </EditSection>

              <EditSection label={t('terms')}>
                <StepNotes wizard={wizard} embedded />
              </EditSection>

              <EditSection label={t('preview')} last>
                <BrandPrompts
                  logoSkipped={wizard.dismissed('logo')}
                  onSkipLogo={() => wizard.dismiss('logo')}
                />

                <PreviewFrame
                  className="mt-4 border overflow-hidden"
                  style={{
                    borderColor: colors.$24,
                    borderRadius: '0.375rem',
                  }}
                >
                  <InvoicePreview
                    for="invoice"
                    resource={wizard.recurringInvoice as RecurringInvoice}
                    entity="recurring_invoice"
                    relationType="client_id"
                    endpoint="/api/v1/live_preview?entity=:entity"
                    initiallyVisible
                  />
                </PreviewFrame>
              </EditSection>

              <div className="mt-8 flex items-center justify-end gap-2">
                <Button
                  type={startable ? 'secondary' : 'primary'}
                  behavior="button"
                  disabled={saving || starting}
                  disableWithoutIcon={!saving}
                  onClick={save}
                >
                  {t('save')}
                </Button>

                {startable ? (
                  <Button
                    behavior="button"
                    disabled={starting || saving}
                    disableWithoutIcon={!starting}
                    onClick={start}
                  >
                    {t('start')}
                  </Button>
                ) : null}
              </div>
            </div>
          )}
        </Card>
      </div>

      <ClientContactModal
        open={askEmail}
        client={wizard.client}
        onClose={() => {
          startAfterContact.current = false;
          setAskEmail(false);
        }}
        onSaved={contactSaved}
      />
    </Default>
  );
}
