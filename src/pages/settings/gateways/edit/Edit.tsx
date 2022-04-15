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
import { useTitle } from 'common/hooks/useTitle';
import { CompanyGateway } from 'common/interfaces/company-gateway';
import { Gateway } from 'common/interfaces/statics';
import { useCompanyGatewayQuery } from 'common/queries/company-gateways';
import { Settings } from 'components/layouts/Settings';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { useGateways } from '../common/hooks/useGateways';
import { Credentials } from '../create/components/Credentials';
import { LimitsAndFees } from '../create/components/LimitsAndFees';
import { RequiredFields } from '../create/components/RequiredFields';
import { Settings as GatewaySettings } from '../create/components/Settings';
import { useHandleUpdate } from './hooks/useHandleUpdate';

export function Edit() {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const { documentTitle } = useTitle('online_payments');
  const { id } = useParams();
  const { data } = useCompanyGatewayQuery({ id });

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('online_payments'), href: '/settings/online_payments' },
    {
      name: t('edit_gateway'),
      href: generatePath('/settings/gateways/:id/edit', { id }),
    },
  ];

  const [companyGateway, setCompanyGateway] = useState<CompanyGateway>();
  const [gateway, setGateway] = useState<Gateway>();

  const gateways = useGateways();
  const onSave = useHandleUpdate(companyGateway);

  useEffect(() => {
    companyGateway &&
      setGateway(
        gateways.find((gateway) => gateway.key == companyGateway.gateway_key)
      );
  }, [companyGateway]);

  useEffect(() => {
    if (data?.data.data) {
      setCompanyGateway(data.data.data);
    }
  }, [data]);

  return (
    <Settings
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={onSave}
      onCancelClick={() => navigate('/settings/online_payments')}
    >
      {companyGateway && (
        <Card title={t('edit_gateway')}>
          <Element leftSide={t('provider')}>{companyGateway.label}</Element>
        </Card>
      )}

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

      {gateway && companyGateway && (
        <RequiredFields
          gateway={gateway}
          companyGateway={companyGateway}
          setCompanyGateway={setCompanyGateway}
        />
      )}

      {gateway && companyGateway && (
        <LimitsAndFees
          gateway={gateway}
          companyGateway={companyGateway}
          setCompanyGateway={setCompanyGateway}
        />
      )}
    </Settings>
  );
}
