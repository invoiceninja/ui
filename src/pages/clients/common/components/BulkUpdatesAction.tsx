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
import { useBulk as useBulkClients } from '$app/common/queries/clients';
import { useStaticsQuery } from '$app/common/queries/statics';
import { CountrySelector } from '$app/components/CountrySelector';
import { CustomField } from '$app/components/CustomField';
import { Modal } from '$app/components/Modal';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Button, InputLabel, SelectField } from '$app/components/forms';
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import { Icon } from '$app/components/icons/Icon';
import { TaxRateSelector } from '$app/components/tax-rates/TaxRateSelector';
import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdCached } from 'react-icons/md';

interface Props {
  entity: 'client' | 'expense';
  resourceIds: string[];
  setSelected: Dispatch<SetStateAction<string[]>>;
}

interface BulkUpdateField {
  key: string;
  type:
    | 'markdownEditor'
    | 'industrySelector'
    | 'sizeSelector'
    | 'countrySelector'
    | 'customField'
    | 'taxSelector';
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
  { key: 'tax_1', type: 'taxSelector' },
  { key: 'tax_2', type: 'taxSelector' },
  { key: 'tax_3', type: 'taxSelector' },
];

export function BulkUpdatesAction(props: Props) {
  const [t] = useTranslation();

  const { setSelected, resourceIds } = props;

  const bulkClients = useBulkClients();

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

  const showColumn = (columnKey: string) => {
    if (columnKey.startsWith('custom_value')) {
      return Boolean(
        company.custom_fields[columnKey.replace('custom_value', props.entity)]
      );
    }

    if (columnKey.startsWith('tax')) {
      const taxNumber = Number(columnKey.split('_')[1]);

      if (taxNumber === 1) {
        return Boolean(company.enabled_tax_rates > 0);
      }

      if (taxNumber === 2) {
        return Boolean(company.enabled_tax_rates > 1);
      }

      return Boolean(company.enabled_item_tax_rates > 2);
    }

    return true;
  };

  const getCustomFieldKey = () => {
    return column.replace('custom_value', props.entity);
  };

  console.log(bulkUpdatesColumns);

  return (
    <>
      <DropdownElement
        onClick={() => setIsModalOpen(true)}
        icon={<Icon element={MdCached} />}
      >
        {t('bulk_update')}
      </DropdownElement>

      <Modal
        title={t('bulk_update')}
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
            {bulkUpdatesColumns?.[props.entity].map(
              (currentColumn) =>
                showColumn(currentColumn) && (
                  <option key={currentColumn} value={currentColumn}>
                    {t(currentColumn)}
                  </option>
                )
            )}
          </SelectField>

          <div className="flex flex-col">
            {Boolean(getFieldType()) && (
              <InputLabel className="mb-2">{t('value')}</InputLabel>
            )}

            {getFieldType() === 'taxSelector' && (
              <TaxRateSelector
                defaultValue={newColumnValue as string}
                onChange={(value) =>
                  value?.resource &&
                  setNewColumnValue(
                    `${value.resource.name}||${value.resource.rate}`
                  )
                }
                onClearButtonClick={() => setNewColumnValue('')}
              />
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
                bulkClients(resourceIds, 'bulk_update', {
                  column,
                  newValue: newColumnValue,
                }).then(() => handleOnClose());

                setSelected([]);
              }}
              disabled={!column}
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
