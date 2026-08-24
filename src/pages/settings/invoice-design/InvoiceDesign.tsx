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
import { isEqual } from 'lodash';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { activeSettingsAtom } from '$app/common/atoms/settings';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { useActiveSettingsDetails } from '$app/common/hooks/useActiveSettingsDetails';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { $refetch, RefetchKey } from '$app/common/hooks/useRefetch';
import { useTitle } from '$app/common/hooks/useTitle';
import { Settings } from '$app/common/interfaces/company.interface';
import { Page } from '$app/components/Breadcrumbs';
import { Sparkle } from '$app/components/icons/Sparkle';
import { useSaveBtn } from '$app/components/layouts/common/hooks';
import { Default } from '$app/components/layouts/Default';
import { Tabs } from '$app/components/Tabs';
import { InvoiceViewer } from '$app/pages/invoices/common/components/InvoiceViewer';
import {
  isCompanySettingsFormBusy,
  useHandleCompanySave,
} from '../common/hooks/useHandleCompanySave';
import {
  buildLiveDesignPayload,
  isLiveDesignPreviewEnabled,
  livePreviewEntityTypeAtom,
  LivePreviewEntityType,
  resolveEffectiveLivePreviewEntityType,
  serializeLiveDesignPreviewKey,
  updatingRecordsAtom,
} from './common/atoms';
import { useTabs } from './pages/general-settings/hooks/useTabs';

export interface GeneralSettingsPayload {
  client_id: string;
  entity_type: LivePreviewEntityType;
  group_id: string;
  settings: Settings | null;
  settings_type: 'company';
}

export default function InvoiceDesign() {
  const [t] = useTranslation();
  const { documentTitle } = useTitle('invoice_design');

  const { id } = useParams();

  const tabs = useTabs();
  const location = useLocation();
  useInjectCompanyChanges();
  const company = useCompanyChanges();
  const activeSettings = useActiveSettingsDetails();
  const { isClientSettingsActive, isGroupSettingsActive } =
    useCurrentSettingsLevel();
  const displaySaveButtonAndPreview =
    !location.pathname.includes('custom_designs');

  const isFormBusy = useAtomValue(isCompanySettingsFormBusy);
  const activeSettingsValue = useAtomValue(activeSettingsAtom);

  const onSave = useHandleCompanySave();

  const showsMainTabs = location.pathname.includes('custom_designs')
    ? location.pathname.endsWith('/custom_designs')
    : true;

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

  const pages2: Page[] = [
    { name: t('settings'), href: '/settings' },
    { name: t('invoice_design'), href: '/settings/invoice_design' },
    {
      name: t('custom_designs'),
      href: '/settings/invoice_design/custom_designs',
    },
    {
      name: t('design'),
      href: id
        ? route('/settings/invoice_design/custom_designs/:id/edit', { id })
        : '/settings/invoice_design/custom_designs/create',
      afterName: <ProBadge />,
    },
  ];

  const designPreviewEntityType = useAtomValue(livePreviewEntityTypeAtom);

  const livePreviewEntityType = useMemo(
    () =>
      resolveEffectiveLivePreviewEntityType(
        location.pathname,
        designPreviewEntityType
      ),
    [location.pathname, designPreviewEntityType]
  );

  const updatingRecords = useAtomValue(updatingRecordsAtom);

  const stableSettingsRef = useRef<Settings | null>(null);

  const stableSettings = useMemo(() => {
    const next = company?.settings ?? null;

    if (isEqual(stableSettingsRef.current, next)) {
      return stableSettingsRef.current;
    }

    stableSettingsRef.current = next;

    return next;
  }, [company?.settings]);

  const payload = useMemo(
    () => buildLiveDesignPayload(livePreviewEntityType, stableSettings),
    [livePreviewEntityType, stableSettings]
  );

  const previewEnabled = useMemo(
    () => isLiveDesignPreviewEnabled(livePreviewEntityType, stableSettings),
    [livePreviewEntityType, stableSettings]
  );

  const previewResourceKey = useMemo(
    () => serializeLiveDesignPreviewKey(payload),
    [payload]
  );

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

  useSaveBtn(
    {
      onClick: handleSave,
      displayButton: displaySaveButtonAndPreview,
      disableSaveButton: isFormBusy,
    },
    [company, updatingRecords, location, isFormBusy]
  );

  return (
    <Default title={documentTitle} breadcrumbs={showsMainTabs ? pages : pages2}>
      <Tabs
        tabs={tabs}
        visible={showsMainTabs}
        withoutDefaultTabSpace
        fullRightPadding
        paddingTabsHeight="2.9rem"
      />

      <div
        className={classNames('flex flex-col lg:flex-row gap-4', {
          'my-4': showsMainTabs,
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
              resourceKey={previewResourceKey}
              method="POST"
              withToast
              enabled={previewEnabled}
            />
          </div>
        )}
      </div>
    </Default>
  );
}
