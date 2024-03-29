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
import { Link } from '$app/components/forms';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { Gateway } from '$app/common/interfaces/statics';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useTranslation } from 'react-i18next';
import { formatLabel } from '../helpers/format-label';
import { useResolveInputField } from '../hooks/useResolveInputField';
import { StripeConnect } from './gateways/StripeConnect';
import { WePay } from './gateways/WePay';
import { PayPalPPCP } from './gateways/PayPalPPCP';

interface Props {
  gateway: Gateway;
  companyGateway: CompanyGateway;
  setCompanyGateway: React.Dispatch<
    React.SetStateAction<CompanyGateway | undefined>
  >;
  errors: ValidationBag | undefined;
}

export function Credentials(props: Props) {
  const [t] = useTranslation();

  const resolveInputField = useResolveInputField(
    props.companyGateway,
    props.setCompanyGateway
  );

  const STRIPE_CONNECT = 'd14dd26a47cecc30fdd65700bfb67b34';
  const WEPAY = '8fdeed552015b3c7b44ed6c8ebd9e992';
  const PAYPAL_PPCP = '80af24a6a691230bbec33e930ab40666';

  const hostedGateways = [STRIPE_CONNECT, WEPAY, PAYPAL_PPCP];

  return (
    <Card title={t('credentials')}>
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

      {props.gateway && props.gateway.key === PAYPAL_PPCP && 
        <PayPalPPCP 
          gateway={props.gateway} 
          companyGateway={props.companyGateway} 
          setCompanyGateway={props.setCompanyGateway}
          errors={props.errors}
          />}

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
    </Card>
  );
}
