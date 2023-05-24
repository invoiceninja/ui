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
import { Button, Link, SelectField } from '$app/components/forms';
import { useTitle } from '$app/common/hooks/useTitle';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { Gateway } from '$app/common/interfaces/statics';
import {
  useBlankCompanyGatewayQuery,
  useCompanyGatewaysQuery,
} from '$app/common/queries/company-gateways';
import { Settings } from '$app/components/layouts/Settings';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGateways } from '../common/hooks/useGateways';
import { Credentials } from './components/Credentials';
import { LimitsAndFees } from './components/LimitsAndFees';
import { RequiredFields } from './components/RequiredFields';
import { Settings as GatewaySettings } from './components/Settings';
import { useHandleCreate } from './hooks/useHandleCreate';
import { blankFeesAndLimitsRecord } from './hooks/useHandleMethodToggle';
import { TabGroup } from '$app/components/TabGroup';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import {
  availableGatewayLogos,
  GatewayTypeIcon,
} from '$app/pages/clients/show/components/GatewayTypeIcon';

const gatewaysStyles = [
  { key: 'paypal_express', width: 110 },
  { key: 'mollie', width: 110 },
  { key: 'eway', width: 170 },
  { key: 'forte', width: 190 },
  { key: 'square', width: 130 },
  { key: 'checkoutcom', width: 170 },
];

export function Create() {
  const [t] = useTranslation();

  const { documentTitle } = useTitle('online_payments');

  const { data: blankCompanyGateway } = useBlankCompanyGatewayQuery();

  const { data: companyGateways } = useCompanyGatewaysQuery();

  const [companyGateway, setCompanyGateway] = useState<CompanyGateway>();

  const [errors, setErrors] = useState<ValidationBag>();

  const [gateway, setGateway] = useState<Gateway>();

  const [filteredGateways, setFilteredGateways] = useState<Gateway[]>([]);

  const [tabIndex, setTabIndex] = useState<number>(0);

  const gateways = useGateways();

  const onSave = useHandleCreate(companyGateway, setErrors);

  const handleChange = (value: string) => {
    setGateway(gateways.find((gateway) => gateway.id === value));
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

  const getGatewayWidth = (provider: string) => {
    const providerName = provider.toLowerCase();

    const gateway = gatewaysStyles.find(
      (gateway) => gateway.key === providerName
    );

    return gateway ? gateway.width : undefined;
  };

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
      disableSaveButton={!gateway}
    >
      <TabGroup tabs={tabs} onTabChange={(index) => setTabIndex(index)}>
        <Card title={t('add_gateway')}>
          <Element leftSide={t('provider')}>
            <SelectField
              onValueChange={(value) => handleChange(value)}
              value={gateway?.id}
              errorMessage={errors?.errors.gateway_key}
              withBlank
            >
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
              errors={errors}
            />
          )}
        </div>

        <div>
          {gateway && companyGateway && (
            <GatewaySettings
              gateway={gateway}
              companyGateway={companyGateway}
              setCompanyGateway={setCompanyGateway}
              errors={errors}
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
              errors={errors}
            />
          )}
        </div>
      </TabGroup>

      {!tabIndex && (
        <div className="flex flex-wrap gap-4">
          {filteredGateways.map(
            (gateway, index) =>
              availableGatewayLogos.includes(
                gateway.provider.toLowerCase()
              ) && (
                <Card key={index} className="w-52">
                  <div className="flex flex-col items-center justify-between space-y-5 h-52">
                    <div className="flex justify-center items-center border-b border-b-gray-200 w-full h-28">
                      <GatewayTypeIcon
                        name={gateway.provider.toLowerCase()}
                        style={{
                          width: getGatewayWidth(gateway.provider) || 150,
                        }}
                      />
                    </div>

                    {gateway.site_url && (
                      <Link external to={gateway.site_url}>
                        {t('official_website')}
                      </Link>
                    )}

                    <Button
                      onClick={(event: ChangeEvent<HTMLButtonElement>) => {
                        event.preventDefault();
                        handleChange(gateway.id);
                      }}
                    >
                      {t('set_up')}
                    </Button>
                  </div>
                </Card>
              )
          )}
        </div>
      )}
    </Settings>
  );
}
