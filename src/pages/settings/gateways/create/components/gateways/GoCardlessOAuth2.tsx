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
import { Check } from 'react-feather';
import { useHandleCredentialsChange } from '$app/pages/settings/gateways/create/hooks/useHandleCredentialsChange';

interface Props {
  companyGateway: CompanyGateway;
  setCompanyGateway: React.Dispatch<
    React.SetStateAction<CompanyGateway | undefined>
  >
}

export function GoCardlessOAuth2({ companyGateway, setCompanyGateway }: Props) {
  const { t } = useTranslation();

  return (
      <Element leftSide={t('OAuth 2.0')}>
        <Check size={18} />
      </Element>
  );
}
