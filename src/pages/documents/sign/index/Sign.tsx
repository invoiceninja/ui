/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '$app/components/cards';
import { Button, InputField } from '$app/components/forms';
import { ChevronLeft } from '$app/components/icons/ChevronLeft';
import { ChevronRight } from '$app/components/icons/ChevronRight';
import { Modal } from '$app/components/Modal';
import { Spinner } from '$app/components/Spinner';
import {
  type DateInputProps,
  type MinimizeButtonProps,
  type NavigateButtonProps,
  Sign,
  type SignCardProps,
  SignContext,
  type SignatureSelectorButtonProps,
  type SignatureSelectorDialogProps,
  type SignatureSelectorInputProps,
  type StartSigningButtonProps,
  type SubmitButtonProps,
} from '@docuninja/builder2.0';
import { Minimize2 } from 'react-feather';
import { useTranslation } from 'react-i18next';

import { useParams } from 'react-router';

export default function Index() {
  const params = useParams();

  return (
    <div>
      {/* @ts-expect-error - TODO: fix this */}
      <SignContext.Provider
        value={{
          token: localStorage.getItem('X-DOCU-NINJA-TOKEN') as string,
          document: params.document as string,
          invitation: params.invitation as string,
          components: {
            start: StartSigningButton,
            minimize: MinimizeButton,
            submit: SubmitButton,
            dateInput: DateInput,
            success: Success,
            card: {
              card: SignCard,
            },
            signatureSelector: {
              dialog: SignatureSelectorDialog,
              input: SignatureInput,
              button: SignatureButton,
              clear: SignatureClearButton,
              useSignature: SignatureUseButton,
            },
            previous: Previous,
            next: Next,
          },
          styles: {
            border: 'var(--border)',
            frame: {
              background: 'var(--background)',
              color: 'var(--text)',
            },
          },
        }}
      >
        <Sign />
      </SignContext.Provider>
    </div>
  );
}

function StartSigningButton({ onClick }: StartSigningButtonProps) {
  return (
    <Button type="primary" behavior="button" onClick={onClick}>
      Start signing
    </Button>
  );
}

function MinimizeButton({ onClick }: MinimizeButtonProps) {
  return (
    <Button type="secondary" behavior="button" onClick={onClick}>
      <Minimize2 />
    </Button>
  );
}

function SubmitButton({ isSubmitting, disabled, onClick }: SubmitButtonProps) {
  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      type="primary"
      behavior="button"
      className="w-full"
    >
      {isSubmitting ? <Spinner /> : null}
      Continue
    </Button>
  );
}

function DateInput({ value, onChange }: DateInputProps) {
  return (
    <InputField
      type="date"
      value={value}
      onValueChange={(value) => onChange(value)}
    />
  );
}

function Success() {
  const [t] = useTranslation();

  return (
    <Card
      title={
        <div className="flex items-center gap-1">
          <span>{t('success')}</span>

          <span>Successfully signed the document.</span>
        </div>
      }
    >
      <small className="text-sm">
        You can now download the signed document or continue signing.
      </small>
    </Card>
  );
}

function SignatureSelectorDialog({
  isOpen,
  onOpenChange,
  trigger,
  input,
  content,
  useSignatureButton,
}: SignatureSelectorDialogProps) {
  const [t] = useTranslation();

  return (
    <Modal
      title={t('create_signature')}
      visible={isOpen}
      onClose={onOpenChange}
    >
      {trigger}

      <div className="grid gap-6 pt-6 pb-6">
        {input}
        {content}
        {useSignatureButton}
      </div>
    </Modal>
  );
}

function SignatureInput({ value, onChange }: SignatureSelectorInputProps) {
  return (
    <InputField
      type="text"
      value={value}
      onValueChange={(value) => onChange(value)}
      placeholder="Signature name"
    />
  );
}

function SignatureButton({ onClick }: SignatureSelectorButtonProps) {
  const [t] = useTranslation();
  return (
    <Button behavior="button" onClick={onClick}>
      {t('customize')}
    </Button>
  );
}

function SignatureClearButton({ onClick }: SignatureSelectorButtonProps) {
  const [t] = useTranslation();

  return (
    <Button
      type="secondary"
      behavior="button"
      onClick={onClick}
      className="ml-2"
    >
      {t('clear')}
    </Button>
  );
}

function SignatureUseButton({ onClick }: SignatureSelectorButtonProps) {
  const [t] = useTranslation();

  return (
    <Button type="primary" behavior="button" onClick={onClick}>
      {t('use_signature')}
    </Button>
  );
}

function SignCard({
  content,
  headerRef,
  contentRef,
  footerRef,
  header,
  toggled,
  hasSignature,
  footer,
}: SignCardProps) {
  const [t] = useTranslation();
  return (
    <Card title={header}>
      {toggled && hasSignature ? <div ref={contentRef}>{content}</div> : null}

      <div ref={footerRef} className="flex flex-col">
        {footer}
      </div>
    </Card>
  );
}

function Previous({ onClick, disabled }: NavigateButtonProps) {
  return (
    <Button
      type="secondary"
      behavior="button"
      onClick={onClick}
      disabled={disabled}
    >
      <ChevronLeft />
    </Button>
  );
}

function Next({ onClick, disabled }: NavigateButtonProps) {
  return (
    <Button
      type="secondary"
      behavior="button"
      onClick={onClick}
      disabled={disabled}
    >
      <ChevronRight />
    </Button>
  );
}
