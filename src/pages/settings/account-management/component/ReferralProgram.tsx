/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { CopyToClipboard } from '$app/components/CopyToClipboard';
import { Card, Element } from '$app/components/cards';
import { useTranslation } from 'react-i18next';

export function ReferralProgram() {
  const [t] = useTranslation();

  const user = useCurrentUser();

  return (
    <Card title={t('referral_program')}>
      <Element leftSide={t('referral_code')}>
        <CopyToClipboard
          text={`https://app.invoicing.co/#/register?rc=${user?.referral_code}`}
        />
      </Element>

      <Element leftSide={t('free')}>{user?.referral_meta?.free || 0}</Element>
      <Element leftSide={t('pro')}>{user?.referral_meta?.pro || 0}</Element>
      <Element leftSide={t('enterprise')}>
        {user?.referral_meta?.enterprise || 0}
      </Element>
    </Card>
  );
}
