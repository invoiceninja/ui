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
import { CompanyGateway } from 'common/interfaces/company-gateway';
import { Gateway } from 'common/interfaces/statics';
import { useTranslation } from 'react-i18next';
import { formatLabel } from '../helpers/format-label';
import { useResolveInputField } from '../hooks/useResolveInputField';

interface Props {
  gateway: Gateway;
  companyGateway: CompanyGateway;
  setCompanyGateway: React.Dispatch<
    React.SetStateAction<CompanyGateway | undefined>
  >;
}

export function Credentials(props: Props) {
  const [t] = useTranslation();

  const resolveInputField = useResolveInputField(
    props.companyGateway,
    props.setCompanyGateway
  );

  return (
    <Card title={t('credentials')}>
      {props.gateway.site_url.length >= 1 && (
        <Element leftSide={t('help')}>
          <Link external to={props.gateway.site_url}>
            {t('learn_more')}
          </Link>
        </Element>
      )}

      {props.gateway &&
        Object.keys(JSON.parse(props.gateway.fields)).map((field, index) => (
          <Element leftSide={formatLabel(field)} key={index}>
            {resolveInputField(field, JSON.parse(props.gateway.fields)[field])}
          </Element>
        ))}
    </Card>
  );
}
