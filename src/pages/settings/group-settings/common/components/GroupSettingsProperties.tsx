/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { GroupSectionProperties } from '$app/common/constants/group-settings';
import { GroupSettings } from '$app/common/interfaces/group-settings';
import { Icon } from '$app/components/icons/Icon';
import { useTranslation } from 'react-i18next';
import { MdClose } from 'react-icons/md';

interface Props {
  groupSettings: GroupSettings;
  handleChange: (
    property: keyof GroupSettings,
    value: GroupSettings[keyof GroupSettings]
  ) => void;
}

const GroupSettingsSections = [
  'company_details',
  'localization',
  'payment_settings',
  'tax_settings',
  'task_settings',
  'workflow_settings',
  'invoice_design',
  'generated_numbers',
  'client_portal',
  'email_settings',
];

export function GroupSettingsProperties(props: Props) {
  const [t] = useTranslation();

  const { groupSettings, handleChange } = props;

  const customizeValueOutput = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? t('enabled') : t('disabled');
    }

    return t(value);
  };

  const handleRemoveProperty = (property: string) => {
    const updatedSettings = { ...groupSettings.settings };

    delete updatedSettings[property];

    handleChange('settings', updatedSettings);
  };

  const shouldSectionBeAvailable = (sectionKey: string) => {
    return Object.keys(groupSettings.settings).some((key) =>
      GroupSectionProperties[
        sectionKey as keyof typeof GroupSectionProperties
      ].includes(key)
    );
  };

  return (
    <div className="flex flex-col px-6 pt-6 w-full">
      {GroupSettingsSections.map(
        (section, index) =>
          shouldSectionBeAvailable(section) && (
            <div key={index} className="mb-4 last:mb-0">
              <span className="text-gray-600">{t(section)}:</span>

              <div className="flex flex-col mb-2">
                {Object.entries(groupSettings.settings).map(
                  ([property, value], index: number) =>
                    GroupSectionProperties[
                      section as keyof typeof GroupSectionProperties
                    ].includes(property) && (
                      <div
                        key={index}
                        className="flex justify-between border-gray-200 rounded pl-3 pr-2 py-2 items-center w-2/4 first:mt-2"
                      >
                        <div className="flex flex-1 text-sm truncate">
                          {t(property)}:
                        </div>

                        <span className="flex flex-1 justify-start text-sm whitespace-normal">
                          {customizeValueOutput(value)}
                        </span>

                        <div className="flex justify-end">
                          <Icon
                            className="cursor-pointer"
                            element={MdClose}
                            onClick={() => handleRemoveProperty(property)}
                            size={19}
                          />
                        </div>
                      </div>
                    )
                )}
              </div>
            </div>
          )
      )}
    </div>
  );
}
