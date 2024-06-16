/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { CopyToClipboard } from '$app/components/CopyToClipboard';
import { Card, Element } from '$app/components/cards';
import { useTranslation } from 'react-i18next';

export function ReferralProgram() {
  const [t] = useTranslation();

  const account = useCurrentAccount();

  return (
    <Card title={t('referral_program')}>
      <Element leftSide={t('referral_code')}>
        <CopyToClipboard
          text={`https://app.invoicing.co/#/register?rc=${account?.referral_code}`}
        />
      </Element>
    </Card>
  );
}
