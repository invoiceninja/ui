import { useColorScheme } from '$app/common/colors';
import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Document } from '$app/common/interfaces/docuninja/api';
import { Blueprint } from '$app/common/interfaces/docuninja/blueprints';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { useClientsQuery } from '$app/common/queries/clients';
import { useBlueprintQuery } from '$app/common/queries/docuninja/blueprints';
import { Alert } from '$app/components/Alert';
import { Page } from '$app/components/Breadcrumbs';
import { Card } from '$app/components/cards';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Button, InputField, SelectField } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { Settings } from '$app/components/icons/Settings';
import { Default } from '$app/components/layouts/Default';
import { Modal } from '$app/components/Modal';
import { Spinner } from '$app/components/Spinner';
import { TabGroup } from '$app/components/TabGroup';
import {
  Builder as Builder$,
  BuilderContext,
  ConfirmationDialogButtonProps,
  ConfirmationDialogProps,
  CreateClientTabProps,
  CreateDialogProps,
  CreateDialogTabButtonProps,
  DeleteDialogButtonProps,
  DeleteDialogProps,
  SendDialogButtonProps,
  SendDialogProps,
  SignatorySelectorProps,
  ToolboxContextProps,
  UninviteDialogButtonProps,
  UninviteDialogProps,
  UploadDialogProps,
  UploadProps,
  ValidationErrorsProps,
  CreateBlueprintSignatoryProps,
} from '@docuninja/builder2.0';
import { useEffect, useState } from 'react';
import { Check } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useMediaQuery } from 'react-responsive';
import { useNavigate, useParams } from 'react-router-dom';

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
    <Modal
      title={t('send_confirmation_description')}
      visible={open}
      onClose={onOpenChange}
    >
      {content}

      <div
        onClick={(event) => {
          event.stopPropagation();

          window.dispatchEvent(new CustomEvent('builder:send.document.submit'));
        }}
      >
        {action}
      </div>
    </Modal>
  );
}

function SendDialogButton({ isSubmitting }: SendDialogButtonProps) {
  const [t] = useTranslation();

  const params = useParams();

  const { data: document } = useQuery({
    queryKey: ['/api/blueprints', params.id],
    queryFn: () =>
      request(
        'GET',
        docuNinjaEndpoint(
          `/api/blueprints/${params.id}?includeUrl&includePreviews`
        ),
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      ).then(
        (response: GenericSingleResourceResponse<Document>) =>
          response.data.data
      ),
    refetchOnWindowFocus: false,
    initialData: null,
  });

  const handleSend = async () => {
    if (!document) {
      toast.error('document_not_found');
      return;
    }

    toast.processing();

    request(
      'POST',
      docuNinjaEndpoint(`/api/blueprints/${document.id}/send`),
      {
        invitations: document.invitations || [],
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
        },
      }
    ).then(() => {
      toast.success('document_queued_for_sending');
      $refetch(['blueprints']);
    });
  };

  return (
    <Button
      className="w-full"
      behavior="button"
      disabled={isSubmitting}
      onClick={handleSend}
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
    <Button behavior="button" disabled={isSubmitting} className="w-full">
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
  user,
}: CreateDialogProps) {
  const [t] = useTranslation();
  return (
    <Modal
      title={t('create_client_or_user')}
      visible={open}
      onClose={onOpenChange}
      withoutHorizontalPadding
      withoutVerticalMargin
    >
      <TabGroup
        tabs={[t('client'), t('user')]}
        withHorizontalPadding
        horizontalPaddingWidth="1.5rem"
        width="full"
        className="pt-3"
      >
        <div className="px-4 sm:px-6 pt-2">{client}</div>
        <div className="px-4 sm:px-6 pt-2">{user}</div>
      </TabGroup>
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
  value,
  setCreateDialogOpen,
}: SignatorySelectorProps) {
  const [t] = useTranslation();

  const { data: clients } = useClientsQuery({ status: ['active'] });

  const handleSelect = (v: string | undefined) => {
    if (!v) {
      return;
    }

    if (v === 'create') {
      setCreateDialogOpen(true);

      return;
    }

    const [type, value] = v.split('|');
    let entity = clients?.find(
      (client) => client.contacts?.[0]?.contact_key === value
    );

    if (!entity) {
      entity = results.find((r: any) => r.value === value) as unknown as any;
    }

    if (!entity) {
      return;
    }

    onSelect(value, type as 'user', entity as any);
  };

  return (
    <SelectField
      placeholder={t('select_user_or_client')}
      value={value}
      onValueChange={handleSelect}
      customSelector
      menuPosition="fixed"
    >
      <option value="create">{t('create_client_or_user')}</option>

      {clients
        ?.filter(
          (client) =>
            client.contacts.length > 0 && client.contacts[0].contact_key
        )
        .map((client) => (
          <option
            value={`client|${client.contacts[0].contact_key}`}
            key={client.id}
          >
            {client.name}
          </option>
        ))}

      {results.map((result: any) => (
        <option value={`${result.type}|${result.value}`} key={result.id}>
          {result.label}
        </option>
      ))}
    </SelectField>
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
    <Button form={form} behavior="button" disabled={isSubmitting}>
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

function BlueprintBuilder() {
  const [t] = useTranslation();

  const { id } = useParams();
  const colors = useColorScheme();

  const [isDocumentSaving, setIsDocumentSaving] = useState<boolean>(false);
  const { data: blueprintResponse, isLoading } = useBlueprintQuery({ id });

  const [blueprint, setBlueprint] = useState<Blueprint>();

  useEffect(() => {
    if (blueprintResponse) {
      setBlueprint(blueprintResponse.data.data);
    }
  }, [blueprintResponse]);
  
  const isSmallScreen = useMediaQuery({ query: '(max-width: 640px)' });

  const pages: Page[] = [
    { name: t('blueprints'), href: '/documents/blueprints' },
    {
      name: blueprint?.name || t('blueprint'),
      href: route('/documents/blueprints/:id/edit', { id }),
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

  useEffect(() => {
    const refetchDocuninjaDocument = () => {
      $refetch(['blueprints']);
    };

    const handleSuccessfullySavedDocument = () => {
      toast.success('blueprint_updated');
      $refetch(['blueprints']);
    };

    const handleFinalizeDocumentSave = () => {
      setIsDocumentSaving(false);
    };

    window.addEventListener('refetch.blueprints', refetchDocuninjaDocument);

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
        'refetch.blueprints',
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

  const navigate = useNavigate();

  
  return (
    <Default
      title={t('builder')}
      breadcrumbs={pages}
      navigationTopRight={
        <div className="flex items-center gap-2">
          {blueprint?.is_template && blueprint?.template && (
          <Button
            type="secondary"  
            behavior="button"
            onClick={() => {
              navigate(route('/documents/blueprints/:id/template_editor', { 
                id, 
                state: { 
                  templateHtml: blueprint.template, 
                  blueprintName: blueprint.name 
                } 
              }));
            }}
            disabled={isDocumentSaving}
            disableWithoutIcon
          >
            {t('edit_template')}
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
            events: {
              onMessage: () => null,
              onMessageDismiss: () => null,
            },
            components: {
              skeleton: Loading,
              createBlueprintSignatory: CreateBlueprintSignatory,
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
            blueprint: true,
            company:
              (localStorage.getItem('DOCUNINJA_COMPANY_ID') as string) ||
              undefined,
          }}
        >
          <Builder$ />
        </BuilderContext.Provider>
      </Card>
    </Default>
  );
}

export function CreateBlueprintSignatory({
  onClick,
}: CreateBlueprintSignatoryProps) {
  const [t] = useTranslation();

  return (
    <Button type="secondary" behavior="button" onClick={onClick}>
      {t('new_signatory')}
    </Button>
  );
}

export default BlueprintBuilder;
