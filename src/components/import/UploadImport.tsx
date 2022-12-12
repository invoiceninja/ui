/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { toast } from 'common/helpers/toast/toast';
import { Card, Element } from '@invoiceninja/cards';
import { useFormik } from 'formik';
import { ChangeEvent, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { request } from 'common/helpers/request';
import { endpoint } from 'common/helpers';
import { Button, SelectField } from '@invoiceninja/forms';
import { Table, Tbody, Td, Th, Thead, Tr } from '@invoiceninja/tables';
import { DebouncedCombobox } from 'components/forms/DebouncedCombobox';
import Toggle from 'components/forms/Toggle';
import { BiDownload } from 'react-icons/bi';
import { MdClose } from 'react-icons/md';

interface Props {
  entity: string;
  onSuccess: boolean;
  type: string;
}

interface ImportMap extends Record<string, any> {
  hash: string;
  import_type: string;
  skip_header: boolean;
  bank_integration_id?: string;
}

export function UploadImport(props: Props) {
  const [t] = useTranslation();
  const isImportFileTypeZip = props.type === 'zip';
  const acceptableFileTypes = {
    ...(!isImportFileTypeZip && { 'text/*': ['.csv'] }),
    ...(isImportFileTypeZip && { 'application/zip': ['.zip'] }),
  };

  const [importSettings, setImportSettings] = useState<boolean>(false);
  const [importData, setImportData] = useState<boolean>(false);
  const [formData, setFormData] = useState(new FormData());
  const [files, setFiles] = useState<File[]>([]);
  const [mapData, setMapData] = useState<ImportMap>();
  const [payload, setPayloadData] = useState<ImportMap>({
    hash: '',
    import_type: props.type,
    skip_header: true,
    column_map: { [props.entity]: { mapping: {} } },
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    payload.column_map[props.entity].mapping[event.target.id] =
      event.target.value;
    setPayloadData(payload);
  };

  const decorateMapping = (mapping: any) => {
    const split_map = mapping.split('.');

    let label_property = split_map[1];

    if (split_map[1] == 'user_id') label_property = 'user';

    if (split_map[1] == 'shipping_country_id')
      label_property = 'shipping_country';

    return `${t(split_map[0])} - ${t(label_property)}`;
  };

  const processImport = () => {
    if (!files.length && isImportFileTypeZip) {
      toast.error('select_file');
      return;
    }

    toast.processing();

    let endPointUrl = '/api/v1/import';
    let params = {};

    if (isImportFileTypeZip) {
      endPointUrl = '/api/v1/import_json?';
      if (!importSettings && !importData) {
        toast.error('data_or_settings');
        return;
      } else {
        if (importSettings) {
          endPointUrl += '&import_settings=:import_settings';
          params = {
            import_settings: true,
          };
        }
        if (importData) {
          endPointUrl += '&import_data=:import_data';
          params = {
            ...params,
            import_data: true,
          };
        }
      }
    } else {
      payload.hash = mapData!.hash;
    }

    const requestData = isImportFileTypeZip ? formData : payload;

    request('POST', endpoint(endPointUrl, params), requestData)
      .then((response) => {
        toast.success(response?.data?.message ?? 'error_title');
        props.onSuccess;
      })
      .catch((error) => {
        console.error(error);
        toast.error();
      });
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {},
    onSubmit: () => {
      toast.processing();

      request('POST', endpoint('/api/v1/preimport'), formData)
        .then((response) => {
          setMapData(response.data);
          props.onSuccess;
          toast.dismiss();
        })
        .catch((error) => {
          console.error(error);
          toast.error();
        });
    },
  });

  const updateFormDataFiles = () => {
    files.forEach((file) => {
      formData.append('files', file);
    });

    setFormData(formData);
  };

  const removeFileFromFormData = (fileIndex: number) => {
    const filteredFileList = files.filter((file, index) => fileIndex !== index);

    const updatedFormData = new FormData();

    filteredFileList.forEach((file) => {
      updatedFormData.append('files', file);
    });

    setFiles(filteredFileList);

    setFormData(updatedFormData);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: acceptableFileTypes,
    onDrop: (acceptedFiles) => {
      const isFilesTypeCorrect = acceptedFiles.every(({ type }) =>
        type.includes(props.type)
      );

      if (isFilesTypeCorrect) {
        acceptedFiles.forEach((file) => {
          if (isImportFileTypeZip) {
            setFiles((prevState) => [...prevState, file]);
          } else {
            formData.append(`files[${props.entity}]`, file);
          }
        });
        setFormData(formData);
        if (!isImportFileTypeZip) {
          formik.submitForm();
          formData.append('import_type', props.entity);
        }
      } else {
        toast.error('wrong_file_extension');
      }
    },
  });

  useEffect(() => {
    updateFormDataFiles();
  }, [files]);

  return (
    <>
      <Card title={t(props.entity)}>
        <Element leftSide={t(props.type + '_file')}>
          {!files.length ? (
            <div
              {...getRootProps()}
              className="flex flex-col md:flex-row md:items-center"
            >
              <div className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <input {...getInputProps()} />
                <Image className="mx-auto h-12 w-12 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  {isDragActive
                    ? 'drop_your_files_here'
                    : t('dropzone_default_message')}
                </span>
              </div>
            </div>
          ) : (
            <ul className="grid xs:grid-rows-6 lg:grid-cols-2">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center hover:bg-gray-50 cursor-pointer p-2"
                >
                  {file.name} - {(file.size / 1024).toPrecision(2)} KB{' '}
                  {
                    <MdClose
                      fontSize={15}
                      className="cursor-pointer ml-3"
                      onClick={() => removeFileFromFormData(index)}
                    />
                  }
                </li>
              ))}
            </ul>
          )}
        </Element>

        {isImportFileTypeZip && (
          <>
            <Element leftSide={t('import_settings')}>
              <Toggle
                checked={importSettings}
                onValueChange={(value) => setImportSettings(value)}
              />
            </Element>

            <Element leftSide={t('import_data')}>
              <Toggle
                checked={importData}
                onValueChange={(value) => setImportData(value)}
              />
            </Element>

            <div className="flex justify-end pr-5">
              <Button
                className="w-28"
                behavior="button"
                onClick={processImport}
                disableWithoutIcon
                disabled={(!importSettings && !importData) || !files.length}
              >
                <div className="flex items-center">
                  <BiDownload className="mr-2" fontSize={22} />
                  {t('import')}
                </div>
              </Button>
            </div>
          </>
        )}
      </Card>

      {mapData && !isImportFileTypeZip && (
        <Table>
          <Thead>
            <Th>{t('headers')}</Th>
            <Th>{t('columns')}</Th>
          </Thead>
          <Tbody>
            {mapData.mappings[props.entity].headers[0].map(
              (mapping: any, index: number) => (
                <Tr key={index}>
                  <Td className="space-x-2">
                    <span>{mapping}</span>

                    <span className="text-gray-400">
                      {mapData.mappings[props.entity].headers[1][
                        index
                      ].substring(0, 20)}
                    </span>
                  </Td>
                  <Td>
                    <SelectField id={index} onChange={handleChange} withBlank>
                      {mapData.mappings[props.entity].available.map(
                        (mapping: any, index: number) => (
                          <option value={mapping} key={index}>
                            {decorateMapping(mapping)}
                          </option>
                        )
                      )}
                    </SelectField>
                  </Td>
                </Tr>
              )
            )}
            {props.entity === 'bank_transaction' && (
              <Tr>
                <Td className="space-x-2">
                  <span>{t('bank_account')}</span>
                </Td>
                <Td colSpan={2}>
                  <DebouncedCombobox
                    endpoint="/api/v1/bank_integrations"
                    label="bank_account_name"
                    clearButton
                    onChange={(transaction) =>
                      setPayloadData((prevState) => ({
                        ...prevState,
                        bank_integration_id: transaction?.resource?.id,
                      }))
                    }
                    onClearButtonClick={() =>
                      setPayloadData((prevState) => ({
                        ...prevState,
                        bank_integration_id: '',
                      }))
                    }
                  />
                </Td>
              </Tr>
            )}
            <Tr>
              <Td colSpan={2}>
                <Button
                  className="flex float-right"
                  behavior="button"
                  onClick={processImport}
                >
                  {t('import')}
                </Button>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      )}
    </>
  );
}
