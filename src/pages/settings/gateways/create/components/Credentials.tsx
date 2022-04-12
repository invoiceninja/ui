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
import { Link } from '@invoiceninja/forms';
import { Gateway } from 'common/interfaces/statics';
import { useTranslation } from 'react-i18next';

interface Props {
  gateway: Gateway;
}

export function Credentials(props: Props) {
  const [t] = useTranslation();

  return (
    <Card title={t('credentials')}>
      {props.gateway.site_url.length >= 1 && (
        <Element leftSide={t('help')}>
          <Link external to={props.gateway.site_url}>
            {t('learn_more')}
          </Link>
        </Element>
      )}
    </Card>
  );
}
