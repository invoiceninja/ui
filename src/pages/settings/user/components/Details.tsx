/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { updateChanges } from 'common/stores/slices/user';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Card, Element } from '../../../../components/cards';
import { InputField } from '../../../../components/forms';

export function Details() {
  const [t] = useTranslation();
  const user = useCurrentUser();
  const dispatch = useDispatch();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    dispatch(
      updateChanges({ property: event.target.id, value: event.target.value })
    );

  return (
    <Card title={t('details')}>
      <Element leftSide={t('first_name')}>
        <InputField
          id="first_name"
          value={user.first_name || ''}
          onChange={handleChange}
        />
      </Element>

      <Element leftSide={t('last_name')}>
        <InputField
          id="last_name"
          value={user.last_name || ''}
          onChange={handleChange}
        />
      </Element>

      <Element leftSide={t('email')}>
        <InputField
          id="email"
          type="email"
          value={user.email || ''}
          onChange={handleChange}
        />
      </Element>

      <Element leftSide={t('phone')}>
        <InputField
          id="phone"
          value={user.phone || ''}
          onChange={handleChange}
        />
      </Element>
    </Card>
  );
}
