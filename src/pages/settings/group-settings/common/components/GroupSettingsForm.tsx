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
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Card, Element } from '$app/components/cards';
import { InputField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';

interface Props {
  groupSettings: GroupSettings;
  handleChange: (
    property: keyof GroupSettings,
    value: GroupSettings[keyof GroupSettings]
  ) => void;
  errors: ValidationBag | undefined;
  page?: 'create' | 'edit';
}

export function GroupSettingsForm(props: Props) {
  const [t] = useTranslation();

  const { groupSettings, handleChange, errors, page } = props;

  return (
    <Card title={page === 'create' ? t('create_group') : t('edit_group')}>
      <Element leftSide={t('name')}>
        <InputField
          value={groupSettings.name}
          onValueChange={(value) => handleChange('name', value)}
          errorMessage={errors?.errors.name}
        />
      </Element>
    </Card>
  );
}
