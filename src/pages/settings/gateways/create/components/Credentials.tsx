/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { Button, Link } from '$app/components/forms';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { Gateway } from '$app/common/interfaces/statics';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useTranslation } from 'react-i18next';
import { formatLabel } from '../helpers/format-label';
import { useResolveInputField } from '../hooks/useResolveInputField';
import { StripeConnect } from './gateways/StripeConnect';
import { WePay } from './gateways/WePay';
import { PayPalPPCP } from './gateways/PayPalPPCP';
import { Divider } from '$app/components/cards/Divider';
import { request } from '$app/common/helpers/request';
import { endpoint, isHosted } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';
import { useState } from 'react';
import { Modal } from '$app/components/Modal';
import { GoCardlessOAuth2 } from './gateways/GoCardlessOAuth2';
import { useHandleGoCardless } from '$app/pages/settings/gateways/create/hooks/useHandleGoCardless';
import { useResolveConfigValue } from '$app/pages/settings/gateways/create/hooks/useResolveConfigValue';
import { useLocation } from 'react-router-dom';
import { $help } from '$app/components/HelpWidget';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { HelpCircle } from 'react-feather';

interface Props {
  gateway: Gateway;
  companyGateway: CompanyGateway;
  setCompanyGateway: React.Dispatch<
    React.SetStateAction<CompanyGateway | undefined>
  >;
  errors: ValidationBag | undefined;
  isGatewaySaved?: boolean;
}

export function Credentials(props: Props) {
  const [t] = useTranslation();

  const location = useLocation();

  const resolveInputField = useResolveInputField(
    props.companyGateway,
    props.setCompanyGateway
  );

  const config = useResolveConfigValue(props.companyGateway);

  const STRIPE_CONNECT = 'd14dd26a47cecc30fdd65700bfb67b34';
  const WEPAY = '8fdeed552015b3c7b44ed6c8ebd9e992';
  const PAYPAL_PPCP = '80af24a6a691230bbec33e930ab40666';
  const GOCARDLESS = 'b9886f9257f0c6ee7c302f1c74475f6c';

  const hostedGateways = [STRIPE_CONNECT, WEPAY, PAYPAL_PPCP];

  if (
    isHosted() &&
    props.gateway.key === GOCARDLESS &&
    config('oauth2') === true
  ) {
    hostedGateways.push(GOCARDLESS);
  }

  const [isTestingBusy, setIsTestingBusy] = useState<boolean>(false);
  const [testingMessage, setTestingMessage] = useState<string>('');
  const [isTestingModalOpen, setIsTestingModalOpen] = useState<boolean>(false);

  const handleTestCredentials = () => {
    if (!isTestingBusy) {
      toast.processing();
      setIsTestingBusy(true);

      request(
        'POST',
        endpoint('/api/v1/company_gateways/:id/test', {
          id: props.companyGateway.id,
        })
      )
        .then((response) => {
          setIsTestingModalOpen(true);
          setTestingMessage(response.data.message);
        })
        .finally(() => {
          toast.dismiss();
          setIsTestingBusy(false);
        });
    }
  };

  const handleGoCardless = useHandleGoCardless();
  const accentColor = useAccentColor();

  return (
    <>
      <Card
        title={t('credentials')}
        topRight={
          <button
            style={{ color: accentColor }}
            type="button"
            onClick={() =>
              $help('gateways', {
                moveToHeading: 'Credentials',
              })
            }
            className="inline-flex items-center space-x-1 text-sm"
          >
            <HelpCircle size={18} />
            <span>{t('documentation')}</span>
          </button>
        }
      >
        {props.gateway.site_url && props.gateway.site_url.length >= 1 && (
          <Element leftSide={t('help')}>
            <Link external to={props.gateway.site_url}>
              {t('learn_more')}
            </Link>
          </Element>
        )}

        {props.gateway && props.gateway.key === STRIPE_CONNECT && (
          <StripeConnect />
        )}

        {props.gateway && props.gateway.key === WEPAY && <WePay />}

        {props.gateway && props.gateway.key === PAYPAL_PPCP && (
          <PayPalPPCP
            gateway={props.gateway}
            companyGateway={props.companyGateway}
            setCompanyGateway={props.setCompanyGateway}
            errors={props.errors}
          />
        )}

        {props.gateway &&
          props.gateway.key === GOCARDLESS &&
          isHosted() &&
          config('oauth2') === true && <GoCardlessOAuth2 />}

        {props.gateway &&
          !hostedGateways.includes(props.gateway.key) &&
          Object.keys(JSON.parse(props.gateway.fields)).map((field, index) => (
            <Element leftSide={formatLabel(field)} key={index}>
              {resolveInputField(
                field,
                JSON.parse(props.gateway.fields)[field],
                props.errors
              )}
            </Element>
          ))}

        {props.gateway &&
          props.gateway.key === GOCARDLESS &&
          isHosted() &&
          config('oauth2') !== true && (
            <Element leftSide={t('OAuth 2.0')}>
              <Button
                behavior="button"
                type="minimal"
                onClick={handleGoCardless}
              >
                {t('connect')}
              </Button>
            </Element>
          )}

        <Divider />
        {!location.pathname.includes('/create') && (
          <>
            <Divider />

            <div className="flex justify-end pr-6">
              <Button
                behavior="button"
                onClick={handleTestCredentials}
                disableWithoutIcon
                disabled={isTestingBusy || !props.isGatewaySaved}
              >
                {t('health_check')}
              </Button>
            </div>
          </>
        )}
      </Card>

      <Modal
        title={t('status')}
        visible={isTestingModalOpen}
        onClose={() => setIsTestingModalOpen(false)}
      >
        <span className="text-center font-medium text-base pb-3">
          {t(
            testingMessage && testingMessage !== 'false'
              ? testingMessage
              : 'status_failed'
          )}
        </span>
      </Modal>
    </>
  );
}
