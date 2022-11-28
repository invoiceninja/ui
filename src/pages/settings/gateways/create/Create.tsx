/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { SelectField } from '@invoiceninja/forms';
import { useTitle } from 'common/hooks/useTitle';
import { CompanyGateway } from 'common/interfaces/company-gateway';
import { Gateway } from 'common/interfaces/statics';
import {
  useBlankCompanyGatewayQuery,
  useCompanyGatewaysQuery,
} from 'common/queries/company-gateways';
import { Settings } from 'components/layouts/Settings';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useGateways } from '../common/hooks/useGateways';
import { Credentials } from './components/Credentials';
import { LimitsAndFees } from './components/LimitsAndFees';
import { RequiredFields } from './components/RequiredFields';
import { Settings as GatewaySettings } from './components/Settings';
import { useHandleCreate } from './hooks/useHandleCreate';
import { blankFeesAndLimitsRecord } from './hooks/useHandleMethodToggle';
import { TabGroup } from 'components/TabGroup';

export function Create() {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const { documentTitle } = useTitle('online_payments');

  const { data: blankCompanyGateway } = useBlankCompanyGatewayQuery();

  const { data: companyGateways } = useCompanyGatewaysQuery();

  const [companyGateway, setCompanyGateway] = useState<CompanyGateway>();

  const [gateway, setGateway] = useState<Gateway>();

  const [filteredGateways, setFilteredGateways] = useState<Gateway[]>([]);

  const gateways = useGateways();

  const onSave = useHandleCreate(companyGateway);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setGateway(gateways.find((gateway) => gateway.id === event.target.value));
  };

  const defaultTab = [t('provider')];

  const additionalTabs = [
    t('credentials'),
    t('settings'),
    t('required_fields'),
    t('limits_and_fees'),
  ];

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('online_payments'), href: '/settings/online_payments' },
    { name: t('add_gateway'), href: '/settings/gateways/create' },
  ];

  const [tabs, setTabs] = useState<string[]>(defaultTab);

  useEffect(() => {
    let existingCompanyGatewaysKeys: string[] = [];

    setFilteredGateways(gateways);

    companyGateways?.data.data.map((gateway: CompanyGateway) => {
      if (!gateway.is_deleted || gateway.archived_at == 0) {
        existingCompanyGatewaysKeys = [
          ...existingCompanyGatewaysKeys,
          gateway.gateway_key,
        ];
      }
    });

    setFilteredGateways((current) =>
      current.filter(
        (gateway) => !existingCompanyGatewaysKeys.includes(gateway.key)
      )
    );
  }, [gateways, companyGateways]);

  useEffect(() => {
    if (blankCompanyGateway?.data.data && companyGateway === undefined) {
      setCompanyGateway(blankCompanyGateway.data.data);
    }
  }, [blankCompanyGateway, gateway]);

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

    // We want to inject blank credit card record which is checked.
    // Only in case the gateway supports credit card transactions.

    const supportedGatewayTypes = gateway
      ? Object.entries(gateway.options)
      : [];

    const shouldInjectCreditCard = supportedGatewayTypes.find(
      ([id]) => id === '1'
    );

    if (shouldInjectCreditCard) {
      setCompanyGateway(
        (current) =>
          current && {
            ...current,
            fees_and_limits: {
              ...current.fees_and_limits,
              '1': blankFeesAndLimitsRecord,
            },
          }
      );
    }
  }, [gateway]);

  useEffect(() => {
    if (gateway) {
      setTabs([...defaultTab, ...additionalTabs]);
    } else {
      setTabs([...defaultTab]);
    }
  }, [gateway]);

  return (
    <Settings
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={onSave}
      onCancelClick={() => navigate('/settings/online_payments')}
    >
      <TabGroup tabs={tabs}>
        <Card title={t('add_gateway')}>
          <Element leftSide={t('provider')}>
            <SelectField onChange={handleChange} value={gateway?.id} withBlank>
              {filteredGateways.map((gateway, index) => (
                <option value={gateway.id} key={index}>
                  {gateway.name}
                </option>
              ))}
            </SelectField>
          </Element>
        </Card>

        <div>
          {gateway && companyGateway && (
            <Credentials
              gateway={gateway}
              companyGateway={companyGateway}
              setCompanyGateway={setCompanyGateway}
            />
          )}
        </div>

        <div>
          {gateway && companyGateway && (
            <GatewaySettings
              gateway={gateway}
              companyGateway={companyGateway}
              setCompanyGateway={setCompanyGateway}
            />
          )}
        </div>

        <div>
          {gateway && companyGateway && (
            <RequiredFields
              gateway={gateway}
              companyGateway={companyGateway}
              setCompanyGateway={setCompanyGateway}
            />
          )}
        </div>

        <div>
          {gateway && companyGateway && (
            <LimitsAndFees
              gateway={gateway}
              companyGateway={companyGateway}
              setCompanyGateway={setCompanyGateway}
            />
          )}
        </div>
      </TabGroup>
    </Settings>
  );
}
