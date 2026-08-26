/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { InputField } from '$app/components/forms';
import { Modal } from '$app/components/Modal';
import { useSampleInvoiceData } from '../hooks/useSampleInvoiceData';
import {
  InvoiceData,
  replaceVariables,
} from '../utils/variable-replacer';
import { useDesignerVariableGroups } from '../variables';

interface VariablePickerProps {
  onInsert: (variable: string) => void;
  onClose: () => void;
}

function previewExample(
  key: string,
  fallback: string,
  previewData: InvoiceData
) {
  const resolved = replaceVariables(key, previewData);

  return resolved !== key ? resolved : fallback;
}

export function VariablePicker({ onInsert, onClose }: VariablePickerProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const [searchTerm, setSearchTerm] = useState('');
  const variableGroups = useDesignerVariableGroups();
  const previewData = useSampleInvoiceData();

  const query = searchTerm.toLowerCase();
  const filteredGroups = variableGroups
    .map((group) => ({
      ...group,
      variables: group.variables.filter(
        (variable) =>
          variable.label.toLowerCase().includes(query) ||
          variable.key.toLowerCase().includes(query)
      ),
    }))
    .filter((group) => group.variables.length > 0);

  return (
    <Modal
      visible={true}
      onClose={onClose}
      title={t('variables')}
      size="regular"
    >
      <div className="space-y-4">
        <InputField
          label={t('search')}
          value={searchTerm}
          onValueChange={(val) => setSearchTerm(val)}
          placeholder="$number"
          changeOverride
          debounceTimeout={0}
        />

        <div
          className="max-h-[60vh] overflow-y-auto space-y-6 pr-3 pb-4"
          style={{ color: colors.$3 }}
        >
          {filteredGroups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t('no_records_found')}
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.label}>
                <h3
                  className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
                  style={{ color: colors.$17 }}
                >
                  {group.icon}
                  {group.label}
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {group.variables.map((variable) => (
                    <button
                      key={variable.key}
                      onClick={() => {
                        onInsert(variable.key);
                        onClose();
                      }}
                      className="text-left p-3 rounded-lg border transition-colors hover:shadow-sm"
                      style={{
                        backgroundColor: colors.$1,
                        borderColor: colors.$24,
                        color: colors.$3,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = colors.$16;
                        e.currentTarget.style.backgroundColor = colors.$23;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = colors.$24;
                        e.currentTarget.style.backgroundColor = colors.$1;
                      }}
                    >
                      <code
                        className="text-xs font-mono px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: colors.$20,
                          color: colors.$16,
                        }}
                      >
                        {variable.key}
                      </code>
                      <div
                        className="text-sm font-medium mt-1.5 mb-0.5"
                        style={{ color: colors.$3 }}
                      >
                        {variable.label}
                      </div>
                      <div className="text-xs" style={{ color: colors.$17 }}>
                        {t('example')}:{' '}
                        {previewExample(
                          variable.key,
                          variable.example,
                          previewData
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
