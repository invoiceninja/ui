/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { User } from '$app/common/interfaces/docuninja/api';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Element } from '$app/components/cards';
import { InputField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';

interface Props {
  user: User | undefined;
  errors: ValidationBag | undefined;
  handleChange: (key: string, value: string) => void;
}

export function Form({ user, errors, handleChange }: Props) {
  const { t } = useTranslation();

  return (
    <>
      <Element leftSide={t('first_name')}>
        <InputField
          value={user?.first_name || ''}
          onValueChange={(value) => handleChange('first_name', value)}
          errorMessage={errors?.errors.first_name}
        />
      </Element>

      <Element leftSide={t('last_name')}>
        <InputField
          value={user?.last_name || ''}
          onValueChange={(value) => handleChange('last_name', value)}
          errorMessage={errors?.errors.last_name}
        />
      </Element>
    </>
  );
}
