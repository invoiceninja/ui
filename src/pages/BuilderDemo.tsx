import { Button } from '$app/components/forms';
import { Default } from '$app/components/layouts/Default';
import { Modal } from '$app/components/Modal';
import { BuilderContext, Builder } from '~/public/docuninja/builder2.0';

export function BuilderDemo() {
  return (
    <Default breadcrumbs={[]}>
      <div className="max-w-7xl mx-auto">
        <BuilderContext.Provider
          value={{
            token:
              'tpLV7Zd9bRHNxnksPwtDnrEceOhvLTkUeZUY1ENZALRj3DZmX2dWLTpbrYUNCXus',
            document: '01JVA4Y86JKC0Q39VBVATYEKB7',
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
      
      <div className="flex justify-end">
        {action}
      </div>
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
