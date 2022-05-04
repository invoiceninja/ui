/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Element } from '@invoiceninja/cards';
import { Button } from '@invoiceninja/forms';
import axios from 'axios';
import { endpoint } from 'common/helpers';
import { defaultHeaders } from 'common/queries/common/headers';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';

export function WePay() {
  const [t] = useTranslation();

  const handleSetup = () => {
    axios
      .post(
        endpoint('/api/v1/one_time_token'),
        { context: 'wepay' },
        { headers: defaultHeaders() }
      )
      .then((response) =>
        window
          .open(
            generatePath('https://invoicing.co/wepay/signup/:token', {
              token: response.data.hash,
            }),
            '_blank'
          )
          ?.focus()
      )
      .catch((error) => console.error(error));
  };

  return (
    <Element>
      <Button onClick={handleSetup} type="minimal" behavior="button">
        {t('gateway_setup')}
      </Button>
    </Element>
  );
}
