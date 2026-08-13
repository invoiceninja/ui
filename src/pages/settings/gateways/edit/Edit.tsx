/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import collect from 'collect.js';
import { isEqual } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { route } from '$app/common/helpers/route';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useTitle } from '$app/common/hooks/useTitle';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { Gateway } from '$app/common/interfaces/statics';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useCompanyGatewayQuery } from '$app/common/queries/company-gateways';
import { Card, Element } from '$app/components/cards';
import { $help, HelpWidget } from '$app/components/HelpWidget';
import { CircleQuestion } from '$app/components/icons/CircleQuestion';
import { Settings } from '$app/components/layouts/Settings';
import { ResourceActions } from '$app/components/ResourceActions';
import { TabGroup } from '$app/components/TabGroup';
import { useActions } from '../common/hooks/useActions';
import { useGateways } from '../common/hooks/useGateways';
import { Credentials } from '../create/components/Credentials';
import { LimitsAndFees } from '../create/components/LimitsAndFees';
import { RequiredFields } from '../create/components/RequiredFields';
import { Settings as GatewaySettings } from '../create/components/Settings';
import { HelperModal } from './components/stripe/HelperModal';
import { ImportCustomers } from './components/stripe/ImportCustomers';
import { WebhookConfiguration } from './components/WebhookConfiguration';
import { useHandleUpdate } from './hooks/useHandleUpdate';

export function Edit() {
  const { documentTitle } = useTitle('edit_gateway');

  const [t] = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const { id } = useParams();
  const actions = useActions();
  const gateways = useGateways();
  const colors = useColorScheme();
  const accentColor = useAccentColor();

  const { data } = useCompanyGatewayQuery({ id });

  const defaultTab = [t('payment_provider')];

  const [gateway, setGateway] = useState<Gateway>();
  const [tabIndex, setTabIndex] = useState<number>(
    Number(searchParams.get('tab')) ?? 0
  );
  const [errors, setErrors] = useState<ValidationBag>();
  const [tabs, setTabs] = useState<string[]>(defaultTab);
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [companyGateway, setCompanyGateway] = useState<CompanyGateway>();
  const [showOnboardingModal, setShowOnboardingModal] =
    useState<boolean>(false);

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
      name: companyGateway?.label ?? '',
      href: route('/settings/gateways/:id/edit', { id }),
    },
  ];

  const onSave = useHandleUpdate({
    companyGateway,
    setErrors,
    setIsFormBusy,
    isFormBusy,
  });

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

  useEffect(() => {
    if (searchParams.get('show_onboarding') === 'true' && companyGateway) {
      setShowOnboardingModal(true);

      setSearchParams(
        (params) => {
          params.delete('show_onboarding');
          return params;
        },
        { replace: true }
      );
    }
  }, [companyGateway, searchParams]);

  return (
    <Settings
      title={documentTitle}
      breadcrumbs={pages}
      navigationTopRight={
        companyGateway && (
          <ResourceActions
            resource={companyGateway}
            onSaveClick={onSave}
            actions={actions}
          />
        )
      }
    >
      <HelpWidget
        id="gateways"
        url="https://raw.githubusercontent.com/invoiceninja/invoiceninja.github.io/refs/heads/v5-rework/docs/user-guide/gateways.mdx"
      />

      <Card
        title={t('edit_gateway')}
        className="shadow-sm"
        style={{ borderColor: colors.$24 }}
        withoutBodyPadding
        withoutHeaderBorder
        topRight={
          <>
            {tabIndex === 1 && (
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
                <CircleQuestion color={accentColor} size="1.3rem" />

                <span>{t('documentation')}</span>
              </button>
            )}

            {tabIndex === 3 && (
              <button
                style={{ color: accentColor }}
                type="button"
                onClick={() =>
                  $help('gateways', {
                    moveToHeading: 'Limits/Fees',
                  })
                }
                className="inline-flex items-center space-x-1 text-sm"
              >
                <CircleQuestion color={accentColor} size="1.3rem" />

                <span>{t('documentation')}</span>
              </button>
            )}
          </>
        }
      >
        <TabGroup
          tabs={tabs}
          defaultTabIndex={tabIndex}
          withHorizontalPadding
          fullRightPadding
          horizontalPaddingWidth="1.5rem"
          onTabChange={(index) => setTabIndex(index)}
        >
          <div>
            {companyGateway && (
              <div className="space-y-4">
                <Element leftSide={t('payment_provider')}>
                  {companyGateway.label}
                </Element>

                {gateway?.key === 'd14dd26a37cecc30fdd65700bfb55b23' ? (
                  <ImportCustomers />
                ) : null}

                {gateway &&
                  collect(Object.values(gateway.options))
                    .pluck('webhooks')
                    .flatten()
                    .unique()
                    .whereNotNull()
                    .count() >= 1 && (
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
                isGatewaySaved={Boolean(
                  data && isEqual(companyGateway, data.data.data)
                )}
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
      </Card>

      <HelperModal
        visible={showOnboardingModal}
        setVisible={setShowOnboardingModal}
        setTabIndex={setTabIndex}
      />
    </Settings>
  );
}
