/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { enterprisePlan } from '$app/common/guards/guards/enterprise-plan';
import { proPlan } from '$app/common/guards/guards/pro-plan';
import { endpoint, trans } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { updateRecord } from '$app/common/stores/slices/company-users';
import { Client } from '$app/common/interfaces/client';
import { Invoice } from '$app/common/interfaces/invoice';
import { InvoicePreview } from '$app/pages/invoices/common/components/InvoicePreview';
import dayjs from 'dayjs';
import reactStringReplace from 'react-string-replace';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHref, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { Modal } from '$app/components/Modal';
import { Element } from '$app/components/cards';
import { Button, Checkbox, InputField } from '$app/components/forms';
import { Callout, ErrorBanner, Footer, useTheme, radius } from '../kit';
import { Wizard } from '../useWizard';
import { BrandPrompts } from './BrandPrompts';

const LOOKS: { label: string; design: string }[] = [
  { label: 'clean', design: 'Clean' },
  { label: 'modern', design: 'Modern' },
  { label: 'traditional', design: 'Plain' },
];

type AttachmentKey = 'pdf_email_attachment' | 'document_email_attachment';

interface Props {
  wizard: Wizard;
  money: (value: number) => string;
}

export function StepReview({ wizard, money }: Props) {
  const [t] = useTranslation();
  const theme = useTheme();
  const colors = useColorScheme();
  const company = useCurrentCompany();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const gatewaysHref = useHref('/settings/gateways/create');

  const invoice = wizard.invoice;
  const client = wizard.client;
  const emailable = (client?.contacts ?? []).filter(
    (entry) => entry.send_email !== false && entry.email
  );
  const contact = emailable[0] ?? client?.contacts?.[0];
  const recipient = contact?.email ?? '';

  const [designs, setDesigns] = useState<Record<string, string>>({});
  const [designsFailed, setDesignsFailed] = useState(false);
  const [sending, setSending] = useState(false);
  const [askEmail, setAskEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string>();

  const [savingAttachment, setSavingAttachment] =
    useState<AttachmentKey | null>(null);
  const [hasGateway, setHasGateway] = useState<boolean | null>(null);
  const [bankInstructions, setBankInstructions] = useState<string | null>(null);
  const [savingBank, setSavingBank] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    request(
      'GET',
      endpoint('/api/v1/designs?status=active&per_page=100&sort=name|asc'),
      {},
      { skipIntercept: true }
    )
      .then((response) => {
        const map: Record<string, string> = {};

        (response.data.data as { id: string; name: string }[]).forEach(
          (design) => {
            map[design.name] = design.id;
          }
        );

        setDesigns(map);

        if (!wizard.invoice?.design_id) {
          const fallback = LOOKS.map((look) => map[look.design]).find(Boolean);

          if (fallback) {
            wizard.patch({ design_id: fallback });
          }
        }
      })
      .catch(() => setDesignsFailed(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    request(
      'GET',
      endpoint('/api/v1/company_gateways?status=active&per_page=1'),
      {},
      { skipIntercept: true }
    )
      .then((response) => setHasGateway((response.data.data ?? []).length > 0))
      .catch(() => {
        const configured = String(
          company?.settings?.company_gateway_ids ?? ''
        ).replace(/0|,/g, '');

        setHasGateway(configured.length > 0);
      });
  }, []);

  const saveAttachment = (key: AttachmentKey, value: boolean) => {
    if (!company?.id) {
      return;
    }

    setSavingAttachment(key);

    request(
      'PUT',
      endpoint('/api/v1/companies/:id', { id: company.id }),
      { ...company, settings: { ...company.settings, [key]: value } },
      { skipIntercept: true }
    )
      .then((response) =>
        dispatch(updateRecord({ object: 'company', data: response.data.data }))
      )
      .catch(() => toast.error())
      .finally(() => setSavingAttachment(null));
  };

  const deliver = () =>
    wizard.flush().then((id) => {
      if (!id) {
        return Promise.reject(new Error('draft not saved'));
      }

      $refetch(['invoices']);

      navigate(route('/invoices/:id/email', { id }));
    });

  const send = () => {
    if (!recipient) {
      setEmailDraft('');
      setAskEmail(true);
      return;
    }

    setSending(true);

    deliver()
      .catch(() => toast.error())
      .finally(() => setSending(false));
  };

  const saveEmailThenSend = () => {
    if (!client?.id) {
      return;
    }

    const address = emailDraft.trim();

    if (!/^\S+@\S+\.\S+$/.test(address)) {
      setEmailError(t('enter_valid_email_address'));
      return;
    }

    setEmailError(undefined);
    setSavingEmail(true);

    const contacts = (client.contacts ?? []).length
      ? client.contacts.map((entry, index) =>
          index === 0 ? { ...entry, email: address, send_email: true } : entry
        )
      : [
          {
            first_name: client.name,
            last_name: '',
            email: address,
            send_email: true,
          },
        ];

    request(
      'PUT',
      endpoint('/api/v1/clients/:id', { id: client.id }),
      { ...client, contacts, documents: [] },
      { skipIntercept: true }
    )
      .then((response) => {
        const saved = response.data.data as Client;

        wizard.refreshClient(saved);
        wizard.patch({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          invitations: (saved.contacts ?? [])
            .slice(0, 1)
            .map((entry) => ({ client_contact_id: entry.id })) as any,
        });

        $refetch(['clients']);

        return true;
      })
      .catch(() => {
        setEmailError(t('email_address_not_saved'));

        return false;
      })
      .finally(() => setSavingEmail(false))
      .then((stored) => {
        if (!stored) {
          return;
        }

        setAskEmail(false);
        setSending(true);

        return deliver()
          .catch(() => toast.error())
          .finally(() => setSending(false));
      });
  };

  const saveBankInstructions = () => {
    if (!bankInstructions?.trim() || !company?.id) {
      return;
    }

    setSavingBank(true);

    wizard.patch({ terms: bankInstructions.trim() });

    request(
      'PUT',
      endpoint('/api/v1/companies/:id', { id: company.id }),
      {
        ...company,
        settings: {
          ...company.settings,
          invoice_terms: bankInstructions.trim(),
        },
      },
      { skipIntercept: true }
    )
      .then((response) => {
        dispatch(updateRecord({ object: 'company', data: response.data.data }));

        setBankInstructions(null);
        wizard.dismiss('pay');
        toast.success('updated_settings');
      })
      .catch(() => toast.error())
      .finally(() => setSavingBank(false));
  };

  const itemCount = (invoice?.line_items ?? []).filter(
    (item) => item.notes || item.product_key
  ).length;

  const previewable = Boolean(wizard.invoiceId) && Boolean(invoice?.client_id);

  return (
    <div className="iw-enter">
      <ErrorBanner errors={wizard.errors} />

      <p
        className="text-xs mb-2"
        style={{ color: theme.label, fontWeight: 500 }}
      >
        {`${t('invoice')} ${t('summary')}`}
      </p>

      <div
        className="px-4 py-1"
        style={{
          borderRadius: radius.panel,
          backgroundColor: theme.dark ? theme.colors.$25 : theme.colors.$2,
        }}
      >
        <Element
          className="border-b border-dashed"
          leftSide={t('from')}
          pushContentToRight
          withoutWrappingLeftSide
          noExternalPadding
          style={{ borderColor: colors.$20 }}
        >
          {company?.settings?.name || t('company_name')}
        </Element>

        <Element
          className="border-b border-dashed"
          leftSide={t('to')}
          pushContentToRight
          withoutWrappingLeftSide
          noExternalPadding
          style={{ borderColor: colors.$20 }}
        >
          <div>
            <p>{client?.display_name || client?.name || '—'}</p>

            <p className="text-xs mt-0.5" style={{ color: theme.muted }}>
              {recipient || t('no_email_address')}
            </p>
          </div>
        </Element>

        <Element
          className="border-b border-dashed"
          leftSide={t('items')}
          pushContentToRight
          withoutWrappingLeftSide
          noExternalPadding
          style={{ borderColor: colors.$20 }}
        >
          {`${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
        </Element>

        <Element
          className="border-b border-dashed"
          leftSide={t('total')}
          pushContentToRight
          withoutWrappingLeftSide
          noExternalPadding
          style={{ borderColor: colors.$20 }}
        >
          {money(wizard.totals.total)}
        </Element>

        <Element
          leftSide={t('due')}
          pushContentToRight
          withoutWrappingLeftSide
          noExternalPadding
        >
          {invoice?.due_date
            ? invoice.due_date === invoice.date
              ? t('due_on_receipt')
              : dayjs(invoice.due_date).format('D MMMM YYYY')
            : '—'}
        </Element>
      </div>

      <p
        className="text-xs mt-6 mb-2"
        style={{ color: theme.label, fontWeight: 500 }}
      >
        {t('before_you_send')}
      </p>

      <div
        className="border px-4 py-4"
        style={{
          borderColor: theme.line,
          borderRadius: radius.panel,
          backgroundColor: theme.surface,
        }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p
              className="text-[0.8125rem] mb-2.5"
              style={{ color: theme.label, fontWeight: 500 }}
            >
              {t('how_it_looks')}
            </p>

            {designsFailed ? (
              <p className="text-sm" style={{ color: theme.muted }}>
                {t('layouts_could_not_be_loaded')}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {LOOKS.map((look) => {
                  const id = designs[look.design];
                  const active = Boolean(id) && invoice?.design_id === id;

                  return (
                    <button
                      key={look.label}
                      type="button"
                      disabled={!id}
                      onClick={() => wizard.patch({ design_id: id })}
                      className="text-sm px-3.5 py-2 border"
                      style={{
                        borderRadius: radius.control,
                        borderColor: active ? theme.text : theme.line,
                        backgroundColor: active ? theme.hover : theme.surface,
                        color: id ? theme.text : theme.muted,
                        fontWeight: 500,
                        boxShadow: active
                          ? `inset 0 0 0 1px ${theme.text}`
                          : 'none',
                        cursor: id ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {t(look.label)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="shrink-0 space-y-2.5">
            <AttachmentOption
              id="iw-attach-pdf"
              label={t('attach_pdf')}
              checked={Boolean(company?.settings?.pdf_email_attachment)}
              allowed={proPlan() || enterprisePlan()}
              requirement={t('pro_plan')}
              busy={savingAttachment !== null}
              onChange={(value) =>
                saveAttachment('pdf_email_attachment', value)
              }
            />

            <AttachmentOption
              id="iw-attach-documents"
              label={t('attach_documents')}
              checked={Boolean(company?.settings?.document_email_attachment)}
              allowed={enterprisePlan()}
              requirement={t('enterprise_plan')}
              busy={savingAttachment !== null}
              onChange={(value) =>
                saveAttachment('document_email_attachment', value)
              }
            />

            <p className="text-xs" style={{ color: theme.muted }}>
              {t('saved_for_all_future_emails')}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <BrandPrompts />
        </div>
      </div>

      {previewable ? (
        <>
          <div className="mt-6 flex items-center gap-2.5">
            <Checkbox
              id="iw-show-preview"
              checked={showPreview}
              onValueChange={(_, next) => setShowPreview(Boolean(next))}
            />

            <label
              htmlFor="iw-show-preview"
              className="text-sm cursor-pointer"
              style={{ color: theme.text }}
            >
              {t('show_pdf_preview')}
            </label>
          </div>

          {showPreview ? (
            <div
              className="iw-preview mt-3 border overflow-hidden"
              style={{ borderColor: theme.line, borderRadius: radius.panel }}
            >
              <style>
                {'.iw-preview .flex.flex-col.w-full{height:38rem !important;}'}
              </style>

              <InvoicePreview
                for="invoice"
                resource={invoice as Invoice}
                entity="invoice"
                relationType="client_id"
                endpoint="/api/v1/live_preview?entity=:entity"
                initiallyVisible
              />
            </div>
          ) : null}
        </>
      ) : null}

      {hasGateway === false && !wizard.dismissed('pay') ? (
        <div className="mt-8">
          <Callout
            title={t('would_you_like_customers_to_pay_online')}
            onDismiss={() => wizard.dismiss('pay')}
            dismissLabel={t('not_now')}
          >
            {bankInstructions === null ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="secondary"
                  behavior="button"
                  onClick={() => window.open(gatewaysHref, '_blank')}
                >
                  {t('set_up_card_payments')}
                </Button>

                <Button
                  type="secondary"
                  behavior="button"
                  onClick={() => setBankInstructions(invoice?.terms ?? '')}
                >
                  {t('add_bank_transfer_instructions')}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <InputField
                  element="textarea"
                  textareaRows={4}
                  label={t('terms')}
                  placeholder={t('bank_details_placeholder')}
                  value={bankInstructions}
                  changeOverride
                  debounceTimeout={0}
                  onValueChange={setBankInstructions}
                />

                <div className="flex items-center gap-2">
                  <Button
                    behavior="button"
                    disabled={savingBank}
                    onClick={saveBankInstructions}
                  >
                    {t('action_add_to_invoice')}
                  </Button>
                  <Button
                    type="secondary"
                    behavior="button"
                    onClick={() => setBankInstructions(null)}
                  >
                    {t('cancel')}
                  </Button>
                </div>
              </div>
            )}
          </Callout>
        </div>
      ) : null}

      <p className="text-sm mt-8 leading-6" style={{ color: theme.text }}>
        {recipient ? (
          <>
            {reactStringReplace(
              trans('invoice_ready_email_to', { value: ':recipient' }),
              ':recipient',
              () => (
                <strong key="recipient" style={{ fontWeight: 600 }}>
                  {recipient}
                </strong>
              )
            )}
          </>
        ) : (
          <>{t('invoice_ready_ask_where_to_send')}</>
        )}
      </p>

      <Footer
        back={
          <Button
            type="secondary"
            behavior="button"
            disableWithoutIcon
            onClick={wizard.back}
          >
            {t('back')}
          </Button>
        }
      >
        <Button
          type="secondary"
          behavior="button"
          disabled={savingDraft}
          onClick={() => {
            setSavingDraft(true);

            wizard
              .flush()
              .then((id) => {
                if (!id) {
                  toast.error();
                  return;
                }

                toast.success('created_invoice');
                navigate('/invoices');
              })
              .finally(() => setSavingDraft(false));
          }}
        >
          {t('save_draft')}
        </Button>

        <Button behavior="button" disabled={sending} onClick={send}>
          {t('send_invoice')}
        </Button>
      </Footer>

      <Modal
        visible={askEmail}
        onClose={() => setAskEmail(false)}
        title={t('where_should_we_send_this_invoice')}
        size="small"
      >
        <div className="space-y-4">
          <InputField
            id="iw-send-to"
            label={t('email_address')}
            type="email"
            placeholder={t('email_address')}
            value={emailDraft}
            changeOverride
            debounceTimeout={0}
            onValueChange={setEmailDraft}
            errorMessage={emailError}
          />

          <div className="flex items-center gap-2">
            <Button
              behavior="button"
              disabled={savingEmail || sending}
              onClick={saveEmailThenSend}
            >
              {t('save_and_send')}
            </Button>
            <Button
              type="secondary"
              behavior="button"
              onClick={() => setAskEmail(false)}
            >
              {t('cancel')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function AttachmentOption({
  id,
  label,
  checked,
  allowed,
  requirement,
  busy,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  allowed: boolean;
  requirement: string;
  busy: boolean;
  onChange: (value: boolean) => void;
}) {
  const theme = useTheme();
  const disabled = !allowed || busy;

  return (
    <div className="flex items-start gap-2.5">
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onValueChange={(_, next) => onChange(Boolean(next))}
      />

      <label
        htmlFor={id}
        className="text-sm leading-5"
        style={{
          color: allowed ? theme.text : theme.muted,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {label}

        {allowed ? null : (
          <span className="block text-xs" style={{ color: theme.muted }}>
            {requirement}
          </span>
        )}
      </label>
    </div>
  );
}
