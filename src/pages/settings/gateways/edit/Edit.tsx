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
import { route } from '$app/common/helpers/route';
import { useTitle } from '$app/common/hooks/useTitle';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { Gateway } from '$app/common/interfaces/statics';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useCompanyGatewayQuery } from '$app/common/queries/company-gateways';
import { Settings } from '$app/components/layouts/Settings';
import { TabGroup } from '$app/components/TabGroup';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import { useGateways } from '../common/hooks/useGateways';
import { Credentials } from '../create/components/Credentials';
import { LimitsAndFees } from '../create/components/LimitsAndFees';
import { RequiredFields } from '../create/components/RequiredFields';
import { Settings as GatewaySettings } from '../create/components/Settings';
import { useHandleUpdate } from './hooks/useHandleUpdate';
import { ImportCustomers } from './components/stripe/ImportCustomers';
import { WebhookConfiguration } from './components/WebhookConfiguration';
import collect from 'collect.js';

export function Edit() {
  const [t] = useTranslation();
  const [searchParams] = useSearchParams();

  const { id } = useParams();

  const { data } = useCompanyGatewayQuery({ id });

  const { documentTitle } = useTitle('edit_company_gateway');

  const [errors, setErrors] = useState<ValidationBag>();

  const [companyGateway, setCompanyGateway] = useState<CompanyGateway>();

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
    {
      name: t('edit_gateway'),
      href: route('/settings/gateways/:id/edit', { id }),
    },
  ];

  const [gateway, setGateway] = useState<Gateway>();

  const [tabs, setTabs] = useState<string[]>(defaultTab);

  const gateways = useGateways();

  const onSave = useHandleUpdate(companyGateway, setErrors);

  useEffect(() => {
    companyGateway &&
      setGateway(
        gateways.find((gateway) => gateway.key == companyGateway.gateway_key)
      );
  }, [companyGateway, gateways]);

  useEffect(() => {
    if (data?.data.data) {
      setCompanyGateway(data.data.data);
    }
  }, [data]);

  useEffect(() => {
    return () => {
      setCompanyGateway(undefined);
    };
  }, []);

  useEffect(() => {
    if (gateway) {
      setTabs([...defaultTab, ...additionalTabs]);
    } else {
      setTabs([...defaultTab]);
    }
  }, [gateway]);

  return (
    <Settings title={documentTitle} breadcrumbs={pages} onSaveClick={onSave}>
      <TabGroup
        tabs={tabs}
        defaultTabIndex={Number(searchParams.get('tab')) ?? 0}
      >
        <div>
          {companyGateway && (
            <div className="space-y-4">
              <Card title={t('edit_gateway')}>
                <Element leftSide={t('provider')}>
                  {companyGateway.label}
                </Element>
              </Card>

              {gateway?.key === 'd14dd26a37cecc30fdd65700bfb55b23' ? (
                <ImportCustomers />
              ) : null}

              {gateway &&
                collect(Object.values(gateway.options))
                  .pluck('webhooks')
                  .flatten()
                  .unique()
                  .whereNotNull()
                  .count() > 1 && (
                  <WebhookConfiguration
                    companyGateway={companyGateway}
                    gateway={gateway}
                  />
                )}
            </div>
          )}
        </div>

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
    </Settings>
  );
}
