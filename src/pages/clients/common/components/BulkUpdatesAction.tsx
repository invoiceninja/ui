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
import { useBulk as useBulkExpenses } from '$app/common/queries/expenses';
import { useBulkAction as useBulkRecurringInvoices } from '$app/pages/recurring-invoices/common/queries';
import { useStaticsQuery } from '$app/common/queries/statics';
import { CountrySelector } from '$app/components/CountrySelector';
import { CustomField } from '$app/components/CustomField';
import { Modal } from '$app/components/Modal';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import {
  Button,
  InputField,
  InputLabel,
  SelectField,
} from '$app/components/forms';
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import { Icon } from '$app/components/icons/Icon';
import { TaxRateSelector } from '$app/components/tax-rates/TaxRateSelector';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdCached } from 'react-icons/md';
import Toggle from '$app/components/forms/Toggle';

interface Props {
  entity: 'client' | 'expense' | 'recurring_invoice';
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
    | 'taxSelector'
    | 'toggle'
    | 'remainingCyclesSelector'
    | 'textarea';
}

const bulkUpdateFieldsTypes: BulkUpdateField[] = [
  { key: 'private_notes', type: 'markdownEditor' },
  { key: 'public_notes', type: 'markdownEditor' },
  { key: 'terms', type: 'markdownEditor' },
  { key: 'footer', type: 'markdownEditor' },
  { key: 'industry_id', type: 'industrySelector' },
  { key: 'size_id', type: 'sizeSelector' },
  { key: 'country_id', type: 'countrySelector' },
  { key: 'custom_value1', type: 'customField' },
  { key: 'custom_value2', type: 'customField' },
  { key: 'custom_value3', type: 'customField' },
  { key: 'custom_value4', type: 'customField' },
  { key: 'tax1', type: 'taxSelector' },
  { key: 'tax2', type: 'taxSelector' },
  { key: 'tax3', type: 'taxSelector' },
  { key: 'should_be_invoiced', type: 'toggle' },
  { key: 'uses_inclusive_taxes', type: 'toggle' },
  { key: 'remaining_cycles', type: 'remainingCyclesSelector' },
];

export function BulkUpdatesAction(props: Props) {
  const [t] = useTranslation();

  const { setSelected, resourceIds } = props;

  const bulkClients = useBulkClients();
  const bulkExpenses = useBulkExpenses();
  const bulkRecurringInvoices = useBulkRecurringInvoices();

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
  };

  const getFieldType = () => {
    if (props.entity === 'expense' && column.includes('notes')) {
      return 'textarea';
    }

    return bulkUpdateFieldsTypes.find(({ key }) => key === column)?.type || '';
  };

  useEffect(() => {
    if (column === 'remaining_cycles') {
      setNewColumnValue("-1");
    }
    else if (column === 'uses_inclusive_taxes') {
      setNewColumnValue(false);
    }
    else{
      setNewColumnValue('');
    }
  }, [column]);

  const showColumn = (columnKey: string) => {
    if (columnKey.includes('rate')) {
      return false;
    }

    if (columnKey.startsWith('custom_value')) {
      return Boolean(
        company.custom_fields[columnKey.replace('custom_value', props.entity)]
      );
    }

    if (columnKey.startsWith('tax')) {
      const taxNumber = Number(columnKey.split('tax')[1]);

      const enabledTaxRates =
        props.entity === 'expense'
          ? company.enabled_expense_tax_rates
          : company.enabled_tax_rates;

      if (taxNumber === 1) {
        return Boolean(enabledTaxRates > 0);
      }

      if (taxNumber === 2) {
        return Boolean(enabledTaxRates > 1);
      }

      return Boolean(enabledTaxRates > 2);
    }

    return true;
  };

  const getColumnTranslation = (currentColumn: string) => {
    if (currentColumn.startsWith('custom_value')) {
      return company.custom_fields[
        currentColumn.replace('custom_value', props.entity)
      ].split('|')[0];
    }

    return t(currentColumn);
  };

  const getCustomFieldKey = () => {
    return column.replace('custom_value', props.entity);
  };

  const handleUpdate = () => {
    if (props.entity === 'client') {
      bulkClients(resourceIds, 'bulk_update', {
        column,
        newValue: newColumnValue,
      }).then(() => handleOnClose());
    }

    if (props.entity === 'expense') {
      bulkExpenses(resourceIds, 'bulk_update', {
        column,
        new_value: newColumnValue,
      }).then(() => handleOnClose());
    }

    if (props.entity === 'recurring_invoice') {
      bulkRecurringInvoices(resourceIds, 'bulk_update', {
        column,
        new_value: newColumnValue,
      }).then(() => handleOnClose());
    }

    setSelected([]);
  };

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
              
            }}
            withBlank
            customSelector
          >
            {bulkUpdatesColumns?.[props.entity]
              .filter((currentCol) => showColumn(currentCol))
              .map((currentColumn) => (
                <option key={currentColumn} value={currentColumn}>
                  {getColumnTranslation(currentColumn)}
                </option>
              ))}
          </SelectField>

          <div className="flex flex-col">
            {Boolean(getFieldType()) && (
              <InputLabel className="mb-2">{t('value')}</InputLabel>
            )}

            {getFieldType() === 'taxSelector' && (
              <TaxRateSelector
                defaultValue={newColumnValue}
                onChange={(value) =>
                  value?.resource &&
                  setNewColumnValue(
                    `${value.resource.name}||${value.resource.rate}`
                  )
                }
                onTaxCreated={(taxRate) =>
                  setNewColumnValue(`${taxRate.name}||${taxRate.rate}`)
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

            {getFieldType() === 'remainingCyclesSelector' && (
                <SelectField
                  value={newColumnValue}
                  onValueChange={(value) => setNewColumnValue(value)}
                >
                  <option value="-1">{t('endless')}</option>
                  {[...Array(37).keys()].map((number, index) => (
                    <option value={number} key={index}>
                      {number}
                    </option>
                  ))}
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

            {getFieldType() === 'toggle' && (
              <Toggle
                checked={newColumnValue as boolean}
                onChange={(value) => setNewColumnValue(value)}
              />
            )}

            {getFieldType() === 'textarea' && (
              <InputField
                element="textarea"
                value={newColumnValue as string}
                onValueChange={(value) => setNewColumnValue(value)}
              />
            )}
          </div>

          <div className="flex self-end">
            <Button
              behavior="button"
              onClick={handleUpdate}
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
