/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { Card } from '$app/components/cards';
import { Button, InputField } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Modal } from '$app/components/Modal';
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
import classNames from 'classnames';
import { Check, ChevronLeft, ChevronRight } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { FiMinimize2 } from 'react-icons/fi';

import { useParams } from 'react-router';
import styled from 'styled-components';

const Div = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

export default function Index() {
  const params = useParams();
  const colors = useColorScheme();

  return (
    <div className="max-w-[90rem] mx-auto">
      {/* @ts-expect-error - TODO: fix this */}
      <SignContext.Provider
        value={{
          endpoint: import.meta.env.VITE_DOCUNINJA_API_URL,
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
            border: colors.$24,
            frame: {
              background: colors.$1,
              color: colors.$3,
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
  const [t] = useTranslation();

  return (
    <Button type="primary" behavior="button" onClick={onClick}>
      {t('start_signing')}
    </Button>
  );
}

function MinimizeButton({ onClick }: MinimizeButtonProps) {
  const colors = useColorScheme();

  return (
    <Div
      className="p-2 rounded-md border cursor-pointer"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      theme={{
        backgroundColor: colors.$1,
        hoverBackgroundColor: colors.$4,
      }}
      style={{
        borderColor: colors.$24,
      }}
    >
      <Icon element={FiMinimize2} />
    </Div>
  );
}

function SubmitButton({ isSubmitting, disabled, onClick }: SubmitButtonProps) {
  const [t] = useTranslation();

  return (
    <Button
      disabled={disabled || isSubmitting}
      onClick={onClick}
      type="primary"
      behavior="button"
      className="w-full"
      disableWithoutIcon
    >
      {t('continue')}
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

  const colors = useColorScheme();

  return (
    <Card
      title={
        <div className="flex items-center gap-x-3">
          <Check size={20} className="text-green-600 mt-0.5" />

          <span style={{ color: colors.$3 }}>
            {t('successfully_signed_document')}
          </span>
        </div>
      }
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
    >
      <div className="text-sm px-4 sm:px-6" style={{ color: colors.$3 }}>
        {t('download_signed_document')}
      </div>
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
    <>
      <div className="mr-2">{trigger}</div>

      <Modal
        title={t('create_signature')}
        visible={isOpen}
        onClose={onOpenChange}
        size="regular"
      >
        <div className="grid gap-6 pb-4">
          {input}
          {content}
          {useSignatureButton}
        </div>
      </Modal>
    </>
  );
}

function SignatureInput({ value, onChange }: SignatureSelectorInputProps) {
  const [t] = useTranslation();

  return (
    <InputField
      type="text"
      value={value}
      onValueChange={(value) => onChange(value)}
      placeholder={t('signature_name')}
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
    <Button type="secondary" behavior="button" onClick={onClick}>
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
  const colors = useColorScheme();

  return (
    <div
      className="border flex py-4 flex-col space-y-6 rounded-md"
      style={{ backgroundColor: colors.$1, borderColor: colors.$24 }}
    >
      <div
        ref={headerRef}
        className={classNames('flex flex-col space-y-4 rounded-md', {
          'py-2 px-4': !(toggled && hasSignature),
          'px-6': toggled && hasSignature,
        })}
      >
        {header}
      </div>

      {toggled && hasSignature ? (
        <div className="flex justify-center" ref={contentRef}>
          {content}
        </div>
      ) : null}

      <div ref={footerRef} className="flex flex-col px-6">
        {footer}
      </div>
    </div>
  );
}

function Previous({ onClick, disabled }: NavigateButtonProps) {
  const colors = useColorScheme();

  return (
    <Div
      className={classNames('py-1 px-2 rounded-md border', {
        'opacity-75 cursor-not-allowed': disabled,
        'opacity-100 cursor-pointer': !disabled,
      })}
      onClick={(event) => {
        event.stopPropagation();
        !disabled && onClick();
      }}
      theme={{
        backgroundColor: colors.$1,
        hoverBackgroundColor: colors.$4,
      }}
    >
      <Icon element={ChevronLeft} className="w-7 h-7" />
    </Div>
  );
}

function Next({ onClick, disabled }: NavigateButtonProps) {
  const colors = useColorScheme();

  return (
    <Div
      className={classNames('py-1 px-2 rounded-md border', {
        'opacity-75 cursor-not-allowed': disabled,
        'opacity-100 cursor-pointer': !disabled,
      })}
      onClick={(event) => {
        event.stopPropagation();
        !disabled && onClick();
      }}
      theme={{
        backgroundColor: colors.$1,
        hoverBackgroundColor: colors.$4,
      }}
    >
      <Icon element={ChevronRight} className="w-7 h-7" />
    </Div>
  );
}
