/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { updateRecord } from '$app/common/stores/slices/company-users';
import { Client } from '$app/common/interfaces/client';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Action,
  Callout,
  Question,
  Sheet,
  Spinner,
  TextArea,
  TextField,
  useTheme,
  radius,
} from '../kit';
import { Wizard } from '../useWizard';

const LOOKS: { label: string; design: string }[] = [
  { label: 'Clean', design: 'Clean' },
  { label: 'Modern', design: 'Modern' },
  { label: 'Traditional', design: 'Plain' },
];

interface Props {
  wizard: Wizard;
  money: (value: number) => string;
}

export function StepReview({ wizard, money }: Props) {
  const t = useTheme();
  const company = useCurrentCompany();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const invoice = wizard.invoice;
  const client = wizard.client;
  const contact = client?.contacts?.[0];
  const recipient = contact?.email ?? '';

  const [designs, setDesigns] = useState<Record<string, string>>({});
  const [designsFailed, setDesignsFailed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string>('');
  const [askEmail, setAskEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string>();

  const [emailPreview, setEmailPreview] = useState<string | null>(null);
  const [loadingEmailPreview, setLoadingEmailPreview] = useState(false);

  const [hasGateway, setHasGateway] = useState<boolean | null>(null);
  const [payDismissed, setPayDismissed] = useState(false);
  const [bankInstructions, setBankInstructions] = useState<string | null>(null);
  const [savingBank, setSavingBank] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

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
      .catch(() => setHasGateway(null));
  }, []);

  async function send() {
    if (!recipient) {
      setEmailDraft('');
      setAskEmail(true);
      return;
    }

    setSending(true);

    try {
      await deliver(recipient);
    } catch {
      toast.error();
    } finally {
      setSending(false);
    }
  }

  async function deliver(address: string) {
    const id = await wizard.flush();

    if (!id) {
      throw new Error('draft not saved');
    }

    await request(
      'POST',
      endpoint('/api/v1/invoices/bulk'),
      { action: 'email', ids: [id] },
      { skipIntercept: true }
    );

    setSentTo(address);
    wizard.markSent();

    $refetch(['invoices']);
  }

  async function saveEmailThenSend() {
    if (!client?.id) {
      return;
    }

    const address = emailDraft.trim();

    if (!/^\S+@\S+\.\S+$/.test(address)) {
      setEmailError('Enter an email address we can deliver to.');
      return;
    }

    setEmailError(undefined);
    setSavingEmail(true);

    let saved: Client;

    try {
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

      const response = await request(
        'PUT',
        endpoint('/api/v1/clients/:id', { id: client.id }),
        { ...client, contacts, documents: [] },
        { skipIntercept: true }
      );

      saved = response.data.data as Client;

      wizard.refreshClient(saved);
      wizard.patch({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        invitations: (saved.contacts ?? [])
          .slice(0, 1)
          .map((entry) => ({ client_contact_id: entry.id })) as any,
      });

      $refetch(['clients']);
    } catch {
      setEmailError("We couldn't save that address. Try again.");

      return;
    } finally {
      setSavingEmail(false);
    }

    setAskEmail(false);
    setSending(true);

    try {
      await deliver(saved.contacts?.[0]?.email ?? address);
    } catch {
      toast.error();
    } finally {
      setSending(false);
    }
  }

  async function openEmailPreview() {
    const id = wizard.invoiceId ?? (await wizard.flush());

    if (!id) {
      return;
    }

    setLoadingEmailPreview(true);
    setEmailPreview('');

    try {
      const response = await request(
        'POST',
        endpoint('/api/v1/templates'),
        {
          entity: 'invoice',
          entity_id: id,
          template: 'email_template_invoice',
          subject: '',
          body: '',
        },
        { skipIntercept: true }
      );

      const { body, wrapper, subject } = response.data as {
        body: string;
        wrapper: string;
        subject: string;
      };

      setEmailPreview(
        `<div style="font:14px/1.6 -apple-system,Segoe UI,sans-serif;padding:12px 16px;border-bottom:1px solid #e4e4e7;color:#3f3f46"><strong>Subject:</strong> ${escapeHtml(
          subject
        )}</div>${(wrapper || '$body').replace('$body', body)}`
      );
    } catch {
      setEmailPreview(null);
      toast.error();
    } finally {
      setLoadingEmailPreview(false);
    }
  }

  async function saveBankInstructions() {
    if (!bankInstructions?.trim() || !company?.id) {
      return;
    }

    setSavingBank(true);

    try {
      wizard.patch({ terms: bankInstructions.trim() });

      const response = await request(
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
      );

      dispatch(updateRecord({ object: 'company', data: response.data.data }));

      setBankInstructions(null);
      setPayDismissed(true);
      toast.success('updated_settings');
    } catch {
      toast.error();
    } finally {
      setSavingBank(false);
    }
  }

  if (wizard.sent) {
    return (
      <div className="iw-enter">
        <Question
          lede={
            sentTo
              ? `We emailed it to ${sentTo}. You'll see it marked as sent in your invoice list.`
              : "You'll see it marked as sent in your invoice list."
          }
        >
          Invoice sent.
        </Question>

        <div className="flex flex-wrap items-center gap-2">
          <Action
            tone="solid"
            onClick={() => navigate(`/invoices/${wizard.invoiceId}/edit`)}
          >
            View invoice
          </Action>

          <Action onClick={() => window.location.reload()}>
            Create another
          </Action>

          <Action tone="quiet" onClick={() => navigate('/invoices')}>
            All invoices
          </Action>
        </div>
      </div>
    );
  }

  const itemCount = (invoice?.line_items ?? []).filter(
    (item) => item.notes || item.product_key
  ).length;

  return (
    <div className="iw-enter">
      <Question>Preview and send</Question>

      <dl
        className="border divide-y"
        style={{
          borderColor: t.line,
          borderRadius: radius.panel,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ['--tw-divide-opacity' as any]: 1,
        }}
      >
        <Row label="From" value={company?.settings?.name || 'Your business'} />
        <Row
          label="Bill to"
          value={client?.display_name || client?.name || '—'}
          detail={recipient || 'No email address yet'}
        />
        <Row
          label="Items"
          value={`${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
        />
        <Row label="Total" value={money(wizard.totals.total)} emphasis />
        <Row
          label="Due"
          value={
            invoice?.due_date
              ? invoice.due_date === invoice.date
                ? 'On receipt'
                : dayjs(invoice.due_date).format('D MMMM YYYY')
              : '—'
          }
        />
      </dl>

      <div className="mt-6">
        <p
          className="text-[0.8125rem] mb-2.5"
          style={{ color: t.label, fontWeight: 500 }}
        >
          How it looks
        </p>

        {designsFailed ? (
          <p className="text-sm" style={{ color: t.muted }}>
            We couldn't load the layouts. Your invoice uses your usual one.
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
                    borderColor: active ? t.text : t.line,
                    backgroundColor: active ? t.hover : t.surface,
                    color: id ? t.text : t.muted,
                    fontWeight: 500,
                    boxShadow: active ? `inset 0 0 0 1px ${t.text}` : 'none',
                    cursor: id ? 'pointer' : 'not-allowed',
                  }}
                >
                  {look.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-sm mt-8 leading-6" style={{ color: t.text }}>
        {recipient ? (
          <>
            Your invoice is ready. We'll email it to{' '}
            <strong style={{ fontWeight: 600 }}>{recipient}</strong>.
          </>
        ) : (
          <>
            Your invoice is ready. We'll ask where to send it when you hit send.
          </>
        )}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Action tone="solid" busy={sending} onClick={send}>
          Send invoice
        </Action>

        <Action busy={loadingEmailPreview} onClick={openEmailPreview}>
          Preview email
        </Action>

        <Action
          tone="quiet"
          busy={savingDraft}
          onClick={async () => {
            setSavingDraft(true);

            const id = await wizard.flush();

            setSavingDraft(false);

            if (!id) {
              toast.error();
              return;
            }

            toast.success('created_invoice');
            navigate('/invoices');
          }}
        >
          Save draft
        </Action>
      </div>

      <div className="mt-3">
        <Action tone="quiet" onClick={wizard.back}>
          Back
        </Action>
      </div>

      {hasGateway === false && !payDismissed ? (
        <div className="mt-8">
          <Callout
            title="Would you like customers to pay online?"
            onDismiss={() => setPayDismissed(true)}
            dismissLabel="Not now"
          >
            {bankInstructions === null ? (
              <div className="flex flex-wrap items-center gap-2">
                <Action
                  tone="outline"
                  onClick={() =>
                    window.open('/settings/gateways/create', '_blank')
                  }
                >
                  Set up card payments
                </Action>

                <Action tone="outline" onClick={() => setBankInstructions('')}>
                  Add bank transfer instructions
                </Action>
              </div>
            ) : (
              <div className="space-y-3">
                <TextArea
                  rows={3}
                  autoFocus
                  placeholder={
                    'Bank: Example Bank\nAccount: 12345678\nSort code: 00-00-00'
                  }
                  value={bankInstructions}
                  onChange={(event) => setBankInstructions(event.target.value)}
                  hint="These appear on this invoice and on future ones."
                />

                <div className="flex items-center gap-2">
                  <Action
                    tone="solid"
                    busy={savingBank}
                    onClick={saveBankInstructions}
                  >
                    Add to invoice
                  </Action>
                  <Action
                    tone="quiet"
                    onClick={() => setBankInstructions(null)}
                  >
                    Cancel
                  </Action>
                </div>
              </div>
            )}
          </Callout>
        </div>
      ) : null}

      <Sheet
        open={askEmail}
        onClose={() => setAskEmail(false)}
        title="Where should we send this invoice?"
      >
        <div className="space-y-4">
          <TextField
            label="Email address"
            type="email"
            autoFocus
            placeholder="jane@example.com"
            value={emailDraft}
            onChange={(event) => setEmailDraft(event.target.value)}
            onKeyDown={(event) =>
              event.key === 'Enter' && void saveEmailThenSend()
            }
            error={emailError}
            hint={`We'll save this to ${client?.display_name || client?.name}'s record.`}
          />

          <div className="flex items-center gap-2">
            <Action
              tone="solid"
              busy={savingEmail || sending}
              onClick={saveEmailThenSend}
            >
              Save and send
            </Action>
            <Action tone="quiet" onClick={() => setAskEmail(false)}>
              Cancel
            </Action>
          </div>
        </div>
      </Sheet>

      <Sheet
        open={emailPreview !== null}
        onClose={() => setEmailPreview(null)}
        title="What your customer receives"
        width="40rem"
      >
        {emailPreview ? (
          <iframe
            title="Email preview"
            srcDoc={emailPreview}
            style={{
              width: '100%',
              height: '30rem',
              border: `1px solid ${t.line}`,
              borderRadius: radius.control,
              backgroundColor: '#ffffff',
            }}
          />
        ) : (
          <div className="flex items-center justify-center gap-2 py-10">
            <Spinner tone={t.muted} />
            <span className="text-sm" style={{ color: t.muted }}>
              Loading
            </span>
          </div>
        )}
      </Sheet>
    </div>
  );
}

function Row({
  label,
  value,
  detail,
  emphasis,
}: {
  label: string;
  value: string;
  detail?: string;
  emphasis?: boolean;
}) {
  const t = useTheme();

  return (
    <div
      className="flex items-baseline justify-between gap-4 px-4 py-3"
      style={{ borderColor: t.hairline }}
    >
      <dt className="text-sm shrink-0" style={{ color: t.muted }}>
        {label}
      </dt>

      <dd className="text-right min-w-0">
        <span
          className={emphasis ? 'text-base' : 'text-sm'}
          style={{
            color: t.text,
            fontWeight: emphasis ? 600 : 500,
            fontVariantNumeric: emphasis ? 'tabular-nums' : undefined,
          }}
        >
          {value}
        </span>

        {detail ? (
          <span className="block text-xs mt-0.5" style={{ color: t.muted }}>
            {detail}
          </span>
        ) : null}
      </dd>
    </div>
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
