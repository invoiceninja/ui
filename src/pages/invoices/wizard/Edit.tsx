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
import { Client } from '$app/common/interfaces/client';
import { useTitle } from '$app/common/hooks/useTitle';
import { Invoice } from '$app/common/interfaces/invoice';
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
import { useNavigate, useParams } from 'react-router-dom';
import { BrandPrompts } from './common/components/BrandPrompts';
import { ClientContactModal } from './common/components/ClientContactModal';
import { EditSection } from './common/components/EditSection';
import { StepItems } from './common/components/StepItems';
import { StepNotes } from './common/components/StepNotes';
import { StepTiming } from './common/components/StepTiming';
import { ValidationAlert } from '$app/components/ValidationAlert';
import { PreviewFrame } from './common/components/PreviewFrame';
import { useWizard } from './common/hooks/useWizard';
import {
  contactEmail,
  emailableContact,
} from './common/helpers/client-contact';

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
  const [askEmail, setAskEmail] = useState(false);

  const sendAfterContact = useRef(false);

  const pages: Page[] = [
    { name: t('invoices'), href: '/invoices' },
    { name: t('edit_invoice'), href: `/invoices/wizard/edit/${id}` },
  ];

  const recipient = contactEmail(emailableContact(wizard.client));

  const save = () => {
    setSaving(true);

    wizard
      .flush()
      .then((saved) => {
        if (!saved) {
          return toast.error();
        }

        toast.success('updated_invoice');
        $refetch(['invoices']);
      })
      .catch(() => toast.error())
      .finally(() => setSaving(false));
  };

  const deliver = () => {
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

  const send = () => {
    if (!recipient) {
      sendAfterContact.current = true;
      setAskEmail(true);

      return;
    }

    deliver();
  };

  const contactSaved = (saved: Client) => {
    wizard.attachClient(saved);

    if (!sendAfterContact.current) {
      return;
    }

    sendAfterContact.current = false;
    deliver();
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
              {wizard.errors ? (
                <ValidationAlert errors={wizard.errors} />
              ) : null}

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
                        {recipient || t('no_email_address')}
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
                    resource={wizard.invoice as Invoice}
                    entity="invoice"
                    relationType="client_id"
                    endpoint="/api/v1/live_preview?entity=:entity"
                    initiallyVisible
                  />
                </PreviewFrame>
              </EditSection>

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
                  {t('email_invoice')}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <ClientContactModal
        open={askEmail}
        client={wizard.client}
        onClose={() => {
          sendAfterContact.current = false;
          setAskEmail(false);
        }}
        onSaved={contactSaved}
      />
    </Default>
  );
}
