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
import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Document } from '$app/common/interfaces/docuninja/api';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { ErrorMessage } from '$app/components/ErrorMessage';
import { CloudUpload } from '$app/components/icons/CloudUpload';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Box = styled.div`
  border-color: ${(props) => props.theme.borderColor};
  &:hover {
    border-color: ${(props) => props.theme.hoverBorderColor};
  }
`;

export function DocumentCreationDropZone() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const colors = useColorScheme();

  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [fileRejectionErrors, setFileRejectionErrors] = useState<string[]>([]);

  const handleCreateDocument = (currentFormData: FormData) => {
    if (!isFormBusy) {
      setIsFormBusy(true);
      toast.processing();
      setErrors(undefined);

      request('POST', docuNinjaEndpoint('/api/documents'), currentFormData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
        },
      })
        .then((response: GenericSingleResourceResponse<Document>) => {
          $refetch(['docuninja_documents']);

          toast.success('document_created');

          navigate(
            route('/docuninja/:id/builder', { id: response.data.data.id })
          );
        })
        .catch((e) => {
          if (e.response?.status === 422) {
            setErrors(e.response.data);
            toast.dismiss();
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    // Clear any previous file rejection errors
    setFileRejectionErrors([]);
    
    // Only proceed if there are actually accepted files
    if (acceptedFiles.length === 0) {
      return;
    }
    
    const newFormData = new FormData();

    acceptedFiles.forEach((file) => {
      newFormData.append('files[]', file);
      
    });

    newFormData.append(
      'description', 'Untitled document'
    );

    handleCreateDocument(newFormData);
  };

  const onDropRejected = (fileRejections: any[]) => {
    const rejectionErrors: string[] = [];
    
    fileRejections.forEach((rejection) => {
      const fileName = rejection.file.name;
      const errors = rejection.errors.map((error: any) => {
        switch (error.code) {
          case 'file-invalid-type':
            return t('invalid_file', { fileName });
          case 'file-too-large':
            return t('logo_warning_too_large', { fileName });
          case 'too-many-files':
            return t('too_many_files');
          default:
            return t('file_upload_error', { fileName });
        }
      });
      rejectionErrors.push(...errors);
    });
    
    setFileRejectionErrors(rejectionErrors);
    toast.error(t('invalid_file') as string);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    multiple: true,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "image/png": [".png"],
      "image/jpeg": [".jpg"],
      "application/vnd.oasis.opendocument.text": [".odt"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    disabled: isFormBusy,
  });

  return (
    <div
      {...getRootProps()}
      className="flex flex-col items-start gap-y-4 cursor-pointer"
    >
      <Box
        className="relative block w-full border-2 border-dashed rounded-lg p-12 text-center"
        theme={{
          borderColor: colors.$21,
          hoverBorderColor: colors.$17,
        }}
      >
        <input {...getInputProps()} />

        <div className="flex justify-center">
          <CloudUpload size="2.3rem" color={colors.$3} />
        </div>

        <span
          className="mt-2 block text-sm font-medium"
          style={{ color: colors.$3, colorScheme: colors.$0 }}
        >
          {isDragActive ? t('drop_file_here') : t('dropzone_default_message')}
        </span>
      </Box>

      {fileRejectionErrors.length > 0 && (
        <div className="w-full">
          {fileRejectionErrors.map((error, index) => (
            <ErrorMessage key={index} className="w-full">
              {error}
            </ErrorMessage>
          ))}
        </div>
      )}

      {errors &&
        Object.keys(errors.errors).map((key, index) => (
          <ErrorMessage key={index} className="w-full">
            {errors.errors[key]}
          </ErrorMessage>
        ))}
    </div>
  );
}
