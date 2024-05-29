/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useBulkUpdatesColumns } from '$app/common/hooks/useBulkUpdatesColumns';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Client } from '$app/common/interfaces/client';
import { useBulk } from '$app/common/queries/clients';
import { useStaticsQuery } from '$app/common/queries/statics';
import { CountrySelector } from '$app/components/CountrySelector';
import { CustomField } from '$app/components/CustomField';
import { Modal } from '$app/components/Modal';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Button, InputLabel, SelectField } from '$app/components/forms';
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import { Icon } from '$app/components/icons/Icon';
import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdUpdate } from 'react-icons/md';

interface Props {
  entity: 'client';
  resources: Client[];
  setSelected: Dispatch<SetStateAction<string[]>>;
}

interface BulkUpdateField {
  key: string;
  type:
    | 'markdownEditor'
    | 'industrySelector'
    | 'sizeSelector'
    | 'countrySelector'
    | 'customField';
}

const bulkUpdateFieldsTypes: BulkUpdateField[] = [
  { key: 'public_notes', type: 'markdownEditor' },
  { key: 'industry_id', type: 'industrySelector' },
  { key: 'size_id', type: 'sizeSelector' },
  { key: 'country_id', type: 'countrySelector' },
  { key: 'custom_value1', type: 'customField' },
  { key: 'custom_value2', type: 'customField' },
  { key: 'custom_value3', type: 'customField' },
  { key: 'custom_value4', type: 'customField' },
];

export function BulkUpdatesAction(props: Props) {
  const [t] = useTranslation();

  const { setSelected } = props;

  const bulk = useBulk();

  const { data: statics } = useStaticsQuery();

  const company = useCurrentCompany();
  const bulkUpdatesColumns = useBulkUpdatesColumns();

  const [column, setColumn] = useState<string>('');
  const [newColumnValue, setNewColumnValue] = useState<
    string | number | boolean
  >('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleOnClose = () => {
    setIsModalOpen(false);
    setColumn('');
    setNewColumnValue('');
  };

  const getFieldType = () => {
    return bulkUpdateFieldsTypes.find(({ key }) => key === column)?.type || '';
  };

  const getCustomFieldKey = () => {
    return column.replace('custom_value', props.entity);
  };

  return (
    <>
      <DropdownElement
        onClick={() => setIsModalOpen(true)}
        icon={<Icon element={MdUpdate} />}
      >
        {t('update_records')}
      </DropdownElement>

      <Modal
        title={t('update')}
        size="regular"
        visible={isModalOpen}
        onClose={handleOnClose}
        overflowVisible
      >
        <div className="flex flex-col space-y-5">
          <SelectField
            label={t('column')}
            value={column}
            onValueChange={(value) => {
              setColumn(value);
              setNewColumnValue('');
            }}
            withBlank
          >
            {bulkUpdatesColumns?.[props.entity].map((column) => (
              <option key={column} value={column}>
                {t(column)}
              </option>
            ))}
          </SelectField>

          <div className="flex flex-col">
            {Boolean(getFieldType()) && (
              <InputLabel className="mb-2">{t('value')}</InputLabel>
            )}

            {getFieldType() === 'markdownEditor' && (
              <MarkdownEditor
                value={newColumnValue as string}
                onChange={(value) => setNewColumnValue(value)}
              />
            )}

            {getFieldType() === 'industrySelector' && (
              <SelectField
                value={newColumnValue}
                onValueChange={(value) => setNewColumnValue(value)}
                withBlank
              >
                {statics?.industries.map(
                  (industry: { id: string; name: string }) => (
                    <option key={industry.id} value={industry.id}>
                      {industry.name}
                    </option>
                  )
                )}
              </SelectField>
            )}

            {getFieldType() === 'sizeSelector' && (
              <SelectField
                value={newColumnValue}
                onValueChange={(value) => setNewColumnValue(value)}
                withBlank
              >
                {statics?.sizes.map(
                  (size: { id: string; name: string }, index: number) => (
                    <option key={index} value={size.id}>
                      {size.name}
                    </option>
                  )
                )}
              </SelectField>
            )}

            {getFieldType() === 'countrySelector' && (
              <CountrySelector
                value={newColumnValue as string}
                onChange={(value) => setNewColumnValue(value)}
                dismissable
              />
            )}

            {getFieldType() === 'customField' &&
              company?.custom_fields?.[getCustomFieldKey()] && (
                <CustomField
                  field={getCustomFieldKey()}
                  defaultValue={newColumnValue}
                  value={company.custom_fields[getCustomFieldKey()]}
                  onValueChange={(value) => setNewColumnValue(value)}
                  fieldOnly
                />
              )}
          </div>

          <div className="flex self-end">
            <Button
              behavior="button"
              onClick={() => {
                setSelected([]);
              }}
              disableWithoutIcon
            >
              {t('update')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
