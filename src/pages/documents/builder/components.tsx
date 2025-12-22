/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Alert } from '$app/components/Alert';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Button, InputField } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { Settings } from '$app/components/icons/Settings';
import { Modal } from '$app/components/Modal';
import { Spinner } from '$app/components/Spinner';
import {
  AlertProps,
  ConfirmationDialogButtonProps,
  ConfirmationDialogProps,
  CreateClientTabProps,
  CreateDialogTabButtonProps,
  DeleteDialogButtonProps,
  DeleteDialogProps,
  ImportFromButtonProps,
  RectangleSettingsDialogProps,
  RectangleSettingsDialogButtonProps,
  RectangleSettingsInputProps,
  RectangleSettingsLabelProps,
  RectangleSettingsCheckboxProps,
  RectangleSettingsSelectProps,
  RectangleSettingsRemoveButtonProps,
  RectangleSettingsOptionItemProps,
  RectangleSettingsOptionsListProps,
  ToolboxContextProps,
  UninviteDialogButtonProps,
  UninviteDialogProps,
  UploadDialogProps,
  UploadProps,
  ValidationErrorsProps,
} from '@docuninja/builder2.0';
import { Check } from 'react-feather';
import { useTranslation } from 'react-i18next';

export function Loading() {
  return (
    <div className="flex justify-center items-center py-6 sm:py-8 px-4 sm:px-6">
      <Spinner />
    </div>
  );
}

export function DeleteDialog({
  open,
  onOpenChange,
  action,
}: DeleteDialogProps) {
  const [t] = useTranslation();

  return (
    <Modal title={t('delete_document')} visible={open} onClose={onOpenChange}>
      <p>{t('delete_docuninja_document_confirmation')}</p>

      {action}
    </Modal>
  );
}

export function DeleteButton({ isSubmitting }: DeleteDialogButtonProps) {
  const [t] = useTranslation();

  return (
    <Button behavior="button" disabled={isSubmitting} className="w-full">
      {t('delete')}
    </Button>
  );
}

export function Upload({ ...props }: UploadProps) {
  const [t] = useTranslation();

  return (
    <Button behavior="button" type="secondary" {...props} className="w-full">
      {t('upload')}
    </Button>
  );
}

export function UploadDialog({
  open,
  onOpenChange,
  content,
}: UploadDialogProps) {
  const [t] = useTranslation();

  return (
    <Modal
      title={t('upload')}
      visible={open}
      onClose={onOpenChange}
      size="small"
    >
      {content}
    </Modal>
  );
}

export function ValidationErrors({ content }: ValidationErrorsProps) {
  return <Alert>{content}</Alert>;
}

export function ConfirmationDialog({
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

export function ConfirmationDialogButton({
  ...props
}: ConfirmationDialogButtonProps) {
  const [t] = useTranslation();

  return (
    <Button behavior="button" {...props}>
      {t('confirm')}
    </Button>
  );
}

export function CreateUserForm({ fields, errors }: CreateClientTabProps) {
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

export function CreateDialogTabButton({
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

export function UninviteDialog({
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

export function UninviteButton({
  isSubmitting,
  form,
}: UninviteDialogButtonProps) {
  return (
    <Button form={form} behavior="button" disabled={isSubmitting}>
      Continue
    </Button>
  );
}

export function ToolboxContext({ options }: ToolboxContextProps) {
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

export function ImportFromGoogleDrive({
  onClick,
  isSubmitting,
}: ImportFromButtonProps) {
  const [t] = useTranslation();

  return (
    <Button
      behavior="button"
      type="secondary"
      onClick={onClick}
      className="w-full"
    >
      {isSubmitting ? `${t('Importing')}...` : t('google_drive')}
    </Button>
  );
}

export function RectangleSettingsDialog({
  open,
  onOpenChange,
  title,
  children,
}: RectangleSettingsDialogProps) {
  const [t] = useTranslation();

  return (
    <Modal title={title} visible={open} onClose={onOpenChange}>
      {children}
    </Modal>
  );
}

export function RectangleSettingsSaveButton({
  onClick,
  label,
  id,
}: RectangleSettingsDialogButtonProps) {
  return (
    <Button behavior="button" onClick={onClick} id={id} className="w-full">
      {label}
    </Button>
  );
}

export function RectangleSettingsButton({
  onClick,
  label,
  id,
}: RectangleSettingsDialogButtonProps) {
  return (
    <Button behavior="button" onClick={onClick} id={id} type="secondary">
      {label}
    </Button>
  );
}

export function RectangleSettingsInput({
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  maxLength,
  step,
}: RectangleSettingsInputProps) {
  return (
    <InputField
      id={id}
      type={type}
      value={value as string}
      onValueChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      step={step}
    />
  );
}

export function RectangleSettingsLabel({
  htmlFor,
  children,
}: RectangleSettingsLabelProps) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium mb-1">
      {children}
    </label>
  );
}

export function RectangleSettingsCheckbox({
  id,
  checked,
  onChange,
  label,
}: RectangleSettingsCheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <Toggle id={id} checked={checked} onValueChange={onChange} />
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
    </div>
  );
}

export function RectangleSettingsSelect({
  id,
  value,
  onChange,
  children,
}: RectangleSettingsSelectProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {children}
    </select>
  );
}

export function RectangleSettingsRemoveButton({
  onClick,
}: RectangleSettingsRemoveButtonProps) {
  const [t] = useTranslation();

  return (
    <Button behavior="button" onClick={onClick} type="secondary">
      {t('remove')}
    </Button>
  );
}

export function RectangleSettingsOptionItem({
  children,
}: RectangleSettingsOptionItemProps) {
  return <div className="py-2 px-3 hover:bg-gray-50">{children}</div>;
}

export function RectangleSettingsOptionsList({
  id,
  children,
}: RectangleSettingsOptionsListProps) {
  return (
    <div id={id} className="border border-gray-300 rounded-md divide-y">
      {children}
    </div>
  );
}
