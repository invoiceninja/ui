/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { toast } from '$app/common/helpers/toast/toast';
import { Element } from '$app/components/cards';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { MdClose } from 'react-icons/md';
import { useColorScheme } from '$app/common/colors';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { AxiosError } from 'axios';
import { Alert } from '../Alert';
import { Button } from '../forms';
import { Icon } from '../icons/Icon';
import styled from 'styled-components';

interface Props {
  entity: 'expense';
  type: 'xml';
}

const Div = styled.div`
  border-color: ${(props) => props.theme.borderColor};
  &:hover {
    border-color: ${(props) => props.theme.hoverBorderColor};
  }
`;

export function XMLImport(props: Props) {
  const [t] = useTranslation();

  const { entity } = props;

  const colors = useColorScheme();

  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<ValidationBag>();
  const [formData, setFormData] = useState(new FormData());
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const handleImport = () => {
    if (!isFormBusy) {
      if (!files.length) {
        toast.error('select_file');
        return;
      }

      toast.processing();
      setIsFormBusy(true);
      setErrors(undefined);

      return request('POST', endpoint('/api/v1/edocument/upload'), formData)
        .then((response) => {
          toast.success(response?.data?.message ?? 'success');
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            toast.dismiss();
            setErrors(error.response.data);
          }
        })
        .finally(() => {
          setFiles([]);
          setIsFormBusy(false);
          setFormData(new FormData());
        });
    }
  };

  const addFilesToFormData = () => {
    files.forEach((file) => {
      formData.append(`documents[]`, file);
    });

    setFormData(formData);
  };

  const handleRemoveFile = (fileIndex: number) => {
    const filteredFileList = files.filter((_, index) => fileIndex !== index);

    const updatedFormData = new FormData();

    updatedFormData.append('import_type', entity);

    updatedFormData.append('_method', 'PUT');

    setFiles(filteredFileList);

    setFormData(updatedFormData);
  };

  const checkLinesLengthInFile = (file: File) => {
    return new Promise((resolve) => {
      try {
        const reader = new FileReader();

        reader.onload = (event: ProgressEvent<FileReader>) => {
          const xmlData = (event.target?.result as string) || '';
          const rowData = xmlData.split('\n');

          if (!rowData.length || rowData.length === 1) {
            resolve(false);
          } else if (rowData.length === 2 && !rowData[1]) {
            resolve(false);
          } else {
            resolve(true);
          }
        };

        reader.readAsText(file);
      } catch (error) {
        resolve(false);
      }
    });
  };

  const shouldUploadFiles = async (files: File[]) => {
    for (let i = 0; i < files.length; i++) {
      const hasCorrectRowsLength = await checkLinesLengthInFile(files[i]);

      if (!hasCorrectRowsLength) {
        return false;
      }
    }

    return true;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/xml': ['.xml'] },
    onDrop: async (acceptedFiles) => {
      const shouldAddFiles = await shouldUploadFiles(acceptedFiles);

      if (shouldAddFiles) {
        const isFilesTypeCorrect = acceptedFiles.every(({ type }) =>
          type.includes(type)
        );

        if (isFilesTypeCorrect) {
          let currentFiles: File[] = [];
          acceptedFiles.map((file) => {
            currentFiles = [...currentFiles, file];
          });

          setFiles(currentFiles);

          formData.append('import_type', entity);

          formData.append('_method', 'PUT');

          setFormData(formData);
        } else {
          toast.error('wrong_file_extension');
        }
      } else {
        toast.error('xml_lines_length');
      }
    },
  });

  useEffect(() => {
    addFilesToFormData();
  }, [files]);

  useEffect(() => {
    return () => {
      setFiles([]);
      setFormData(new FormData());
    };
  }, []);

  return (
    <div className="flex flex-col space-y-4">
      <Element leftSide={t('xml_file')}>
        {!files.length ? (
          <div
            {...getRootProps()}
            className="flex flex-col md:flex-row md:items-center"
          >
            <Div
              className="relative block w-full border-2 border-dashed rounded-lg p-12 text-center focus:outline-none focus:ring-2 focus:ring-offset-2"
              theme={{ borderColor: colors.$5, hoverBorderColor: colors.$3 }}
            >
              <input {...getInputProps()} />
              <Image
                className="mx-auto h-12 w-12"
                style={{ color: colors.$3, colorScheme: colors.$0 }}
              />
              <span
                className="mt-2 block text-sm font-medium"
                style={{ color: colors.$3, colorScheme: colors.$0 }}
              >
                {isDragActive
                  ? t('drop_file_here')
                  : t('dropzone_default_message')}
              </span>
            </Div>

            {errors &&
              Object.keys(errors.errors).map((key, index) => (
                <Alert key={index} type="danger">
                  {errors.errors[key]}
                </Alert>
              ))}
          </div>
        ) : (
          <ul className="grid xs:grid-rows-6 lg:grid-cols-2 gap-3">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between cursor-pointer p-2"
                style={{ backgroundColor: colors.$4 }}
              >
                {file.name} - {(file.size / 1024).toPrecision(2)} KB{' '}
                {
                  <Icon
                    element={MdClose}
                    size={19}
                    className="cursor-pointer"
                    onClick={() => handleRemoveFile(index)}
                  />
                }
              </li>
            ))}
          </ul>
        )}
      </Element>

      <div className="flex justify-end pr-5">
        <Button
          behavior="button"
          onClick={handleImport}
          disableWithoutIcon
          disabled={!files.length || isFormBusy}
        >
          {t('import')}
        </Button>
      </div>
    </div>
  );
}
