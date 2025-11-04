/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { docuNinjaAtom } from '$app/common/atoms/docuninja';
import { useColorScheme } from '$app/common/colors';
import { route, routeWithOrigin } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Client } from '$app/common/interfaces/client';
import { useClientsQuery } from '$app/common/queries/clients';
import { Alert } from '$app/components/Alert';
import { Page } from '$app/components/Breadcrumbs';
import { Card } from '$app/components/cards';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import {
  Button,
  InputField,
  InputLabel,
  SelectField,
} from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { Icon } from '$app/components/icons/Icon';
import { Settings } from '$app/components/icons/Settings';
import { Default } from '$app/components/layouts/Default';
import { Modal } from '$app/components/Modal';
import { Spinner } from '$app/components/Spinner';
import {
  AlertProps,
  Builder as Builder$,
  BuilderContext,
  ConfirmationDialogButtonProps,
  ConfirmationDialogProps,
  CreateClientTabProps,
  CreateDialogProps,
  CreateDialogTabButtonProps,
  DeleteDialogButtonProps,
  DeleteDialogProps,
  Document,
  SendDialogButtonProps,
  SendDialogProps,
  SignatorySelectorProps,
  ToolboxContextProps,
  UninviteDialogButtonProps,
  UninviteDialogProps,
  UploadDialogProps,
  UploadProps,
  ValidationErrorsProps,
} from '@docuninja/builder2.0';
import collect from 'collect.js';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { Check } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { MdSend } from 'react-icons/md';
import { useMediaQuery } from 'react-responsive';
import { useParams } from 'react-router-dom';
import { DocumentStatus } from '$app/common/interfaces/docuninja/api';
import { FaFileSignature } from 'react-icons/fa';

function Loading() {
  return (
    <div className="flex justify-center items-center py-6 sm:py-8 px-4 sm:px-6">
      <Spinner />
    </div>
  );
}

function SendDialog({ open, onOpenChange, content, action }: SendDialogProps) {
  const [t] = useTranslation();

  return (
    <Modal title={t('send_confirmation')} visible={open} onClose={onOpenChange}>
      {content}

      {action}
    </Modal>
  );
}

function SendDialogButton({ isSubmitting }: SendDialogButtonProps) {
  const [t] = useTranslation();

  return (
    <Button
      className="w-full"
      behavior="button"
      disabled={isSubmitting}
      onClick={() =>
        window.dispatchEvent(new CustomEvent('builder:send.document.submit'))
      }
      disableWithoutIcon
    >
      {t('send')}
    </Button>
  );
}

function DeleteDialog({ open, onOpenChange, action }: DeleteDialogProps) {
  const [t] = useTranslation();

  return (
    <Modal title={t('delete_document')} visible={open} onClose={onOpenChange}>
      <p>{t('delete_docuninja_document_confirmation')}</p>

      {action}
    </Modal>
  );
}

function DeleteButton({ isSubmitting }: DeleteDialogButtonProps) {
  const [t] = useTranslation();

  return (
    <Button disabled={isSubmitting} className="w-full">
      {t('delete')}
    </Button>
  );
}

function Upload({ ...props }: UploadProps) {
  const [t] = useTranslation();

  return (
    <Button behavior="button" type="secondary" {...props} className="w-full">
      {t('upload')}
    </Button>
  );
}

function UploadDialog({ open, onOpenChange, content }: UploadDialogProps) {
  const [t] = useTranslation();

  return (
    <Modal
      title={t('upload_document')}
      visible={open}
      onClose={onOpenChange}
      size="small"
    >
      {content}
    </Modal>
  );
}

function ValidationErrors({ content }: ValidationErrorsProps) {
  return <Alert>{content}</Alert>;
}

function ConfirmationDialog({
  isOpen,
  onOpenChange,
  content,
  action,
}: ConfirmationDialogProps) {
  return (
    <Modal title="Confirmation" visible={isOpen} onClose={onOpenChange}>
      {content}
      {action}
    </Modal>
  );
}

function ConfirmationDialogButton({ ...props }: ConfirmationDialogButtonProps) {
  const [t] = useTranslation();

  return (
    <Button behavior="button" {...props}>
      {t('confirm')}
    </Button>
  );
}

export function CreateDialog({
  open,
  onOpenChange,
  client,
}: CreateDialogProps) {
  const [t] = useTranslation();
  return (
    <Modal
      title={t('create_client')}
      visible={open}
      onClose={onOpenChange}
      withoutHorizontalPadding
      withoutVerticalMargin
    >
      <div className="pt-3">
        <div className="px-4 sm:px-6 pt-2">{client}</div>
      </div>
    </Modal>
  );
}

function CreateClientForm({ fields, errors }: CreateClientTabProps) {
  const [t] = useTranslation();

  return (
    <>
      {fields.map((field) => (
        <div key={field.name} className="mb-4">
          <InputField
            label={t(field.name)}
            errorMessage={errors?.errors[field.name]}
            onValueChange={field.onValueChange}
          />
        </div>
      ))}
    </>
  );
}

function CreateUserForm({ fields, errors }: CreateClientTabProps) {
  const [t] = useTranslation();

  return (
    <>
      {fields.map((field) => (
        <div key={field.name} className="mb-4">
          <InputField
            label={t(field.name)}
            errorMessage={errors?.errors[field.name]}
            onValueChange={field.onValueChange}
          />
        </div>
      ))}
    </>
  );
}

function CreateDialogTabButton({
  form,
  isSubmitting,
}: CreateDialogTabButtonProps) {
  const [t] = useTranslation();

  return (
    <Button
      form={form}
      behavior="submit"
      disabled={isSubmitting}
      className="w-full"
    >
      {t('create')}
    </Button>
  );
}

function SignatorySelector({
  results,
  onSelect,
  setCreateDialogOpen,
  signatories,
}: SignatorySelectorProps) {
  const [t] = useTranslation();

  const { data: clients } = useClientsQuery({ status: ['active'] });

  const handleSelect = (v: string | undefined) => {
    if (!v) {
      return;
    }

    if (v.startsWith('user')) {
      // In this case we're working with users directly from DocuNinja.

      const [, value] = v.split('|');

      const user = collect(results).firstWhere(
        'value',
        value
      ) as SignatorySelectorProps['results'][number];

      if (user) {
        onSelect(value, 'user', user.entity);
      }

      return;
    }

    if (v === 'create') {
      setCreateDialogOpen(true);

      return;
    }

    // In this case we're handling Invoice Ninja clients.

    const [, value] = v.split('|');

    let entity = clients?.find(
      (client) => client.contacts?.[0]?.contact_key === value
    );

    if (!entity) {
      entity = results.find((r: any) => r.value === value) as unknown as any;
    }

    if (!entity) {
      return;
    }

    const contact = transformToContact(entity as Client);

    if (!contact) {
      return;
    }

    const transformed = transformToPayload(entity, value);

    onSelect(
      `contact|${transformed.contact_key}`,
      'contact',
      contact as any,
      transformed
    );
  };

  const existing = collect(signatories).pluck('id').toArray();

  const existingKeys = collect(signatories)
    .filter((s) => s.metadata !== undefined)
    .map((s) => s.metadata?.contact_key)
    .toArray();

  const list = collect(clients)
    .filter(
      (client) =>
        client.contacts.length > 0 && client.contacts[0].contact_key.length > 0
    )
    .filter((client) => !existingKeys.includes(client.contacts[0].contact_key))
    .map((client) => ({
      label: client.name,
      value: `contact|${client.contacts[0].contact_key}`,
    }))
    .filter((client) => !existing.includes(client.value))
    .toArray() as { label: string; value: string }[];

  const users = collect(results)
    .filter((user) => user.type === 'user')
    .map((user) => ({
      ...user,
      value: `user|${user.value}`,
    }))
    .all();

  return (
    <div className="space-y-3">
      <InputLabel className="mt-3">{t('select_user_or_client')}</InputLabel>

      <SelectField
        placeholder={t('select_user_or_client')}
        onValueChange={handleSelect}
        customSelector
        menuPosition="fixed"
        clearAfterSelection
        className="-mt-2"
      >
        <option value="create">
          <b>&mdash; {t('create_client')} &mdash;</b>
        </option>

        {list.map((client) => (
          <option key={client.value} value={client.value}>
            {client.label}
          </option>
        ))}

        <option disabled>
          <b>&mdash; {t('users')} &mdash;</b>
        </option>

        {users.map((user) => (
          <option key={user.value} value={user.value}>
            {user.label}
          </option>
        ))}
      </SelectField>
    </div>
  );
}

function UninviteDialog({
  open,
  onOpenChange,
  content,
  action,
}: UninviteDialogProps) {
  const [t] = useTranslation();

  return (
    <Modal
      title={t('remove_invitations')}
      visible={open}
      onClose={onOpenChange}
    >
      {content}
      {action}
    </Modal>
  );
}

function UninviteButton({ isSubmitting, form }: UninviteDialogButtonProps) {
  return (
    <Button form={form} disabled={isSubmitting}>
      Continue
    </Button>
  );
}

function ToolboxContext({ options }: ToolboxContextProps) {
  const [t] = useTranslation();

  return (
    <Dropdown
      customLabel={
        <span>
          <Settings />
        </span>
      }
    >
      {options?.map((option, i) =>
        option.children.length > 0 ? (
          <>
            {option.children.map((child, j) => (
              <DropdownElement
                key={`${i}-${j}`}
                value={child.value}
                onClick={child.onSelect}
              >
                <div className="flex items-center gap-2">
                  {t(child.label) || child.label}

                  {option.value === child.value ? <Check size={18} /> : null}
                </div>
              </DropdownElement>
            ))}
          </>
        ) : (
          <DropdownElement
            key={i}
            value={option.value}
            onClick={() =>
              option.type !== 'toggle' ? option.onSelect(option.value) : null
            }
          >
            <div className="flex items-center gap-2">
              {option.type === 'toggle' ? (
                <Toggle
                  checked={option.value as boolean}
                  onValueChange={option.onSelect}
                />
              ) : null}

              {t(option.label) || option.label}
            </div>
          </DropdownElement>
        )
      )}
    </Dropdown>
  );
}

export function Alertbox({ children }: AlertProps) {
  return (
    <Alert className="m-5" type="danger">
      {children}
    </Alert>
  );
}

function Builder() {
  const [t] = useTranslation();

  const { id } = useParams();

  const colors = useColorScheme();

  const docuninjaAccount = useAtomValue(docuNinjaAtom);

  const [entity, setEntity] = useState<Document | null>(null);
  const [isDocumentSaving, setIsDocumentSaving] = useState<boolean>(false);
  const [isDocumentSending, setIsDocumentSending] = useState<boolean>(false);

  const isSmallScreen = useMediaQuery({ query: '(max-width: 640px)' });

  const pages: Page[] = [
    { name: t('documents'), href: '/documents' },
    {
      name: entity?.description || t('edit'),
      href: route('/documents/:id/builder', { id }),
    },
  ];

  const handleSave = () => {
    toast.processing();

    setIsDocumentSaving(true);
    window.dispatchEvent(new CustomEvent('builder:save'));
  };

  const handleSend = () => {
    window.dispatchEvent(new CustomEvent('builder:open.send.confirmation'));
  };

  const doesDocumentHaveSignatories = () => {
    const rectangles =
      entity?.files?.flatMap((file) => file.metadata?.rectangles ?? []) ?? [];

    return rectangles.length > 0;
  };

  const getDocuNinjaCompany = () => {
    return docuninjaAccount?.companies?.find(
      (company) => company.id === localStorage.getItem('DOCUNINJA_COMPANY_ID')
    );
  };

  const getInvitationId = () => {
    const currentInvitationIndex = entity?.invitations?.findIndex(
      (invitation) => invitation.user_id === docuninjaAccount?.id
    ) as unknown as number;

    if (currentInvitationIndex === -1) {
      return null;
    }

    const currentInvitation = entity?.invitations?.[currentInvitationIndex];

    if (!entity?.invitations?.[currentInvitationIndex]?.client_contact_id) {
      return currentInvitation?.id;
    }

    return null;
  };

  useEffect(() => {
    const refetchDocuninjaDocument = () => {
      $refetch(['docuninja_documents', 'docuninja_document_timeline']);
    };

    const handleSuccessfullySavedDocument = () => {
      toast.success('updated_document');
      $refetch(['docuninja_documents', 'docuninja_document_timeline']);
    };

    const handleFinalizeDocumentSave = () => {
      setIsDocumentSaving(false);
    };

    window.addEventListener(
      'refetch.docuninja.document',
      refetchDocuninjaDocument
    );

    window.addEventListener(
      'builder:document.successfully.saved',
      handleSuccessfullySavedDocument
    );

    window.addEventListener(
      'builder:document.finalize.save',
      handleFinalizeDocumentSave
    );

    return () => {
      window.removeEventListener(
        'refetch.docuninja.document',
        refetchDocuninjaDocument
      );

      window.removeEventListener(
        'builder:document.successfully.saved',
        handleSuccessfullySavedDocument
      );

      window.removeEventListener(
        'builder:document.finalize.save',
        handleFinalizeDocumentSave
      );
    };
  }, []);

  return (
    <Default
      title={t('edit_document')}
      breadcrumbs={pages}
      navigationTopRight={
        <div className="flex items-center gap-2">
          {getInvitationId() && (
            <Button
              type="secondary"
              behavior="button"
              onClick={() =>
                window.open(
                  routeWithOrigin(
                    '/documents/sign/:document/:invitation?sig=:sig&company=:company',
                    {
                      document: id,
                      invitation: getInvitationId(),
                      sig: getInvitationId(),
                      company: getDocuNinjaCompany()?.id,
                    }
                  ),
                  '_blank'
                )
              }
              disabled={isDocumentSaving || isDocumentSending}
              disableWithoutIcon
            >
              <div>
                <Icon element={FaFileSignature} />
              </div>

              <span>{t('sign')}</span>
            </Button>
          )}

          {Boolean(
            entity &&
              (entity as Document)?.status_id <= DocumentStatus.Sent &&
              doesDocumentHaveSignatories()
          ) && (
            <Button
              type="secondary"
              behavior="button"
              onClick={handleSend}
              disabled={isDocumentSaving || isDocumentSending}
              disableWithoutIcon
            >
              <div>
                <Icon element={MdSend} />
              </div>

              <span>{t('send')}</span>
            </Button>
          )}
          <Button
            behavior="button"
            onClick={handleSave}
            disabled={isDocumentSaving}
            disableWithoutIcon
          >
            {t('save')}
          </Button>
        </div>
      }
    >
      <Card
        className="shadow-sm"
        style={{ borderColor: colors.$24 }}
        withoutBodyPadding
      >
        {/* @ts-expect-error It's safe */}
        <BuilderContext.Provider
          value={{
            token: localStorage.getItem('X-DOCU-NINJA-TOKEN') as string,
            document: id as string,
            components: {
              skeleton: Loading,
              createBlueprintSignatory: () => null,
              save: () => null,
              send: {
                trigger: () => null,
                dialog: SendDialog,
                button: SendDialogButton,
              },
              delete: {
                dialog: DeleteDialog,
                button: DeleteButton,
              },
              upload: {
                trigger: Upload,
                dialog: UploadDialog,
              },
              confirmation: {
                dialog: ConfirmationDialog,
                button: ConfirmationDialogButton,
              },
              createSignatory: {
                dialog: CreateDialog,
                client: {
                  form: CreateClientForm,
                  button: CreateDialogTabButton,
                },
                user: {
                  form: CreateUserForm,
                  button: CreateDialogTabButton,
                },
              },
              signatorySelector: SignatorySelector,
              signatorySwap: () => null,
              uninvite: {
                dialog: UninviteDialog,
                button: UninviteButton,
              },
              validationErrors: ValidationErrors,
              sign: () => null,
              toolboxContext: ToolboxContext,
              helper: () => null,
              alert: Alertbox,
            },
            styles: {
              frame: {
                backgroundColor: colors.$1,
                borderBottom: `1px solid ${colors.$24}`,
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: 0,
                paddingBottom: 0,
                borderTopLeftRadius: '0.375rem',
                borderTopRightRadius: '0.375rem',
                height: 'max-content',
              },
              border: colors.$24,
              childrenWrapper: {
                paddingLeft: isSmallScreen ? '1rem' : '1.5rem',
                paddingRight: isSmallScreen ? '1rem' : '1.5rem',
                paddingTop: '2rem',
                paddingBottom: '3rem',
              },
              title: {
                paddingLeft: isSmallScreen ? '1rem' : '1.5rem',
                paddingRight: isSmallScreen ? '1rem' : '1.5rem',
                paddingTop: '1.25rem',
                paddingBottom: '1.25rem',
                marginTop: 0,
                fontSize: '1.125rem',
                fontWeight: 500,
                lineHeight: '1.5rem',
              },
              signatories: {
                title: {
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: colors.$22,
                },
                panel: {
                  marginBottom: '0.5rem',
                },
              },
            },
            options: {
              header: {
                sticky: false,
              },
            },
            endpoint: import.meta.env.VITE_DOCUNINJA_API_URL as string,
            events: {
              onMessage: (message) => toast.success(message),
              onMessageDismiss: () => toast.dismiss(),
            },
            invoiceninja: true,
            company:
              (localStorage.getItem('DOCUNINJA_COMPANY_ID') as string) ||
              undefined,
            readonly: false,
            onEntityReady: (entity) => setEntity(entity as Document),
          }}
        >
          <Builder$ />
        </BuilderContext.Provider>
      </Card>
    </Default>
  );
}

function transformToContact(client: Client) {
  if (client.contacts.length === 0) {
    toast.error('Error: Client has no contacts. Please add a contact first.');

    return null;
  }

  const contact = client.contacts[0];

  return {
    id: `contact|${contact.contact_key}`,
    user_id: client.user_id ?? null,
    company_id: null,
    client_id: client.id,
    first_name: contact.first_name ?? null,
    last_name: contact.last_name ?? null,
    phone: contact.phone ?? null,
    email: contact.email ?? null,
    signature_base64: null,
    initials_base64: null,
    email_verified_at: null,
    is_primary: Boolean(contact.is_primary),
    last_login: null,
    created_at: '',
    updated_at: '',
    deleted_at: null,
    e_signature: null,
    e_initials: null,
    client: {
      id: client.id,
      user_id: client.user_id,
      company_id: null,
      name: client.name ?? null,
      website: client.website ?? null,
      private_notes: client.private_notes ?? null,
      public_notes: client.public_notes ?? null,
      logo: null,
      phone: client.phone ?? null,
      balance: client.balance ?? 0,
      paid_to_date: client.paid_to_date ?? 0,
      currency_id: client.settings?.currency_id
        ? Number(client.settings.currency_id)
        : null,
      address1: client.address1 ?? null,
      address2: client.address2 ?? null,
      city: client.city ?? null,
      state: client.state ?? null,
      postal_code: client.postal_code ?? null,
      country_id: client.country_id ? Number(client.country_id) : null,
      is_deleted: Boolean(client.is_deleted),
      vat_number: client.vat_number ?? null,
      id_number: client.id_number ?? null,
      created_at: '',
      updated_at: '',
      deleted_at: null,
    },
  };
}

function transformToPayload(client: Client, contact: string) {
  return {
    ...client,
    contact_key: contact,
  };
}

export default Builder;
