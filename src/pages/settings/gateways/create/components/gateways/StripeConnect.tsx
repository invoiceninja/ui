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
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';

export function StripeConnect() {
  const [t] = useTranslation();

  const handleSetup = () => {
    request('POST', endpoint('/api/v1/one_time_token'), {
      context: 'stripe_connect',
    })
      .then((response) =>
        window
          .open(
            generatePath('https://invoicing.co/stripe/signup/:token', {
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
