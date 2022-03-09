/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '@invoiceninja/forms';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { useSetCurrentRecurringInvoiceProperty } from '../hooks/useSetCurrentRecurringInvoiceProperty';

export function InvoiceDocuments() {
  const [t] = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const handleChange = useSetCurrentRecurringInvoiceProperty();

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      acceptedFiles.map((file) =>
        setFiles((current) => [
          ...current,
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ])
      );
    },
  });

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    files.forEach((file) => URL.revokeObjectURL(file.preview));

    handleChange('documents', files);
  }, [files]);

  const remove = (index: number) => {
    const current = [...files];

    current.splice(index, 1);

    setFiles(current);
  };

  return (
    <section className="container">
      <div
        {...getRootProps()}
        className="flex flex-col md:flex-row md:items-center"
      >
        <div className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <input {...getInputProps()} />
          <span className="mt-2 block text-sm font-medium text-gray-900">
            {t('dropzone_default_message')}
          </span>
        </div>
      </div>
      <aside className="flex flex-row flex-wrap justify-center lg:justify-start mt-4 lg:space-x-6 lg:mt-6">
        {files.map((file, index) => (
          <div
            key={index}
            className="flex flex-col items-center mr-4 mt-6 lg:mr-0 lg:mt-0"
          >
            <div className="h-32 w-32 rounded object-none p-2 border">
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <img src={file.preview} className="w-32" />
            </div>

            <Button
              behavior="button"
              className="mt-2"
              type="minimal"
              onClick={() => remove(index)}
            >
              {t('dropzone_remove_file')}
            </Button>
          </div>
        ))}
      </aside>
    </section>
  );
}
