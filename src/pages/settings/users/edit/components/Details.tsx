/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { InputField } from '$app/components/forms';
import { User } from '$app/common/interfaces/user';
import { useTranslation } from 'react-i18next';
import { ValidationBag } from '$app/common/interfaces/validation-bag';

interface Props {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
  errors?: ValidationBag;
}

export function Details(props: Props) {
  const [t] = useTranslation();
  const { user, setUser } = props;

  const onChange = (field: keyof User, value: unknown) => {
    setUser((user) => user && { ...user, [field]: value });
  };

  return (
    <Card title={t('details')}>
      <Element leftSide={t('first_name')} required>
        <InputField
          value={user?.first_name}
          onValueChange={(value) => onChange('first_name', value)}
          errorMessage={props.errors?.errors.first_name}
        />
      </Element>

      <Element leftSide={t('last_name')} required>
        <InputField
          value={user?.last_name}
          onValueChange={(value) => onChange('last_name', value)}
          errorMessage={props.errors?.errors.last_name}
        />
      </Element>

      <Element leftSide={t('email')}>
        <InputField
          type="email"
          value={user?.email}
          onValueChange={(value) => onChange('email', value)}
          errorMessage={props.errors?.errors.email}
        />
      </Element>

      <Element leftSide={t('phone')}>
        <InputField
          value={user?.phone}
          onValueChange={(value) => onChange('phone', value)}
          errorMessage={props.errors?.errors.phone}
        />
      </Element>
    </Card>
  );
}
