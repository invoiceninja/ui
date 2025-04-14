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
import { Card, Element } from '$app/components/cards';
import { useFormik } from 'formik';
import { ChangeEvent, ReactNode, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { Button, SelectField } from '$app/components/forms';
import { Table, Tbody, Td, Th, Thead, Tr } from '$app/components/tables';
import Toggle from '$app/components/forms/Toggle';
import { MdClose } from 'react-icons/md';
import { BankAccountSelector } from '$app/pages/transactions/components/BankAccountSelector';
import { useColorScheme } from '$app/common/colors';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { AxiosError } from 'axios';
import { Alert } from '../Alert';
import { ImportTemplateModal } from './ImportTemplateModal';
import { useEntityImportTemplates } from './common/hooks/useEntityImportTemplates';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { ImportTemplate } from './ImportTemplate';
import { Icon } from '../icons/Icon';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { sha256 } from 'js-sha256';

interface Props {
    entity: string;
    onSuccess: boolean;
    onFileImported?: () => unknown;
    type: string;
    postWidgetSlot?: ReactNode;
    exampleUrl?: string;
}

export interface ImportMap extends Record<string, any> {
    hash: string;
    import_type: string;
    skip_header: boolean;
    bank_integration_id?: string;
}

interface ChunkMetadata {
    totalChunks: number;
    currentChunk: number;
    fileHash: string;
    fileName: string;
}

export function UploadCompanyImport(props: Props) {
    const [t] = useTranslation();
    const isImportFileTypeZip = props.type === 'zip';
    const acceptableFileExtensions = {
        ...(!isImportFileTypeZip && { 'text/*': ['.csv'] }),
        ...(isImportFileTypeZip && { 'application/zip': ['.zip'] }),
    };

    const colors = useColorScheme();
    const reactSettings = useReactSettings();

    const { numberOfTemplates, templates } = useEntityImportTemplates({
        entity: props.entity,
    });

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
    const [errors, setErrors] = useState<ValidationBag>();
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [defaultMapping, setDefaultMapping] = useState<Record<string, string>>(
        {}
    );
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const CHUNK_SIZE = 1024 * 1024 * 2; // 2MB chunks

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        payload.column_map[props.entity].mapping[event.target.id] =
            event.target.value;
        setPayloadData({ ...payload });
        setSelectedTemplate('');
    };

    const handleChangeTemplate = () => {
        const mappingTemplate: Record<string, string> = {};

        Object.entries(
            reactSettings?.import_templates?.[props.entity]?.[selectedTemplate] || {}
        ).forEach(([key, value]) => {
            mappingTemplate[key as keyof typeof mappingTemplate] = value || '';
        });

        setPayloadData((currentPayload) => ({
            ...currentPayload,
            column_map: {
                [props.entity]: { mapping: mappingTemplate },
            },
        }));
    };

    const onDeletedTemplate = () => {
        setSelectedTemplate('');
        setPayloadData((currentPayload) => ({
            ...currentPayload,
            column_map: {
                [props.entity]: { mapping: { ...defaultMapping } },
            },
        }));
    };

    const decorateMapping = (mapping: any) => {
        const split_map = mapping.split('.');

        let label_property = split_map[1];

        if (split_map[1] == 'user_id') label_property = 'user';

        if (split_map[1] == 'shipping_country_id')
            label_property = 'shipping_country';

        return `${t(split_map[0])} - ${t(label_property)}`;
    };

    const processImport = async () => {
        if (!files.length && isImportFileTypeZip) {
            toast.error('select_file');
            return;
        }

        if (isImportFileTypeZip && !importSettings && !importData) {
            toast.error('settings_or_data');
            return;
        }

        toast.processing();
        setErrors(undefined);

        try {
            if (isImportFileTypeZip) {
                // Process zip files with chunks only when import button is clicked
                const fileHash = await processFileInChunks(
                    files[0],
                    importSettings,
                    importData
                );

                if (fileHash) {
                    toast.success('import_complete');
                    props.onFileImported?.();
                    props.onSuccess;
                }
            } else {
                // Process CSV files normally
                payload.hash = mapData!.hash;
                const response = await request(
                    'POST',
                    endpoint('/api/v1/import'),
                    payload
                );

                if (response.data?.success) {
                    toast.success(response.data.message ?? 'error_title');
                    props.onFileImported?.();
                    props.onSuccess;
                } else {
                    toast.dismiss();
                    setErrors(response.data as ValidationBag);
                }
            }
        } catch (error) {
            toast.dismiss();
            setErrors(error as ValidationBag);
        }
    };

    const handleClearMapping = (index: number) => {
        if (payload.column_map[props.entity].mapping[index]) {
            payload.column_map[props.entity].mapping[index] = '';

            setSelectedTemplate('');
            setPayloadData({ ...payload });
        }
    };

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {},
        onSubmit: () => {
            toast.processing();
            setErrors(undefined);

            request('POST', endpoint('/api/v1/preimport'), formData)
                .then((response) => {
                    setMapData(response.data);
                    props.onSuccess;
                    toast.dismiss();

                    if (response.data?.mappings[props.entity]?.hints) {
                        response.data?.mappings[props.entity]?.hints.forEach(
                            (mapping: number, index: number) => {
                                payload.column_map[props.entity].mapping[index] =
                                    response.data?.mappings[props.entity].available[mapping] ??
                                    '';
                                setPayloadData(payload);
                                setDefaultMapping({
                                    ...payload?.column_map?.[props.entity]?.mapping,
                                });
                            }
                        );
                    }

                    setSelectedTemplate('');
                })
                .catch((error: AxiosError<ValidationBag>) => {
                    if (error.response?.status === 422) {
                        toast.dismiss();
                        setErrors(error.response.data);
                    }
                });
        },
    });

    const addFilesToFormData = () => {
        // Create a new FormData instance
        const newFormData = new FormData();

        // For non-zip files, append with entity key
        if (!isImportFileTypeZip) {
            files.forEach((file) => {
                newFormData.append(`files[${props.entity}]`, file);
            });
        } else {
            // For zip files, append directly
            files.forEach((file) => {
                newFormData.append('files', file);
            });
        }

        // Set the new FormData
        setFormData(newFormData);
    };

    const getColumnValue = (index: number) => {
        if (!Object.keys(payload?.column_map[props.entity]?.mapping).length)
            return null;

        return payload?.column_map[props.entity]?.mapping[index] ?? null;
    };

    const removeFileFromFormData = (fileIndex: number) => {
        const filteredFileList = files.filter((file, index) => fileIndex !== index);

        const updatedFormData = new FormData();

        if (!isImportFileTypeZip) {
            filteredFileList.forEach((file) => {
                updatedFormData.append(`files[${props.entity}]`, file);
            });
        } else {
            filteredFileList.forEach((file) => {
                updatedFormData.append('files', file);
            });
        }

        setFiles(filteredFileList);
        setFormData(updatedFormData);
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

    // Add this helper function for file hash calculation
    const calculateFileHash = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const chunkSize = 2097152; // 2MB chunk size
            const fileReader = new FileReader();
            const fileHash = sha256.create();

            fileReader.onload = () => {
                fileHash.update(fileReader.result as string);
                resolve(fileHash.hex());
            };

            fileReader.onerror = (error) => reject(error);

            // Read file in chunks (just one chunk for simplicity)
            fileReader.readAsArrayBuffer(file.slice(0, chunkSize));  // Just read the first 2MB (or adjust)
        });
    };

    // Update the uploadChunk function
    const uploadChunk = async (
        chunk: Blob,
        metadata: ChunkMetadata,
        importSettings: boolean,
        importData: boolean
    ): Promise<void> => {

        const chunkFormData = new FormData();

        // Create a new File from the chunk with explicit size and type
        const chunkFile = new File([chunk], metadata.fileName, {
            type: 'application/octet-stream', // Use generic binary type for chunks
            lastModified: new Date().getTime(),
        });

        chunkFormData.append('file', chunkFile);
        chunkFormData.append('metadata', JSON.stringify({
            ...metadata,
            chunkSize: chunk.size, // Add chunk size to metadata for server verification
        }));
        chunkFormData.append('import_settings', String(importSettings));
        chunkFormData.append('import_data', String(importData));

        const endPointUrl = '/api/v1/import_json';
        const params: Record<string, boolean | number> = {
            chunk_number: metadata.currentChunk,
            total_chunks: metadata.totalChunks,
        };

        if (importSettings) {
            params.import_settings = true;
        }
        if (importData) {
            params.import_data = true;
        }

        const response = await request(
            'POST',
            endpoint(endPointUrl, params),
            chunkFormData,
            {
                headers: {
                    // 'Content-Type': 'multipart/form-data', //could be overriding the default content type headers cause silent failure 2025-04-04
                },
            }
        );

        if (!response.data?.success) {
            console.error('Chunk upload failed:', response.data);
            throw new Error(`Chunk upload failed: ${metadata.currentChunk + 1}`);
        }
    };

    // Update the processFileInChunks function
    const processFileInChunks = async (
        file: File,
        importSettings: boolean,
        importData: boolean
    ) => {
        // Early return if not a zip file
        const validZipTypes = ['application/zip', 'application/x-zip-compressed'];
        if (!validZipTypes.includes(file.type) && !file.name.endsWith('.zip')) {
            toast.error('invalid_zip_file');
            return null;
        }

        try {
            const fileHash = await calculateFileHash(file);
            const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

            for (let i = 0; i < totalChunks; i++) {
                const start = i * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, file.size);
                const chunk = file.slice(start, end);

                const metadata: ChunkMetadata = {
                    totalChunks,
                    currentChunk: i,
                    fileHash,
                    fileName: file.name,
                };

                await uploadChunk(chunk, metadata, importSettings, importData);
                setUploadProgress(((i + 1) / totalChunks) * 100);
            }

            return fileHash;
        } catch (error) {
            console.log('Chunk upload failed:', error);
            toast.error('chunk_upload_failed');
            setUploadProgress(0);
            throw error;
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: acceptableFileExtensions,
        onDrop: async (acceptedFiles) => {

            try {
                if (isImportFileTypeZip) {
                    // For zip files, just set the files and wait for manual import
                    setFiles(acceptedFiles);
                    setUploadProgress(0);
                } else {
                    // For CSV files, validate and process immediately
                    const shouldAddFiles = await shouldUploadFiles(acceptedFiles);
                    if (shouldAddFiles) {
                        const isFilesTypeCorrect = acceptedFiles.every(({ type }) =>
                            type.includes(props.type)
                        );

                        if (isFilesTypeCorrect) {
                            setFiles(acceptedFiles);
                            formik.submitForm();
                        } else {
                            toast.error('wrong_file_extension');
                        }
                    } else {
                        toast.error('csv_rows_length');
                    }
                }
            } catch (error) {
                console.error('Upload error:', error);
                toast.error('upload_failed');
                setUploadProgress(0);
            }
        },
    });

    useEffect(() => {
        if (files.length > 0) {
            addFilesToFormData();
        }
    }, [files]);

    useEffect(() => {
        if (selectedTemplate) {
            handleChangeTemplate();
        }
    }, [selectedTemplate]);

    useEffect(() => {
        return () => setSelectedTemplate('');
    }, []);

    const accentColor = useAccentColor();

    const downloadExampleFile = () => {
        if (props.exampleUrl) {
            window.open(props.exampleUrl, '_blank');
        }
    };

    return (
        <>
            <Card title={t(props.entity)}>
                <Element
                    leftSide={t(isImportFileTypeZip ? 'company_backup_file' : 'csv_file')}
                    leftSideHelp={isImportFileTypeZip && t('company_backup_file_help')}
                >
                    {props.exampleUrl ? (
                        <button
                            type="button"
                            style={{ color: accentColor }}
                            className="inline-flex items-center space-x-1 mb-4"
                            onClick={downloadExampleFile}
                        >
                            <span>{t('download_example_file')}</span>
                        </button>
                    ) : null}

                    {!files.length ? (
                        <div
                            {...getRootProps()}
                            className="flex flex-col md:flex-row md:items-center"
                        >
                            <div className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
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
                            </div>

                            {errors &&
                                Object.keys(errors.errors).map((key, index) => (
                                    <Alert key={index} type="danger">
                                        {errors.errors[key]}
                                    </Alert>
                                ))}
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

                    {props.postWidgetSlot ?? null}
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
                                behavior="button"
                                onClick={processImport}
                                disableWithoutIcon
                                disabled={(!importSettings && !importData) || !files.length}
                            >
                                {t('import')}
                            </Button>
                        </div>
                    </>
                )}
            </Card>

            {mapData && !isImportFileTypeZip && Boolean(numberOfTemplates) && (
                <Card className="mt-4">
                    <Element leftSide={t('template')}>
                        <SelectField
                            value={selectedTemplate}
                            onValueChange={(value) => {
                                setSelectedTemplate(value);

                                if (!value) {
                                    setPayloadData((currentPayload) => ({
                                        ...currentPayload,
                                        column_map: {
                                            [props.entity]: { mapping: { ...defaultMapping } },
                                        },
                                    }));
                                }
                            }}
                            withBlank
                        >
                            {templates
                                .filter((currentTemplate) => currentTemplate)
                                .map((template, index) => (
                                    <option key={index} value={template}>
                                        {template}
                                    </option>
                                ))}
                        </SelectField>
                    </Element>

                    {selectedTemplate && (
                        <ImportTemplate
                            name={selectedTemplate}
                            entity={props.entity}
                            onDeletedTemplate={onDeletedTemplate}
                        />
                    )}
                </Card>
            )}

            {mapData && !isImportFileTypeZip && (
                <Table>
                    <Thead>
                        <Th>{t('header')}</Th>
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
                                        <div className="flex items-center space-x-2">
                                            <div className="flex-1">
                                                <SelectField
                                                    id={index}
                                                    value={getColumnValue(index)}
                                                    onChange={handleChange}
                                                    withBlank
                                                >
                                                    {mapData.mappings[props.entity].available.map(
                                                        (mapping: any, index: number) => (
                                                            <option value={mapping} key={index}>
                                                                {decorateMapping(mapping)}
                                                            </option>
                                                        )
                                                    )}
                                                </SelectField>
                                            </div>

                                            <Icon
                                                className="cursor-pointer"
                                                element={MdClose}
                                                size={24}
                                                onClick={() => handleClearMapping(index)}
                                            />
                                        </div>
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
                                    <BankAccountSelector
                                        value={payload.bank_integration_id}
                                        onChange={(bankAccount) =>
                                            setPayloadData((prevState) => ({
                                                ...prevState,
                                                bank_integration_id: bankAccount?.id,
                                            }))
                                        }
                                        onClearButtonClick={() =>
                                            setPayloadData((prevState) => ({
                                                ...prevState,
                                                bank_integration_id: '',
                                            }))
                                        }
                                        errorMessage={errors?.errors.bank_integration_id}
                                    />
                                </Td>
                            </Tr>
                        )}
                        <Tr>
                            <Td colSpan={2}>
                                <ImportTemplateModal
                                    entity={props.entity}
                                    importMap={payload}
                                    onImport={processImport}
                                />
                            </Td>
                        </Tr>
                    </Tbody>
                </Table>
            )}

            {/* Add progress bar when uploading large files */}
            {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-4">
                    <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                    ></div>
                    <div className="text-sm text-gray-500 mt-1">
                        {Math.round(uploadProgress)}% uploaded
                    </div>
                </div>
            )}
        </>
    );
}
