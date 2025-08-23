/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Card, Element } from '$app/components/cards';
import { InputField } from '$app/components/forms';
import { cloneDeep, set } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { User } from '$app/common/interfaces/docuninja/api';

export interface DocuninjaUserProps {
  user: User;
  setUser: Dispatch<SetStateAction<User | undefined>>;
  errors: ValidationBag | undefined;
}

export default function Details({ user, setUser, errors }: DocuninjaUserProps) {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const handleChange = (key: keyof User, value: string) => {
    const updatedUser = cloneDeep(user) as User;

    set(updatedUser, key, value);

    setUser(updatedUser);
  };

  return (
    <Card
      title={t('user_details')}
      className="shadow-sm w-full lg:w-2/3"
      childrenClassName="pb-8"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
    >
      <Element leftSide={t('first_name')}>
        <InputField
          value={user?.first_name}
          onValueChange={(value) => handleChange('first_name', value)}
          errorMessage={errors?.errors.first_name}
        />
      </Element>

      <Element leftSide={t('last_name')}>
        <InputField
          value={user?.last_name}
          onValueChange={(value) => handleChange('last_name', value)}
          errorMessage={errors?.errors.last_name}
        />
      </Element>

      <Element leftSide={t('email')}>
        <InputField
          value={user?.email}
          onValueChange={(value) => handleChange('email', value)}
          errorMessage={errors?.errors.email}
        />
      </Element>
    </Card>
  );
}
