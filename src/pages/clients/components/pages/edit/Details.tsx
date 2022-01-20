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
import { set } from 'lodash';
import { ChangeEvent } from 'react';
interface Props {
  client: Client;
  setClient: React.Dispatch<React.SetStateAction<Client | undefined>>;
}

export function Details(props: Props) {
  const [t] = useTranslation();
  const { data: users } = useUsersQuery();
  const { data: groupSettings } = useGroupSettingsQuery();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    props.setClient(
      (client) => client && set(client, event.target.id, event.target.value)
    );
  };

  return (
    <Card className="col-span-12 xl:col-span-6" title={t('details')}>
      <Element leftSide={t('name')}>
        <InputField
          id="name"
          value={props.client.name}
          onChange={handleChange}
        />
      </Element>

      <Element leftSide={t('number')}>
        <InputField
          id="number"
          value={props.client.number}
          onChange={handleChange}
        />
      </Element>

      {groupSettings && (
        <Element leftSide={t('group')}>
          <SelectField
            id="group_settings_id"
            value={props.client.group_settings_id}
            onChange={handleChange}
          >
            {groupSettings.data.data.map(
              (group: GroupSettings, index: number) => (
                <option value={group.id} key={index}>
                  {group.name}
                </option>
              )
            )}
          </SelectField>
        </Element>
      )}

      {users && (
        <Element leftSide={t('user')}>
          <SelectField id="user_id" onChange={handleChange}>
            {users.data.data.map((user: User, index: number) => (
              <option value={user.id} key={index}>
                {user.first_name} {user.last_name}
              </option>
            ))}
          </SelectField>
        </Element>
      )}

      <Element leftSide={t('id_number')}>
        <InputField
          id="id_number"
          value={props.client.id_number}
          onChange={handleChange}
        />
      </Element>

      <Element leftSide={t('vat_number')}>
        <InputField
          id="vat_number"
          value={props.client.vat_number}
          onChange={handleChange}
        />
      </Element>

      <Element leftSide={t('website')}>
        <InputField
          id="website"
          value={props.client.website}
          onChange={handleChange}
        />
      </Element>

      <Element leftSide={t('phone')}>
        <InputField
          id="phone"
          value={props.client.phone}
          onChange={handleChange}
        />
      </Element>
    </Card>
  );
}
