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
import { endpoint } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useFreePlanDesigns } from '$app/common/hooks/useFreePlanDesigns';
import { useGetSetting } from '$app/common/hooks/useGetSetting';
import { useRefreshCompanyUsers } from '$app/common/hooks/useRefreshCompanyUsers';
import { updateRecord } from '$app/common/stores/slices/company-users';
import { Client } from '$app/common/interfaces/client';
import { Design } from '$app/common/interfaces/design';
import { Invoice } from '$app/common/interfaces/invoice';
import { InvoicePreview } from '$app/pages/invoices/common/components/InvoicePreview';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHref, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { Button, InputField } from '$app/components/forms';
import { Callout } from './Callout';
import { StepFooter } from './StepFooter';
import { PreviewFrame } from './PreviewFrame';
import { StepTransition } from './StepTransition';
import { Wizard } from '../hooks/useWizard';
import { contactEmail, emailableContact } from '../helpers/client-contact';
import { AttachmentOption } from './AttachmentOption';
import { BrandPrompts } from './BrandPrompts';
import { ClientContactModal } from './ClientContactModal';

const LOOKS = ['Plain', 'Clean', 'Modern', 'Business'];

type AttachmentKey = 'pdf_email_attachment' | 'document_email_attachment';

interface Props {
  wizard: Wizard;
}

export function StepReview({ wizard }: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const company = useCurrentCompany();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const refreshCompanyUsers = useRefreshCompanyUsers();
  const getSetting = useGetSetting();
  const { isOwner } = useAdmin();
  const freePlanDesigns = useFreePlanDesigns();
  const gatewaysHref = useHref('/settings/gateways/create');
  const accountHref = useHref('/settings/account_management');

  const invoice = wizard.invoice;
  const client = wizard.client;
  const recipient = contactEmail(emailableContact(client));

  const defaultDesign =
    (getSetting(client, 'invoice_design_id') as string | undefined) ||
    company?.settings?.invoice_design_id;

  const [designs, setDesigns] = useState<Record<string, string>>({});
  const [designsFailed, setDesignsFailed] = useState(false);
  const [customDefault, setCustomDefault] = useState<Design>();
  const [sending, setSending] = useState(false);
  const [askEmail, setAskEmail] = useState(false);

  const [savingAttachment, setSavingAttachment] =
    useState<AttachmentKey | null>(null);
  const [hasGateway, setHasGateway] = useState<boolean | null>(null);
  const [bankInstructions, setBankInstructions] = useState<string | null>(null);
  const [savingBank, setSavingBank] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  const sendAfterContact = useRef(false);

  useEffect(() => {
    request(
      'GET',
      endpoint(
        '/api/v1/designs?status=active&custom=false&per_page=100&sort=name|asc'
      ),
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
      })
      .catch(() => setDesignsFailed(true));
  }, []);

  useEffect(() => {
    if (
      !defaultDesign ||
      !Object.keys(designs).length ||
      Object.values(designs).includes(defaultDesign)
    ) {
      return;
    }

    let cancelled = false;

    request(
      'GET',
      endpoint('/api/v1/designs?with=:id&per_page=1', { id: defaultDesign }),
      {},
      { skipIntercept: true }
    )
      .then((response) => {
        if (cancelled) {
          return;
        }

        setCustomDefault(response.data.data[0]);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [defaultDesign, designs]);

  const lookUpGateways = useCallback(() => {
    return request(
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
  }, [company?.settings?.company_gateway_ids]);

  useEffect(() => {
    void lookUpGateways();
  }, []);

  useEffect(() => {
    const onFocus = () => {
      void refreshCompanyUsers();
      void lookUpGateways();
    };

    window.addEventListener('focus', onFocus);

    return () => window.removeEventListener('focus', onFocus);
  }, [lookUpGateways]);

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

  const upgrade = () => {
    window.open(accountHref, '_blank');
  };

  const deliver = () => {
    return wizard.flush().then((id) => {
      if (!id) {
        return Promise.reject(new Error('draft not saved'));
      }

      $refetch(['invoices']);

      navigate(route('/invoices/:id/email', { id }));
    });
  };

  const send = () => {
    if (!recipient) {
      sendAfterContact.current = true;
      setAskEmail(true);

      return;
    }

    setSending(true);

    deliver()
      .catch(() => toast.error())
      .finally(() => setSending(false));
  };

  const contactSaved = (saved: Client) => {
    wizard.attachClient(saved);

    if (!sendAfterContact.current) {
      return;
    }

    sendAfterContact.current = false;
    setSending(true);

    deliver()
      .catch(() => toast.error())
      .finally(() => setSending(false));
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

  const previewable = Boolean(invoice?.client_id);

  const activeDesign = invoice?.design_id || defaultDesign;

  const looks = LOOKS.filter((look) => {
    return freePlanDesigns.includes(look) || proPlan() || enterprisePlan();
  }).map((look) => {
    return { id: designs[look], name: look };
  });

  const defaultName =
    Object.keys(designs).find((name) => designs[name] === defaultDesign) ??
    (customDefault?.id === defaultDesign ? customDefault?.name : undefined);

  const choices = defaultName
    ? [
        { id: defaultDesign, name: defaultName },
        ...looks.filter((look) => look.id !== defaultDesign),
      ]
    : looks;

  const chooseDesign = (id: string) => {
    if (invoice?.design_id === id) {
      return;
    }

    wizard.patch({ design_id: id });
  };

  return (
    <StepTransition>
      {previewable ? (
        <div
          id="iw-preview-panel"
          className="border overflow-hidden"
          style={{
            borderColor: colors.$24,
            borderRadius: '0.375rem',
            backgroundColor: colors.$1,
          }}
        >
          <div
            className="px-4 py-4 border-b"
            style={{ borderColor: colors.$24 }}
          >
            <p
              className="text-[0.8125rem] mb-2.5"
              style={{ color: colors.$22, fontWeight: 500 }}
            >
              {t('invoice_design')}
            </p>

            {designsFailed ? (
              <p className="text-sm" style={{ color: colors.$17 }}>
                {t('layouts_could_not_be_loaded')}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {choices.map((choice) => {
                  const id = choice.id;
                  const active = Boolean(id) && activeDesign === id;

                  return (
                    <button
                      key={id || choice.name}
                      type="button"
                      disabled={!id}
                      onClick={() => chooseDesign(id)}
                      className="text-sm px-3.5 py-2 border"
                      style={{
                        borderRadius: '0.375rem',
                        borderColor: active ? colors.$3 : colors.$24,
                        backgroundColor: active ? colors.$25 : colors.$1,
                        color: id ? colors.$3 : colors.$17,
                        fontWeight: 500,
                        boxShadow: active
                          ? `inset 0 0 0 1px ${colors.$3}`
                          : 'none',
                        cursor: id ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {choice.name}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-4 space-y-4">
              <BrandPrompts
                section="name"
                logoSkipped={wizard.dismissed('logo')}
                onSkipLogo={() => wizard.dismiss('logo')}
              />

              <BrandPrompts
                section="brand"
                logoSkipped={wizard.dismissed('logo')}
                onSkipLogo={() => wizard.dismiss('logo')}
              />
            </div>
          </div>

          <PreviewFrame id="iw-preview">
            <InvoicePreview
              for="create"
              resource={invoice as Invoice}
              entity="invoice"
              relationType="client_id"
              endpoint="/api/v1/live_preview?entity=:entity"
              initiallyVisible
            />
          </PreviewFrame>
        </div>
      ) : null}

      <p
        className="text-xs mt-6 mb-2"
        style={{ color: colors.$22, fontWeight: 500 }}
      >
        {t('attachments')}
      </p>

      <div
        className="border px-4 py-4"
        style={{
          borderColor: colors.$24,
          borderRadius: '0.375rem',
          backgroundColor: colors.$1,
        }}
      >
        <AttachmentOption
          label={t('attach_pdf')}
          checked={Boolean(company?.settings?.pdf_email_attachment)}
          allowed={proPlan() || enterprisePlan()}
          requirement={t('attach_pdf_help')}
          busy={savingAttachment !== null}
          onChange={(value) => saveAttachment('pdf_email_attachment', value)}
          onUpgrade={isOwner ? upgrade : undefined}
        />

        {/* <AttachmentOption
          label={t('attach_documents')}
          checked={Boolean(company?.settings?.document_email_attachment)}
          allowed={enterprisePlan()}
          requirement={t('enterprise_plan')}
          busy={savingAttachment !== null}
          onChange={(value) =>
            saveAttachment('document_email_attachment', value)
          }
          onUpgrade={isOwner ? upgrade : undefined}
        /> */}
      </div>

      {hasGateway === false && !wizard.dismissed('pay') ? (
        <div className="mt-8">
          <Callout
            title={t('would_you_like_customers_to_pay_online')}
            onDismiss={() => wizard.dismiss('pay')}
            dismissLabel={t('no_not_now')}
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

      {!recipient ? (
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <span className="text-sm" style={{ color: colors.$3 }}>
            {t('client_email_not_set')}
          </span>

          <Button
            type="minimal"
            behavior="button"
            onClick={() => setAskEmail(true)}
          >
            {t('contact_details')}
          </Button>
        </div>
      ) : null}

      <StepFooter
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
          {t('email_invoice')}
        </Button>
      </StepFooter>

      <ClientContactModal
        open={askEmail}
        client={client}
        onClose={() => {
          sendAfterContact.current = false;
          setAskEmail(false);
        }}
        onSaved={contactSaved}
      />
    </StepTransition>
  );
}
