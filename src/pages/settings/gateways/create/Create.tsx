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
import { SelectField } from '@invoiceninja/forms';
import { useTitle } from 'common/hooks/useTitle';
import { CompanyGateway } from 'common/interfaces/company-gateway';
import { Gateway } from 'common/interfaces/statics';
import { useBlankCompanyGatewayQuery } from 'common/queries/company-gateways';
import { Settings } from 'components/layouts/Settings';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGateways } from '../common/hooks/useGateways';
import { Credentials } from './components/Credentials';
import { LimitsAndFees } from './components/LimitsAndFees';
import { RequiredFields } from './components/RequiredFields';
import { Settings as GatewaySettings } from './components/Settings';

export function Create() {
  const { documentTitle } = useTitle('online_payments');
  const { data: blankCompanyGateway } = useBlankCompanyGatewayQuery();

  const gateways = useGateways();

  const [t] = useTranslation();
  const [companyGateway, setCompanyGateway] = useState<CompanyGateway>();
  const [gateway, setGateway] = useState<Gateway>();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setGateway(gateways.find((gateway) => gateway.id === event.target.value));
  };

  useEffect(() => {
    if (blankCompanyGateway?.data.data) {
      setCompanyGateway(blankCompanyGateway.data.data);
    }
  }, [blankCompanyGateway]);

  useEffect(() => {
    setCompanyGateway(
      (companyGateway) =>
        companyGateway &&
        gateway && {
          ...companyGateway,
          gateway_key: gateway.key,
          // config: gateway.fields,
          token_billing: 'always',
        }
    );
  }, [gateway]);

  console.log(companyGateway);

  return (
    <Settings title={documentTitle}>
      <Card title={t('add_gateway')}>
        <Element leftSide={t('provider')}>
          <SelectField onChange={handleChange} withBlank>
            {gateways.map((gateway, index) => (
              <option value={gateway.id} key={index}>
                {gateway.name}
              </option>
            ))}
          </SelectField>
        </Element>
      </Card>

      {gateway && companyGateway && (
        <Credentials
          gateway={gateway}
          companyGateway={companyGateway}
          setCompanyGateway={setCompanyGateway}
        />
      )}

      {gateway && companyGateway && (
        <GatewaySettings
          gateway={gateway}
          companyGateway={companyGateway}
          setCompanyGateway={setCompanyGateway}
        />
      )}

      {gateway && <RequiredFields gateway={gateway} />}
      {gateway && <LimitsAndFees gateway={gateway} />}
    </Settings>
  );
}
