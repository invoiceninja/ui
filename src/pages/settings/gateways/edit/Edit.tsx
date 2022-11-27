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
import { route } from 'common/helpers/route';
import { useTitle } from 'common/hooks/useTitle';
import { CompanyGateway } from 'common/interfaces/company-gateway';
import { Gateway } from 'common/interfaces/statics';
import { useCompanyGatewayQuery } from 'common/queries/company-gateways';
import { Settings } from 'components/layouts/Settings';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PaymentTabsActivity, Tabs } from '../common/components/Tabs';
import { useGateways } from '../common/hooks/useGateways';
import { Credentials } from '../create/components/Credentials';
import { LimitsAndFees } from '../create/components/LimitsAndFees';
import { RequiredFields } from '../create/components/RequiredFields';
import { Settings as GatewaySettings } from '../create/components/Settings';
import { usePaymentGatewayTabs } from '../create/hooks/usePaymentGatewayTabs';
import { useHandleUpdate } from './hooks/useHandleUpdate';

export function Edit() {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const { id } = useParams();

  const tabs = usePaymentGatewayTabs();

  const { data } = useCompanyGatewayQuery({ id });

  const { documentTitle } = useTitle('online_payments');

  const [companyGateway, setCompanyGateway] = useState<CompanyGateway>();

  const [activeTabKey, setActiveTabKey] = useState<string>('overview');

  const [tabsActivity, setTabsActivity] = useState<PaymentTabsActivity>({
    overview: true,
    credentials: false,
    settings: false,
    required_fields: false,
    limits_and_fees: false,
  });

  const getActiveTabKey = () => {
    const tab = Object.entries(tabsActivity).filter((item) => item[1]);
    return tab[0][0].toString();
  };

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('online_payments'), href: '/settings/online_payments' },
    {
      name: t('edit_gateway'),
      href: route('/settings/gateways/:id/edit', { id }),
    },
    {
      name: t(activeTabKey),
      href: route('/settings/gateways/:id/edit', { id }),
    },
  ];

  const [gateway, setGateway] = useState<Gateway>();

  const gateways = useGateways();

  const onSave = useHandleUpdate(companyGateway);

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
    setActiveTabKey(getActiveTabKey());
  }, [tabsActivity]);

  return (
    <Settings
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={onSave}
      onCancelClick={() => navigate('/settings/online_payments')}
    >
      <Tabs
        tabs={tabs}
        tabsActivity={tabsActivity}
        setTabsActivity={setTabsActivity}
        activeTabKey={activeTabKey}
      />

      {companyGateway && tabsActivity.overview && (
        <Card title={t('edit_gateway')}>
          <Element leftSide={t('provider')}>{companyGateway.label}</Element>
        </Card>
      )}

      {gateway && companyGateway && tabsActivity.credentials && (
        <Credentials
          gateway={gateway}
          companyGateway={companyGateway}
          setCompanyGateway={setCompanyGateway}
        />
      )}

      {gateway && companyGateway && tabsActivity.settings && (
        <GatewaySettings
          gateway={gateway}
          companyGateway={companyGateway}
          setCompanyGateway={setCompanyGateway}
        />
      )}

      {gateway && companyGateway && tabsActivity.required_fields && (
        <RequiredFields
          gateway={gateway}
          companyGateway={companyGateway}
          setCompanyGateway={setCompanyGateway}
        />
      )}

      {gateway && companyGateway && tabsActivity.limits_and_fees && (
        <LimitsAndFees
          gateway={gateway}
          companyGateway={companyGateway}
          setCompanyGateway={setCompanyGateway}
        />
      )}
    </Settings>
  );
}
