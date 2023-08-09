/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Element } from '$app/components/cards';
import { Button } from '$app/components/forms';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useTranslation } from 'react-i18next';
import { route } from '$app/common/helpers/route';

export function WePay() {
  const [t] = useTranslation();

  const handleSetup = () => {
    request('POST', endpoint('/api/v1/one_time_token'), {
      context: 'wepay',
    }).then((response) =>
      window
        .open(
          route('https://invoicing.co/wepay/signup/:token', {
            token: response.data.hash,
          }),
          '_blank'
        )
        ?.focus()
    );
  };

  return (
    <Element>
      <Button onClick={handleSetup} type="minimal" behavior="button">
        {t('gateway_setup')}
      </Button>
    </Element>
  );
}
