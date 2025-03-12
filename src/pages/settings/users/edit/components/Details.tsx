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
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { CustomField } from '$app/components/CustomField';
import Toggle from '$app/components/forms/Toggle';

interface Props {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
  errors?: ValidationBag;
}

export function Details(props: Props) {
  const [t] = useTranslation();
  const { user, setUser } = props;

  const onChange = (field: keyof User, value: string | number | boolean) => {
    setUser((user) => user && { ...user, [field]: value });
  };

  const company = useCurrentCompany();

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

      <Element
        leftSide={t('login_notification')}
        leftSideHelp={t('login_notification_help')}
      >
        <Toggle
          checked={user?.user_logged_in_notification}
          onChange={(value) => onChange('user_logged_in_notification', value)}
        />
      </Element>

      {company?.custom_fields?.user1 && (
        <CustomField
          field="user1"
          defaultValue={user.custom_value1}
          value={company.custom_fields.user1}
          onValueChange={(value) => onChange('custom_value1', String(value))}
        />
      )}

      {company?.custom_fields?.user2 && (
        <CustomField
          field="user2"
          defaultValue={user.custom_value2}
          value={company.custom_fields.user2}
          onValueChange={(value) => onChange('custom_value2', String(value))}
        />
      )}

      {company?.custom_fields?.user3 && (
        <CustomField
          field="user3"
          defaultValue={user.custom_value3}
          value={company.custom_fields.user3}
          onValueChange={(value) => onChange('custom_value3', String(value))}
        />
      )}

      {company?.custom_fields?.user4 && (
        <CustomField
          field="user4"
          defaultValue={user.custom_value4}
          value={company.custom_fields.user4}
          onValueChange={(value) => onChange('custom_value4', String(value))}
        />
      )}
    </Card>
  );
}
