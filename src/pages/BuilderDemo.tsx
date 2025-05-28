import { Alert } from '$app/components/Alert';
import { Button } from '$app/components/forms';
import { Default } from '$app/components/layouts/Default';
import { Modal } from '$app/components/Modal';
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
  UninviteDialogButtonProps,
  UninviteDialogProps,
  UploadDialogProps,
  UploadProps,
  ValidationErrorsProps,
} from '@docuninja/builder2.0';

export function BuilderDemo() {
  return (
    <Default breadcrumbs={[]}>
      <div className="max-w-7xl mx-auto">
        {/* @ts-expect-error It's safe */}
        <BuilderContext.Provider
          value={{
            token:
              import.meta.env.VITE_DOCUNINJA_TOKEN as string,
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
              uninvite: {
                dialog: UninviteDialog,
                button: UninviteButton
              },
              validationErrors: ValidationErrors,
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
      <div className="space-y-2">Load load load..</div>
    </div>
  );
}

function Save({ isSubmitting, ...props }: SaveButtonProps) {
  return <Button {...props}>Save</Button>;
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
  return null;
}

function DeleteButton({ isSubmitting }: DeleteDialogButtonProps) {
  return null;
}

function Upload({ ...props }: UploadProps) {
  return null;
}

function UploadDialog({ open, onOpenChange, content }: UploadDialogProps) {
  return null;
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
  return null;
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
  return null;
}

function CreateClientForm({ fields }: CreateClientTabProps) {
  return (
    <>
      {fields.map((field) => (
        <div key={field.name} className="mb-4">
          <label htmlFor={field.name} className="block text-sm font-medium">
            {field.name}
          </label>

          <input type="text" id={field.name} {...field.register(field.name)} />
        </div>
      ))}
    </>
  );
}

function CreateUserForm({ fields }: CreateClientTabProps) {
  return (
    <>
      {fields.map((field) => (
        <div key={field.name} className="mb-4">
          <label htmlFor={field.name} className="block text-sm font-medium">
            {field.name}
          </label>

          <input type="text" id={field.name} {...field.register(field.name)} />
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
    <Button form={form} behavior="submit" disabled={isSubmitting}>
      Create
    </Button>
  );
}

function SignatorySelector({
  results,
  onSelect,
  value,
}: SignatorySelectorProps) {
  return null
}

function UninviteDialog({
  open,
  onOpenChange,
  content,
  action,
}: UninviteDialogProps) {
  return null
}

function UninviteButton({ isSubmitting, form }: UninviteDialogButtonProps) {
  return (
    <Button form={form} behavior="submit" disabled={isSubmitting}>
      Continue
    </Button>
  );
}