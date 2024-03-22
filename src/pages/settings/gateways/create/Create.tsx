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
import { useBlankCompanyGatewayQuery } from '$app/common/queries/company-gateways';
import { Settings } from '$app/components/layouts/Settings';
import { useEffect, useState } from 'react';
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
import { isHosted } from '$app/common/helpers';
import { endpoint } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { request } from '$app/common/helpers/request';

const gatewaysStyles = [
  { name: 'paypal_ppcp', width: 110 },
  { name: 'paypal_express', width: 110 },
  { name: 'mollie', width: 110 },
  { name: 'eway', width: 170 },
  { name: 'forte', width: 190 },
  { name: 'square', width: 130 },
  { name: 'checkoutcom', width: 170 },
];

export const gatewaysDetails = [
  { name: 'stripe', key: 'd14dd26a37cecc30fdd65700bfb55b23' },
  { name: 'stripe', key: 'd14dd26a47cecc30fdd65700bfb67b34' },
  { name: 'paypal', key: '80af24a6a691230bbec33e930ab40666' },
  { name: 'braintree', key: 'f7ec488676d310683fb51802d076d713' },
  { name: 'paypal_ppcp', key: '80af24a6a691230bbec33e930ab40666' },
  { name: 'authorize', key: '3b6621f970ab18887c4f6dca78d3f8bb' },
  { name: 'mollie', key: '1bd651fb213ca0c9d66ae3c336dc77e8' },
  { name: 'gocardless', key: 'b9886f9257f0c6ee7c302f1c74475f6c' },
  { name: 'forte', key: 'kivcvjexxvdiyqtj3mju5d6yhpeht2xs' },
  { name: 'razorpay', key: 'hxd6gwg3ekb9tb3v9lptgx1mqyg69zu9' },
  { name: 'square', key: '65faab2ab6e3223dbe848b1686490baz' },
  { name: 'paytrace', key: 'bbd736b3254b0aabed6ad7fda1298c88' },
  { name: 'checkoutcom', key: '3758e7f7c6f4cecf0f4f348b9a00f456' },
  { name: 'payfast', key: 'd6814fc83f45d2935e7777071e629ef9' },
  { name: 'eway', key: '944c20175bbe6b9972c05bcfe294c2c7' },
];

const hostedGatewayFilter = [
  '38f2c48af60c7dd69e04248cbb24c36e', //do not allow express to be created in hosted
  '80af24a6a691230bbec33e930ab40665', //do not allow pp rest to be created in hosted
  '8fdeed552015b3c7b44ed6c8ebd9e992', //do not allow wepay to be created in hosted
];

export function Create() {
  const [t] = useTranslation();

  const { documentTitle } = useTitle('add_gateway');

  const { data: blankCompanyGateway } = useBlankCompanyGatewayQuery();

  const [companyGateway, setCompanyGateway] = useState<CompanyGateway>();

  const [errors, setErrors] = useState<ValidationBag>();

  const [gateway, setGateway] = useState<Gateway>();

  const [filteredGateways, setFilteredGateways] = useState<Gateway[]>([]);

  const [createBySetup, setCreateBySetup] = useState<boolean>(false);

  const [tabIndex, setTabIndex] = useState<number>(0);

  const gateways = useGateways();

  const onSave = useHandleCreate(companyGateway, setErrors);

  const handleChange = (value: string, isManualChange?: boolean) => {
    const gateway = gateways.find((gateway) => gateway.id === value);

    setGateway(gateway);

    if (gateway?.key === '80af24a6a691230bbec33e930ab40666') {
      handleSetup();
    } else if (gateway?.key === 'd14dd26a47cecc30fdd65700bfb67b34') {
      handleStripeSetup();
    } else isManualChange && setTabIndex(1);
  };

  const handleSetup = () => {
    request('POST', endpoint('/api/v1/one_time_token'), {
      context: 'paypal_ppcp',
    }).then((response) =>
      window
        .open(
          route('https://invoicing.co/paypal?hash=:hash', {
            hash: response.data.hash,
          }),
          '_blank'
        )
        ?.focus()
    );
  };

  const handleStripeSetup = () => {
    request('POST', endpoint('/api/v1/one_time_token'), {
      context: 'stripe_connect',
    }).then((response) =>
      window
        .open(
          route('https://invoicing.co/stripe/signup/:token', {
            token: response.data.hash,
          }),
          '_blank'
        )
        ?.focus()
    );
  };

  const defaultTab = [t('payment_provider')];

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

  const getGatewayNameByKey = (key: string) => {
    const gateway = gatewaysDetails.find((gateway) => gateway.key === key);

    return gateway?.name || '';
  };

  const getGatewayWidth = (gatewayName: string) => {
    const gateway = gatewaysStyles.find(
      (gateway) => gateway.name === gatewayName
    );

    return gateway ? gateway.width : undefined;
  };

  useEffect(() => {
    if (gateways) {
      if (isHosted()) {
        const mutated_gateways = gateways.filter((gateway) => {
          return !hostedGatewayFilter.includes(gateway.key);
        });
        setFilteredGateways(mutated_gateways);
      } else {
        setFilteredGateways(gateways);
      }
    }
  }, [gateways]);

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

  useEffect(() => {
    if (createBySetup) {
      onSave(1);
      setCreateBySetup(false);
    }
  }, [companyGateway]);

  return (
    <Settings
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={() => onSave(1)}
      disableSaveButton={!gateway}
    >
      <TabGroup
        tabs={tabs}
        defaultTabIndex={tabIndex}
        onTabChange={(index) => setTabIndex(index)}
      >
        <Card title={t('add_gateway')}>
          <Element leftSide={t('payment_provider')}>
            <SelectField
              onValueChange={(value) => handleChange(value, true)}
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
                getGatewayNameByKey(gateway.key)
              ) && (
                <Card key={index} className="w-52">
                  <div className="flex flex-col items-center justify-between space-y-5 h-52">
                    <div className="flex justify-center items-center border-b border-b-gray-200 w-full h-28">
                      <GatewayTypeIcon
                        name={getGatewayNameByKey(gateway.key)}
                        style={{
                          width:
                            getGatewayWidth(getGatewayNameByKey(gateway.key)) ||
                            150,
                        }}
                      />
                    </div>

                    {gateway.site_url && (
                      <Link external to={gateway.site_url}>
                        {t('website')}
                      </Link>
                    )}

                    <Button
                      behavior="button"
                      onClick={() => {
                        if (
                          gateway.key !== '80af24a6a691230bbec33e930ab40666'
                        ) {
                          setCreateBySetup(true);
                        }

                        handleChange(gateway.id);
                      }}
                    >
                      {t('setup')}
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
