import { useColorScheme } from '$app/common/colors';
import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { Document } from '$app/common/interfaces/docuninja/api';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Alert } from '$app/components/Alert';
import { Page } from '$app/components/Breadcrumbs';
import { Card } from '$app/components/cards';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Button, InputField, SelectField } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { Icon } from '$app/components/icons/Icon';
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
  SendButtonProps,
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
import { Check, Loader } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { MdSend } from 'react-icons/md';
import { useQuery, useQueryClient } from 'react-query';
import { useMediaQuery } from 'react-responsive';
import { useParams } from 'react-router-dom';

function Loading() {
  return (
    <div className="flex justify-center items-center py-6 sm:py-8 px-4 sm:px-6">
      <Spinner />
    </div>
  );
}

function Send({ ...props }: SendButtonProps) {
  const [t] = useTranslation();

  return (
    <Button type="secondary" {...props}>
      <div>
        <Icon element={MdSend} />
      </div>

      {t('send')}
    </Button>
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

      {action}
    </Modal>
  );
}

function SendDialogButton({ isSubmitting, ...props }: SendDialogButtonProps) {
  const [t] = useTranslation();

  const params = useParams();
  const queryClient = useQueryClient();

  const { data: document } = useQuery({
    queryKey: ['/api/documents', params.id],
    queryFn: () =>
      request(
        'GET',
        docuNinjaEndpoint(
          `/api/documents/${params.id}?includeUrl&includePreviews`
        )
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

    try {
      await request(
        'POST',
        docuNinjaEndpoint(`/api/documents/${document.id}/send`),
        {
          invitations: document.invitations || [],
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      );

      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast.success('document_queued_for_sending');

      window.dispatchEvent(new CustomEvent('builder:send.request-reset'));
      window.dispatchEvent(new CustomEvent('builder:send.submit'));

      if ('onClick' in props && typeof props.onClick === 'function') {
        props.onClick();
      }
    } catch (error) {
      toast.error('something_went_wrong');
    }
  };

  return (
    <Button
      behavior="button"
      disabled={isSubmitting}
      onClick={handleSend}
      {...props}
    >
      {isSubmitting ? <Loader className="animate-spin" /> : null}
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
    >
      <TabGroup tabs={[t('client'), t('user')]}>
        <div>{client}</div>
        <div>{user}</div>
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
      behavior="button"
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

  function handleSelect(v: string | undefined) {
    if (!v) {
      return;
    }

    if (v === 'create') {
      setCreateDialogOpen(true);

      return;
    }

    const [type, value] = v.split('|');
    const entity = results.find((r: any) => r.value === value);

    if (!entity) {
      return;
    }

    onSelect(value, type as 'user', entity as any);
  }

  return (
    <SelectField
      placeholder={t('select_user_or_client')}
      value={value}
      onValueChange={handleSelect}
      customSelector
      menuPosition="fixed"
    >
      <option value="create">{t('create_client_or_user')}</option>

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
  return (
    <Modal title="Remove invitation(s)" visible={open} onClose={onOpenChange}>
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
      {options.map((option, i) =>
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

function Builder() {
  const [t] = useTranslation();

  const { id } = useParams();
  const colors = useColorScheme();

  const isSmallScreen = useMediaQuery({ query: '(max-width: 640px)' });

  const pages: Page[] = [
    { name: t('documents'), href: '/documents' },
    {
      name: t('Document'),
      href: route('/documents/:id', { id }),
    },
    {
      name: t('builder'),
      href: route('/documents/:id/builder', { id }),
    },
  ];

  const handleSave = () => {
    window.dispatchEvent(new CustomEvent('builder:save'));
  };

  const handleSend = () => {
    window.dispatchEvent(new CustomEvent('builder:send'));
  };

  return (
    <Default
      title={t('builder')}
      breadcrumbs={pages}
      navigationTopRight={
        <div className="flex items-center gap-2">
          <Button type="secondary" behavior="button" onClick={handleSend}>
            <div>
              <Icon element={MdSend} />
            </div>

            <span>{t('send')}</span>
          </Button>

          <Button behavior="button" onClick={handleSave}>
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
              save: () => null,
              send: {
                trigger: Send,
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
              helper: () => (
                <span className="text-sm" style={{ color: colors.$17 }}>
                  {t('select_signatory')}
                </span>
              ),
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
              filesWrapper: {
                height: 'auto',
              },
              signatoriesWrapper: {
                height: 'auto',
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
          }}
        >
          <Builder$ />
        </BuilderContext.Provider>
      </Card>
    </Default>
  );
}

export default Builder;
