/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { GroupSettings } from '$app/common/interfaces/group-settings';
import { Icon } from '$app/components/icons/Icon';
import { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdClose } from 'react-icons/md';

interface Props {
  groupSettings: GroupSettings;
  handleChange: (
    property: keyof GroupSettings,
    value: GroupSettings[keyof GroupSettings]
  ) => void;
}

export function GroupSettingsProperties(props: Props) {
  const [t] = useTranslation();

  const { groupSettings, handleChange } = props;

  const gridElement = useRef<HTMLDivElement>(null);

  const [numberOfGridColumns, setNumberOfGridColumns] = useState(-1);

  useLayoutEffect(() => {
    const updateNumberOfGridColumns = () => {
      if (gridElement.current) {
        const width = gridElement.current.offsetWidth - 48;

        setNumberOfGridColumns(Math.floor(width / 400));
      }
    };

    updateNumberOfGridColumns();

    window.addEventListener('resize', updateNumberOfGridColumns);

    return () => {
      //window.removeEventListener('resize', updateGridWidth);
    };
  }, []);

  const customizeValueOutput = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? t('enabled') : t('disabled');
    }

    return t(value);
  };

  const getOrderForProperty = (propertyIndex: number) => {
    const numberOfProperties = Object.keys(groupSettings.settings).length;
    const elementsPerRow = Math.ceil(numberOfProperties / numberOfGridColumns);
    const numberOfGridRows = Math.ceil(numberOfProperties / elementsPerRow);

    // Određivanje reda i kolone za dati indeks elementa
    const row = Math.floor(propertyIndex / elementsPerRow);
    const column = propertyIndex % elementsPerRow;

    // Određivanje order vrijednosti na osnovu reda i kolone
    const order = row + column * numberOfGridRows + 1;

    return order;
  };

  const handleRemovePropertyFromSettings = (property: string) => {
    const updatedSettings = { ...groupSettings.settings };

    delete updatedSettings[property];

    handleChange('settings', updatedSettings);
  };

  console.log(Object.entries(groupSettings.settings));

  return (
    <div
      ref={gridElement}
      className="grid gap-y-3 p-6 w-full"
      style={{
        gridTemplateColumns: 'repeat(auto-fill, minmax(25rem, 1fr))',
      }}
    >
      {Object.entries(groupSettings.settings).map(
        ([property, value], index: number) => (
          <div
            key={index}
            className="flex border border-gray-200 rounded w-max pl-3 pr-2 py-2 items-center space-x-4"
            style={{ order: getOrderForProperty(index) }}
          >
            <div className="flex space-x-1 text-sm">
              <span>{t(property)}:</span>
              <span>{customizeValueOutput(value)}</span>
            </div>

            <Icon
              className="cursor-pointer"
              element={MdClose}
              onClick={() => handleRemovePropertyFromSettings(property)}
              size={19}
            />
          </div>
        )
      )}
    </div>
  );
}
