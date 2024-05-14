/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Design } from '$app/common/interfaces/design';
import { useEffect, useState } from 'react';
import { useDesignQuery } from '$app/common/queries/designs';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { atom } from 'jotai';
import { useNavigationTopRightElement } from '$app/components/layouts/common/hooks';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { InvoiceViewer } from '$app/pages/invoices/common/components/InvoiceViewer';
import { toast } from '$app/common/helpers/toast/toast';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { AxiosError } from 'axios';
import { $refetch } from '$app/common/hooks/useRefetch';
import { ResourceActions } from '$app/components/ResourceActions';
import { useActions } from '$app/pages/settings/invoice-design/common/hooks/useActions';
import { PanelGroup } from './pages/edit/components/PanelGroup';
import { Panel } from './pages/edit/components/Panel';
import { PanelResizeHandle } from './pages/edit/components/PanelResizeHandle';
import { Tabs } from '$app/components/Tabs';
import { useTabs } from './pages/edit/common/hooks/useTabs';
import { useTitle } from '$app/common/hooks/useTitle';

export interface PreviewPayload {
  design: Design | null;
  entity_id: string;
  entity_type: 'invoice';
}

export const payloadAtom = atom<PreviewPayload>({
  design: null,
  entity_id: '-1',
  entity_type: 'invoice',
});

export default function CustomDesign() {
  useTitle('invoice_design');

  const actions = useActions();

  const tabs = useTabs();
  const location = useLocation();

  const { id } = useParams();
  const { data } = useDesignQuery({ id, enabled: true });

  const [payload, setPayload] = useState<PreviewPayload>({
    design: null,
    entity_id: '-1',
    entity_type: 'invoice',
  });
  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [shouldRenderHTML, setShouldRenderHTML] = useState<boolean>(false);

  const handleSaveInvoiceDesign = () => {
    if (!isFormBusy) {
      toast.processing();
      setIsFormBusy(true);

      request('PUT', endpoint('/api/v1/designs/:id', { id }), payload.design)
        .then(() => {
          $refetch(['designs']);

          toast.success('updated_design');
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            setErrors(error.response.data);
            toast.dismiss();
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  useNavigationTopRightElement(
    {
      element: payload?.design && (
        <ResourceActions
          resource={payload.design}
          onSaveClick={handleSaveInvoiceDesign}
          actions={actions}
          disableSaveButton={isFormBusy}
        />
      ),
    },
    [payload.design, isFormBusy, location]
  );

  useEffect(() => {
    if (data) {
      setPayload((current) => ({
        ...current,
        design: data,
      }));
    }

    return () =>
      setPayload({ design: null, entity_id: '-1', entity_type: 'invoice' });
  }, [data]);

  return (
    <>
      <Tabs tabs={tabs} />

      <PanelGroup>
        <Panel>
          <div className="space-y-4 h-full max-h-[80vh] overflow-y-auto">
            <Outlet
              context={{
                errors,
                isFormBusy,
                shouldRenderHTML,
                setShouldRenderHTML,
                payload,
                setPayload,
              }}
            />
          </div>
        </Panel>

        <PanelResizeHandle />

        <Panel>
          <div className="max-h-[80vh] overflow-y-scroll">
            {payload.design ? (
              <InvoiceViewer
                link={endpoint('/api/v1/preview?html=:renderHTML', {
                  renderHTML: shouldRenderHTML,
                })}
                resource={payload}
                method="POST"
                withToast
                renderAsHTML={shouldRenderHTML}
              />
            ) : null}
          </div>
        </Panel>
      </PanelGroup>
    </>
  );
}
