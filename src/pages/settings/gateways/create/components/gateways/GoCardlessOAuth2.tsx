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
import { Field } from '$app/pages/settings/gateways/create/hooks/useResolveInputField';
import Toggle from '$app/components/forms/Toggle';
import { Check } from 'react-feather';
import { useHandleCredentialsChange } from '$app/pages/settings/gateways/create/hooks/useHandleCredentialsChange';
import { isHosted } from '$app/common/helpers';
import { Button } from '$app/components/forms';
import { useHandleGoCardless } from '$app/pages/settings/gateways/create/hooks/useHandleGoCardless';

interface Props {
  companyGateway: CompanyGateway;
  setCompanyGateway: React.Dispatch<
    React.SetStateAction<CompanyGateway | undefined>
  >
}

export function GoCardlessOAuth2({ companyGateway, setCompanyGateway }: Props) {
  const { t } = useTranslation();

  const config = useResolveConfigValue(companyGateway);
  const handleChange = useHandleCredentialsChange(setCompanyGateway);

  return (
    <>
      <Element leftSide={t('OAuth 2.0')}>
        <Check size={18} />
      </Element>

      <Element leftSide={t('test_mode')}>
        <Toggle
          checked={config('testMode')}
          onChange={(value) => handleChange('testMode' as keyof Field, value)}
        />
      </Element>
    </>
  );
}
