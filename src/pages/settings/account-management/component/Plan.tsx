/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date, isHosted } from 'common/helpers';
import { useCurrentAccount } from 'common/hooks/useCurrentAccount';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../../components/cards';
import { Link } from '../../../../components/forms';

export function Plan() {
  const [t] = useTranslation();
  const user = useCurrentUser();
  const account = useCurrentAccount();
  const { dateFormat } = useCurrentCompanyDateFormats();

  return (
    <Card title={t('plan')}>
      <Element leftSide={t('plan')}>{account?.plan || t('free')}</Element>

      {account?.plan_expires !== '' && (
        <Element leftSide={t('expires_on')}>
          {date(account?.plan_expires, dateFormat)}
        </Element>
      )}

      {isHosted() && user?.company_user?.is_owner && (
        <Element>
          <Link
            className="mt-4"
            external
            to={user?.company_user?.ninja_portal_url}
          >
            {t('plan_change')}
          </Link>
        </Element>
      )}
    </Card>
  );
}
