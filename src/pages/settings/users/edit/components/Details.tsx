/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { InputField } from '@invoiceninja/forms';
import { User } from 'common/interfaces/user';
import { useTranslation } from 'react-i18next';

interface Props {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
}

export function Details(props: Props) {
  const [t] = useTranslation();
  const { user, setUser } = props;

  const onChange = (field: keyof User, value: unknown) => {
    setUser((user) => user && { ...user, [field]: value });
  };

  return (
    <Card title={t('details')}>
      <Element leftSide={t('first_name')}>
        <InputField
          value={user?.first_name}
          onValueChange={(value) => onChange('first_name', value)}
        />
      </Element>

      <Element leftSide={t('last_name')}>
        <InputField
          value={user?.last_name}
          onValueChange={(value) => onChange('last_name', value)}
        />
      </Element>

      <Element leftSide={t('email')}>
        <InputField
          type="email"
          value={user?.email}
          onValueChange={(value) => onChange('email', value)}
        />
      </Element>

      <Element leftSide={t('phone')}>
        <InputField
          value={user?.phone}
          onValueChange={(value) => onChange('phone', value)}
        />
      </Element>
    </Card>
  );
}
