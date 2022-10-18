/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectField } from './forms';
import { Modal } from './Modal';

interface Props {
  columns: Record<string, string>;
  table: string;
}

export function DataTableColumnsPicker(props: Props) {
  const { t } = useTranslation();
  const { columns } = props;

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSelectChange = useCallback((value: string) => {
    console.log(value);
  }, []);

  return (
    <>
      <Modal
        title={t('edit_columns')}
        visible={isModalVisible}
        onClose={setIsModalVisible}
      >
        <SelectField
          label={t('add_column')}
          onValueChange={handleSelectChange}
          withBlank
        >
          {Object.entries(columns).map(([column, translation], index) => (
            <option key={index} value={column}>
              {t(translation)}
            </option>
          ))}
        </SelectField>
      </Modal>

      <button
        className="hidden lg:block lg:mx-4 text-sm"
        onClick={() => setIsModalVisible(true)}
      >
        {t('columns')}
      </button>
    </>
  );
}
