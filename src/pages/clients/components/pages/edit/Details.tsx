/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { InputField, SelectField } from '@invoiceninja/forms';
import { GroupSettings } from 'common/interfaces/group-settings';
import { User } from 'common/interfaces/user';
import { useGroupSettingsQuery } from 'common/queries/group-settings';
import { useUsersQuery } from 'common/queries/users';
import { useTranslation } from 'react-i18next';
import { Client } from 'common/interfaces/client';

export function Details(props: { client: Client }) {
  const [t] = useTranslation();
  const { data: users } = useUsersQuery();
  const { data: groupSettings } = useGroupSettingsQuery();

  return (
    <Card className="col-span-12 xl:col-span-6" title={t('details')}>
      <Element leftSide={t('name')}>
        <InputField id="name" value={props.client.name} />
      </Element>

      <Element leftSide={t('number')}>
        <InputField id="number" value={props.client.number} />
      </Element>

      {groupSettings && (
        <Element leftSide={t('group')}>
          <SelectField>
            {groupSettings.data.data.map(
              (group: GroupSettings, index: number) => (
                <option key={index}>{group.name}</option>
              )
            )}
          </SelectField>
        </Element>
      )}

      {users && (
        <Element leftSide={t('user')}>
          <SelectField>
            {users.data.data.map((user: User, index: number) => (
              <option key={index}>
                {user.first_name} {user.last_name}
              </option>
            ))}
          </SelectField>
        </Element>
      )}

      <Element leftSide={t('id_number')}>
        <InputField id="id_number" value={props.client.id_number} />
      </Element>

      <Element leftSide={t('vat_number')}>
        <InputField id="vat_number" value={props.client.vat_number} />
      </Element>

      <Element leftSide={t('website')}>
        <InputField id="website" value={props.client.website} />
      </Element>

      <Element leftSide={t('phone')}>
        <InputField id="phone" value={props.client.phone} />
      </Element>
    </Card>
  );
}
