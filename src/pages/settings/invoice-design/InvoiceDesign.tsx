/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useTitle } from '$app/common/hooks/useTitle';
import { Tabs } from '$app/components/Tabs';
import { Default } from '$app/components/layouts/Default';
import axios, { AxiosPromise } from 'axios';
import { useAtomValue } from 'jotai';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { updatingRecordsAtom } from './common/atoms';
import { useEffect, useState } from 'react';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import { useSaveBtn } from '$app/components/layouts/common/hooks';
import { InvoiceViewer } from '$app/pages/invoices/common/components/InvoiceViewer';
import { useTabs } from './pages/general-settings/hooks/useTabs';
import { Settings } from '$app/common/interfaces/company.interface';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { route } from '$app/common/helpers/route';
import { Page } from '$app/components/Breadcrumbs';

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

  const { id } = useParams();

  const tabs = useTabs();
  const location = useLocation();
  const company = useCompanyChanges();
  const displaySaveButtonAndPreview =
    !location.pathname.includes('custom_designs');

  const onSave = useHandleCompanySave();

  const showsMainTabs = location.pathname.includes('custom_designs')
    ? location.pathname.endsWith('/custom_designs')
    : true;

  const pages: Page[] = [
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
        })
      );
    });

    axios.all(requests);
  };

  useEffect(() => {
    if (company?.settings) {
      setPayload(
        (current) => current && { ...current, settings: company.settings }
      );
    }
  }, [company?.settings]);

  useSaveBtn(
    {
      onClick: handleSave,
      displayButton: displaySaveButtonAndPreview,
    },
    [company, updatingRecords, location]
  );

  return (
    <Default
      title={documentTitle}
      breadcrumbs={showsMainTabs ? undefined : pages}
    >
      <Tabs tabs={tabs} visible={showsMainTabs} />

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
              method="POST"
              withToast
            />
          </div>
        )}
      </div>
    </Default>
  );
}
