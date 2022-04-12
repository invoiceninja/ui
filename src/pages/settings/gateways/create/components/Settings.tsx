/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

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
import { InputField } from '@invoiceninja/forms';
import { Gateway } from 'common/interfaces/statics';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  gateway: Gateway;
}

export function Settings(props: Props) {
  const [t] = useTranslation();
  const [gateway, setGateway] = useState<Gateway>(props.gateway);

  useEffect(() => setGateway(props.gateway), [props.gateway]);

  console.log(gateway);

  return (
    <Card title={t('settings')}>
      <Element leftSide={t('label')}>
        <InputField value={gateway.name} />
      </Element>
    </Card>
  );
}
