/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import toast from 'react-hot-toast';
import { Card, Element } from '@invoiceninja/cards';
import { useFormik } from 'formik';
import { ChangeEvent, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { request } from 'common/helpers/request';
import { endpoint } from 'common/helpers';
import { Button, SelectField } from '@invoiceninja/forms';
import { Table, Tbody, Td, Th, Thead, Tr } from '@invoiceninja/tables';
import { DebouncedCombobox } from 'components/forms/DebouncedCombobox';

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
  const [formData, setFormData] = useState(new FormData());
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
    const toastId = toast.loading(t('processing'));
    payload.hash = mapData!.hash;

    request('POST', endpoint('/api/v1/import'), payload)
      .then((response) => {
        toast.success(response?.data?.message ?? t('error_title'), {
          id: toastId,
        });
        props.onSuccess;
      })
      .catch((error) => {
        console.error(error);
        toast.error(t('error_title'), { id: toastId });
      });
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {},
    onSubmit: () => {
      const toastId = toast.loading(t('processing'));

      request('POST', endpoint('/api/v1/preimport'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
        .then((response) => {
          setMapData(response.data);
          props.onSuccess;
          toast.dismiss();
        })
        .catch((error) => {
          console.error(error);
          toast.error(t('error_title'), { id: toastId });
        });
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ['.csv'],
    onDrop: (acceptedFiles) => {
      acceptedFiles.forEach((file) =>
        formData.append(`files[${props.entity}]`, file)
      );
      formData.append('import_type', props.entity);
      setFormData(formData);

      formik.submitForm();
    },
  });

  return (
    <>
      <Card title={t(props.entity)}>
        <Element leftSide={t('csv_file')}>
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
        </Element>
      </Card>

      {mapData && (
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
