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
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { useTranslation } from 'react-i18next';
import { useHandleSquareOAuth } from '../../hooks/useHandleSquareOAuth';
import { useResolveConfigValue } from '../../hooks/useResolveConfigValue';
import { Check } from 'react-feather';

interface Props {
  companyGateway: CompanyGateway;
}

export function SquareOAuth(props: Props) {
  const [t] = useTranslation();

  const handleSetup = useHandleSquareOAuth();
  const config = useResolveConfigValue(props.companyGateway);

  const isConnected = Boolean(config('accessToken'));

  return (
    <>
      {isConnected ? (
        <>
          <Element leftSide={t('status')}>
            <div className="flex items-center space-x-2">
              <Check size={18} className="text-green-600" />
              <span>{t('connected')}</span>
            </div>
          </Element>

          <Element leftSide={t('location')}>
            {config('locationId')}
          </Element>

          <Element leftSide={t('test_mode')}>
            {config('testMode') ? t('yes') : t('no')}
          </Element>
        </>
      ) : (
        <Element>
          <Button onClick={handleSetup} type="secondary" behavior="button">
            {t('gateway_setup')}
          </Button>
        </Element>
      )}
    </>
  );
}
