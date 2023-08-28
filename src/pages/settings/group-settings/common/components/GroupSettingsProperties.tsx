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
import { useResolvePropertyLabel } from '../hooks/useResolvePropertyLabel';
import { useResolvePropertyValue } from '../hooks/useResolvePropertyValue';
import { Card } from '$app/components/cards';

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

  const resolvePropertyLabel = useResolvePropertyLabel();

  const resolvePropertyValue = useResolvePropertyValue();

  const handleRemoveProperty = (property: string) => {
    const updatedSettings = { ...groupSettings.settings };

    delete updatedSettings[property];

    handleChange('settings', updatedSettings);
  };

  const shouldSectionBeAvailable = (sectionKey: string) => {
    return Object.entries(groupSettings.settings).some(
      ([key, value]) =>
        GroupSectionProperties[
          sectionKey as keyof typeof GroupSectionProperties
        ].includes(key) &&
        (value || typeof value === 'boolean')
    );
  };

  return (
    <div className="flex flex-col pt-6 w-full">
      {GroupSettingsSections.map(
        (section, index) =>
          shouldSectionBeAvailable(section) && (
            <Card
              key={index}
              title={t(section)}
              className="mb-4 last:mb-0"
              padding="regular"
              collapsed={index === 0 ? false : true}
            >
              <div className="flex flex-col mb-2 px-6">
                {Object.entries(groupSettings.settings).map(
                  ([property, value], index: number) =>
                    GroupSectionProperties[
                      section as keyof typeof GroupSectionProperties
                    ].includes(property) &&
                    (value || typeof value === 'boolean') && (
                      <div
                        key={index}
                        className="flex justify-between border-gray-200 rounded pl-3 pr-2 py-2 items-center w-1/2 first:mt-2"
                      >
                        <div className="flex flex-1 text-sm truncate">
                          {resolvePropertyLabel(property)}:
                        </div>

                        <span
                          className="flex flex-1 justify-start text-sm whitespace-normal pl-4"
                          dangerouslySetInnerHTML={{
                            __html: resolvePropertyValue(property, value),
                          }}
                        />

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
            </Card>
          )
      )}
    </div>
  );
}
