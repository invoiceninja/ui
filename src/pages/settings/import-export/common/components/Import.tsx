/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { SelectField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { UploadImport } from './UploadImport';
import { useEffect, useState } from 'react';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { toast } from '$app/common/helpers/toast/toast';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { AxiosError } from 'axios';
import { Alert } from '$app/components/Alert';

const FILE_KEY = {
  clients: 'client',
  invoices: 'invoice',
  accounting: 'invoice',
  contacts: 'client',
};

const IMPORTS: Record<ImportType, string[]> = {
  freshbooks: ['clients', 'invoices'],
  invoice2go: ['invoices'],
  invoicely: ['clients', 'invoices'],
  waveaccounting: ['clients', 'accounting'],
  zoho: ['contacts', 'invoices'],
};

type ImportType =
  | 'freshbooks'
  | 'invoice2go'
  | 'invoicely'
  | 'waveaccounting'
  | 'zoho';

export interface ImportedFile {
  group: string;
  file: File;
}
export function Import() {
  const [t] = useTranslation();

  const [importType, setImportType] = useState<ImportType>('freshbooks');

  const [files, setFiles] = useState<ImportedFile[]>([]);
  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const handleImportFiles = () => {
    if (!isFormBusy) {
      toast.processing();
      setIsFormBusy(true);

      const formData = new FormData();

      formData.append('import_type', importType);

      files.forEach(({ file, group }) => {
        formData.append(
          `files[${FILE_KEY[group as keyof typeof FILE_KEY]}]`,
          file
        );
      });

      request('POST', endpoint('/api/v1/import'), formData)
        .then((response) => toast.success(response.data.message))
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            toast.dismiss();
            setErrors(error.response.data);
          }
        })
        .finally(() => {
          setIsFormBusy(false);
          setFiles([]);
        });
    }
  };

  const disableSubmitButton = () => {
    return IMPORTS[importType].some(
      (group) =>
        !files.filter(({ group: currentGroup }) => currentGroup === group)
          .length
    );
  };

  useEffect(() => {
    setErrors(undefined);
    setFiles([]);
  }, [importType]);

  return (
    <Card
      title={t('import')}
      saveButtonLabel={t('import')}
      onSaveClick={(event) => {
        event.preventDefault();
        handleImportFiles();
      }}
      disableSubmitButton={disableSubmitButton() || isFormBusy}
      withSaveButton
      disableWithoutIcon
    >
      <Element leftSide={t('import_type')}>
        <SelectField
          value={importType}
          onValueChange={(value) => setImportType(value as ImportType)}
          errorMessage={errors?.errors.import_type}
        >
          <option value="freshbooks">{t('freshbooks')}</option>
          <option value="invoice2go">{t('invoice2go')}</option>
          <option value="invoicely">{t('invoicely')}</option>
          <option value="waveaccounting">{t('waveaccounting')}</option>
          <option value="zoho">{t('zoho')}</option>
        </SelectField>
      </Element>

      {IMPORTS[importType].map((key) => (
        <UploadImport key={key} group={key} files={files} setFiles={setFiles} />
      ))}

      <Element>
        {errors &&
          Object.keys(errors.errors).map(
            (key, index) =>
              key !== 'import_type' && (
                <Alert key={index} type="danger">
                  {errors.errors[key]}
                </Alert>
              )
          )}
      </Element>
    </Card>
  );
}
