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
import { useTranslation } from 'react-i18next';
import { useResolveConfigValue } from '../../hooks/useResolveConfigValue';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { Check, X } from 'react-feather';

interface Props {
  companyGateway: CompanyGateway;
}

export function GoCardlessOAuth2({ companyGateway }: Props) {
  const { t } = useTranslation();
  const config = useResolveConfigValue(companyGateway);

  return (
    <>
      <Element leftSide={t('test_mode')}>
        {config('livemode') ? <X size={18} /> : <Check size={18} />}
      </Element>
    </>
  );
}
