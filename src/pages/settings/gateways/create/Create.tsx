/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { Link, SelectField } from '@invoiceninja/forms';
import { useTitle } from 'common/hooks/useTitle';
import { Gateway } from 'common/interfaces/statics';
import { Settings } from 'components/layouts/Settings';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGateways } from '../common/hooks/useGateways';
import { Credentials } from './components/Credentials';

export function Create() {
  const { documentTitle } = useTitle('online_payments');

  const [t] = useTranslation();

  const gateways = useGateways();

  const [gateway, setGateway] = useState<Gateway>();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setGateway(gateways.find((gateway) => gateway.id === event.target.value));
  };

  console.log(gateways);

  return (
    <Settings title={documentTitle}>
      <Card title={t('add_gateway')}>
        <Element leftSide={t('provider')}>
          <SelectField withBlank onChange={handleChange}>
            {gateways.map((gateway, index) => (
              <option value={gateway.id} key={index}>
                {gateway.name}
              </option>
            ))}
          </SelectField>
        </Element>
      </Card>

      {gateway && <Credentials gateway={gateway} />}
    </Settings>
  );
}
