/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios, { AxiosPromise } from 'axios';
import classNames from 'classnames';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { activeSettingsAtom } from '$app/common/atoms/settings';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { useActiveSettingsDetails } from '$app/common/hooks/useActiveSettingsDetails';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { $refetch, RefetchKey } from '$app/common/hooks/useRefetch';
import { useTitle } from '$app/common/hooks/useTitle';
import { Settings } from '$app/common/interfaces/company.interface';
import { Page } from '$app/components/Breadcrumbs';
import { Button } from '$app/components/forms';
import { Sparkle } from '$app/components/icons/Sparkle';
import { Default } from '$app/components/layouts/Default';
import { InvoiceViewer } from '$app/pages/invoices/common/components/InvoiceViewer';
import {
  isCompanySettingsFormBusy,
  useHandleCompanySave,
} from '../common/hooks/useHandleCompanySave';
import { updatingRecordsAtom } from './common/atoms';
import { InvoiceDesignNavigation } from './common/components/InvoiceDesignNavigation';
import {
  getInvoiceDesignRouteKind,
  invoiceDesignsPath,
  isInvoiceDesignBuilderRoute,
  isInvoiceDesignCreateRoute,
} from './common/routes';
import { useTabs } from './pages/general-settings/hooks/useTabs';

export interface GeneralSettingsPayload {
  client_id: string;
  entity_type: 'invoice';
  group_id: string;
  settings: Settings | null;
  settings_type: 'company';
}
export default function InvoiceDesign() {
  const [t] = useTranslation();
  const { documentTitle } = useTitle('invoice_design');

  const { primaryTabs, settingsTabs } = useTabs();
  const location = useLocation();
  const company = useCompanyChanges();
  const activeSettings = useActiveSettingsDetails();
  const { isClientSettingsActive, isGroupSettingsActive } =
    useCurrentSettingsLevel();
  const isFormBusy = useAtomValue(isCompanySettingsFormBusy);
  const activeSettingsValue = useAtomValue(activeSettingsAtom);

  const onSave = useHandleCompanySave();

  const navigate = useNavigate();

  const routeKind = getInvoiceDesignRouteKind(location.pathname);
  const showsNavigation = routeKind === 'settings' || routeKind === 'designs';
  const displaySaveButtonAndPreview = routeKind === 'settings';
  const isBuilderRoute = isInvoiceDesignBuilderRoute(routeKind);
  const isDesignWorkflow =
    routeKind !== 'settings' &&
    routeKind !== 'designs' &&
    routeKind !== 'unknown';

  const ProBadge = () => (
    <div className="flex space-x-0.5 items-center text-xs py-1 px-2 bg-[#2176FF26] rounded">
      <div>
        <Sparkle size="1rem" color="#2176FF" />
      </div>

      <span className="font-medium" style={{ color: '#2176FF' }}>
        {t('pro')}
      </span>
    </div>
  );

  const pages: Page[] = [
    { name: t('settings'), href: '/settings' },
    {
      name: t('invoice_design'),
      href: '/settings/invoice_design',
      afterName: <ProBadge />,
    },
  ];

  const designPages: Page[] = [
    { name: t('settings'), href: '/settings' },
    { name: t('invoice_design'), href: '/settings/invoice_design' },
    {
      name: t('designs'),
      href: invoiceDesignsPath,
    },
    {
      name: isInvoiceDesignCreateRoute(routeKind)
        ? t('new_design')
        : t('design'),
      href: location.pathname,
      afterName: <ProBadge />,
    },
  ];

  const [payload, setPayload] = useState<GeneralSettingsPayload>({
    client_id: '-1',
    entity_type: 'invoice',
    group_id: '-1',
    settings: null,
    settings_type: 'company',
  });

  const updatingRecords = useAtomValue(updatingRecordsAtom);

  const handleSave = () => {
    onSave();

    const requests: AxiosPromise[] = [];

    updatingRecords.map(({ design_id, entity }) => {
      requests.push(
        request('POST', endpoint('/api/v1/designs/set/default'), {
          design_id,
          entity,
          settings_level: isGroupSettingsActive
            ? 'group_settings'
            : activeSettings.level,
          ...(isClientSettingsActive && { client_id: company?.settings?.id }),
          ...(isGroupSettingsActive && {
            group_settings_id: activeSettingsValue?.id,
          }),
        })
      );
    });

    axios.all(requests).then(() => {
      updatingRecords.forEach(({ entity }) => {
        $refetch([`${entity}s` as RefetchKey]);
      });
    });
  };

  useEffect(() => {
    if (company?.settings) {
      setPayload(
        (current) => current && { ...current, settings: company.settings }
      );
    }
  }, [company?.settings]);

  const handleCancel = () => {
    if (isBuilderRoute) {
      navigate(route('/settings/invoice_design/custom_designs'));
    }
  };

  return (
    <Default
      title={documentTitle}
      breadcrumbs={isDesignWorkflow ? designPages : pages}
      onSaveClick={displaySaveButtonAndPreview ? handleSave : undefined}
      disableSaveButton={displaySaveButtonAndPreview && isFormBusy}
      onCancelClick={isBuilderRoute ? handleCancel : undefined}
    >
      {showsNavigation && (
        <InvoiceDesignNavigation
          primaryTabs={primaryTabs}
          settingsTabs={settingsTabs}
          routeKind={routeKind}
          rightSide={
            routeKind === 'designs' ? (
              <Button
                type="primary"
                to={`${invoiceDesignsPath}/new`}
                className="whitespace-nowrap"
              >
                {t('new_design')}
              </Button>
            ) : undefined
          }
        />
      )}

      <div
        className={classNames('flex flex-col lg:flex-row gap-4', {
          'my-4': showsNavigation,
        })}
      >
        <div
          className={classNames('w-full overflow-y-auto', {
            'lg:w-1/2': displaySaveButtonAndPreview,
          })}
        >
          <Outlet />
        </div>

        {displaySaveButtonAndPreview && (
          <div className="w-full lg:w-1/2 max-h-[80vh] overflow-y-scroll">
            <InvoiceViewer
              link={endpoint('/api/v1/live_design')}
              resource={payload}
              method="POST"
              withToast
            />
          </div>
        )}
      </div>
    </Default>
  );
}
