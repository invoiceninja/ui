/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Element } from '$app/components/cards';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { MdClose } from 'react-icons/md';
import { useColorScheme } from '$app/common/colors';
import { ImportedFile } from './Import';
import { toast } from '$app/common/helpers/toast/toast';
import { CloudUpload } from '$app/components/icons/CloudUpload';
import styled from 'styled-components';

interface Props {
  group: string;
  files: ImportedFile[];
  setFiles: Dispatch<SetStateAction<ImportedFile[]>>;
}

const Box = styled.div`
  border-color: ${(props) => props.theme.borderColor};
  &:hover {
    border-color: ${(props) => props.theme.hoverBorderColor};
  }
`;

export function UploadImport(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const { group, files, setFiles } = props;

  const [currentFiles, setCurrentFiles] = useState<File[]>([]);

  const handleRemoveFile = (file: File) => {
    setFiles((currentList) =>
      currentList.filter(({ file: currentFile }) => currentFile !== file)
    );
  };

  const checkRowsLengthInCSV = (file: File) => {
    return new Promise((resolve) => {
      try {
        const reader = new FileReader();

        reader.onload = (event: ProgressEvent<FileReader>) => {
          const csvData = (event.target?.result as string) || '';
          const rowData = csvData.split('\n');

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
      const hasCorrectRowsLength = await checkRowsLengthInCSV(files[i]);

      if (!hasCorrectRowsLength) {
        return false;
      }
    }

    return true;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept:
      group === 'backup'
        ? { 'application/zip': ['.zip'] }
        : {
            'text/*': ['.csv'],
            'application/vnd.ms-excel': ['.csv'],
            'application/csv': ['.csv'],
          },
    onDrop: async (acceptedFiles) => {
      if (group === 'backup') {
        acceptedFiles.forEach((file) => {
          setFiles((prevState) => [...prevState, { group, file }]);
        });
      } else {
        const shouldAddFiles = await shouldUploadFiles(acceptedFiles);

        if (shouldAddFiles) {
          acceptedFiles.forEach((file) => {
            setFiles((prevState) => [...prevState, { group, file }]);
          });
        } else {
          toast.error('csv_rows_length');
        }
      }
    },
  });

  useEffect(() => {
    setCurrentFiles(
      files
        .filter(({ group: currentGroup }) => currentGroup === group)
        .map(({ file }) => file)
    );
  }, [files]);

  return (
    <Element leftSide={t(group)}>
      {!currentFiles.length ? (
        <div
          {...getRootProps()}
          className="flex flex-col md:flex-row md:items-center"
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
              {isDragActive
                ? t('drop_file_here')
                : t('dropzone_default_message')}
            </span>
          </Box>
        </div>
      ) : (
        <ul className="grid xs:grid-rows-6 lg:grid-cols-2">
          {currentFiles.map((file, index) => (
            <li
              key={index}
              className="flex items-center hover:bg-gray-50 cursor-pointer p-2"
            >
              {file.name} - {(file.size / 1024).toPrecision(2)} KB{' '}
              {
                <MdClose
                  fontSize={15}
                  className="cursor-pointer ml-3"
                  onClick={() => handleRemoveFile(file)}
                />
              }
            </li>
          ))}
        </ul>
      )}
    </Element>
  );
}
