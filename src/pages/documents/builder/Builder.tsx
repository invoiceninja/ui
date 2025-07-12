import { useColorScheme } from '$app/common/colors';
import { route } from '$app/common/helpers/route';
import { Client } from '$app/common/interfaces/client';
import { useClientsQuery } from '$app/common/queries/docuninja/clients';
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
import { Check } from 'react-feather';
import { useTranslation } from 'react-i18next';
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
  return (
    <Button type="secondary" {...props}>
      Send
    </Button>
  );
}

function SendDialog({ open, onOpenChange, content, action }: SendDialogProps) {
  return (
    <Modal visible={open} onClose={onOpenChange}>
      {content}

      <div className="flex justify-end">{action}</div>
    </Modal>
  );
}

function SendDialogButton({ isSubmitting }: SendDialogButtonProps) {
  return (
    <Button behavior="button" disabled={isSubmitting}>
      Send invitations
    </Button>
  );
}

function DeleteDialog({ open, onOpenChange, action }: DeleteDialogProps) {
  return (
    <Modal title="Delete document" visible={open} onClose={onOpenChange}>
      <p>
        Are you sure you want to delete this document? This action cannot be
        undone.
      </p>

      {action}
    </Modal>
  );
}

function DeleteButton({ isSubmitting }: DeleteDialogButtonProps) {
  return (
    <Button behavior="button" disabled={isSubmitting} className="w-full">
      Delete
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
  return (
    <Button behavior="button" {...props}>
      Confirm
    </Button>
  );
}

export function CreateDialog({
  open,
  onOpenChange,
  client,
  user,
}: CreateDialogProps) {
  return (
    <Modal title="Create client or user" visible={open} onClose={onOpenChange}>
      <TabGroup tabs={['Client', 'User']}>
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
  return (
    <Button
      form={form}
      behavior="button"
      disabled={isSubmitting}
      className="w-full"
    >
      Create
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

  const { data: clients } = useClientsQuery({ perPage: 1000 });

  function handleSelect(v: string | undefined) {
    if (!v) {
      return;
    }

    if (v === 'create') {
      setCreateDialogOpen(true);

      return;
    }

    const [type, value] = v.split('|');
    const entity = results.find((r) => r.value === value);

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

      {clients?.data.data.map((client: Client) => (
        <option value={`contact|${client.id}`} key={client.id}>
          {client.display_name || client.name}
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

  return (
    <Default title={t('builder')} breadcrumbs={pages}>
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
