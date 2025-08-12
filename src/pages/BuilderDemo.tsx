import { Alert } from '$app/components/Alert';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Button, InputField } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { Settings } from '$app/components/icons/Settings';
import { Default } from '$app/components/layouts/Default';
import { Modal } from '$app/components/Modal';
import { SearchableSelect } from '$app/components/SearchableSelect';
import { Spinner } from '$app/components/Spinner';
import { TabGroup } from '$app/components/TabGroup';
import {
  Builder,
  BuilderContext,
  ConfirmationDialogButtonProps,
  ConfirmationDialogProps,
  CreateClientTabProps,
  CreateDialogProps,
  CreateDialogTabButtonProps,
  DeleteDialogButtonProps,
  DeleteDialogProps,
  SaveButtonProps,
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

export function BuilderDemo() {
  return (
    <Default breadcrumbs={[]}>
      <div className="max-w-7xl mx-auto">
        {/* @ts-expect-error It's safe */}
        <BuilderContext.Provider
          value={{
            token: import.meta.env.VITE_DOCUNINJA_TOKEN as string,
            document: import.meta.env.VITE_DOCUNINJA_DOCUMENT as string,
            components: {
              skeleton: Loading,
              save: Save,
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
            },
            styles: {
              frame: {
                backgroundColor: '#f7f7f7',
              },
              border: '#d1d5db',
            },
            options: {
              header: {
                sticky: false,
              },
            },
          }}
        >
          <Builder />
        </BuilderContext.Provider>
      </div>
    </Default>
  );
}

function Loading() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col space-y-3 my-5">
      <Spinner />
    </div>
  );
}

function Save({ isSubmitting, ...props }: SaveButtonProps) {
  return (
    <Button {...props} disabled={isSubmitting}>
      Save
    </Button>
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
  return <Button disabled={isSubmitting}>Send invitations</Button>;
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
  return (
    <Button type="secondary" {...props} className="w-full">
      Upload
    </Button>
  );
}

function UploadDialog({ open, onOpenChange, content }: UploadDialogProps) {
  return (
    <Modal
      title="Upload document"
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
      behavior="submit"
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
    <SearchableSelect value={value} onValueChange={handleSelect}>
      <option disabled>Select user or client...</option>
      <option value="create">Create client or user</option>

      {results.map((result) => (
        <option value={`${result.type}|${result.value}`} key={result.value}>
          {result.label}
        </option>
      ))}
    </SearchableSelect>
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
    <Button form={form} behavior="submit" disabled={isSubmitting}>
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
