/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { atom, useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useTitle } from '$app/common/hooks/useTitle';
import { Design } from '$app/common/interfaces/design';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useDesignQuery } from '$app/common/queries/designs';
import { ErrorMessage } from '$app/components/ErrorMessage';
import { useNavigationTopRightElement } from '$app/components/layouts/common/hooks';
import { ResourceActions } from '$app/components/ResourceActions';
import { Tabs } from '$app/components/Tabs';
import { InvoiceViewer } from '$app/pages/invoices/common/components/InvoiceViewer';
import { useActions } from '$app/pages/settings/invoice-design/common/hooks/useActions';
import { useTabs } from './pages/edit/common/hooks/useTabs';
import { Panel } from './pages/edit/components/Panel';
import { PanelGroup } from './pages/edit/components/PanelGroup';
import { PanelResizeHandle } from './pages/edit/components/PanelResizeHandle';
import { designPreviewPropertiesAtom } from './pages/edit/components/Settings';

export interface PreviewPayload {
  design: Design | null;
  entity_id: string;
  entity: EntityType;
}

export type EntityType = 'invoice' | 'quote' | 'credit' | 'purchase_order';

export const payloadAtom = atom<PreviewPayload>({
  design: null,
  entity_id: '-1',
  entity: 'invoice',
});

export default function CustomDesign() {
  useTitle('invoice_design');

  const actions = useActions({ withoutExportAction: true });

  const tabs = useTabs();
  const location = useLocation();

  const { id } = useParams();
  const { data } = useDesignQuery({ id, enabled: true });

  const [designPreviewProperties, setDesignPreviewProperties] = useAtom(
    designPreviewPropertiesAtom
  );
  const [payload, setPayload] = useState<PreviewPayload>({
    design: null,
    entity_id: '-1',
    entity: 'invoice',
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
      const storedDesignPreviewProperties = designPreviewProperties.find(
        (property) => property.design_id === data.id
      );

      if (storedDesignPreviewProperties) {
        setPayload(
          (current) =>
            ({
              ...current,
              design: data,
              entity: storedDesignPreviewProperties.entity,
              entity_id: storedDesignPreviewProperties.entity_id,
            }) as PreviewPayload
        );
      } else {
        setDesignPreviewProperties((current) => [
          ...current,
          {
            design_id: data.id,
            entity_id: '-1',
            entity: 'invoice',
            html_mode: false,
          },
        ]);

        setPayload((current) => ({
          ...current,
          design: data,
        }));
      }
    }

    return () =>
      setPayload({ design: null, entity_id: '-1', entity: 'invoice' });
  }, [data]);

  return (
    <>
      <Tabs tabs={tabs} />

      <PanelGroup>
        <Panel>
          <div className="space-y-4 h-full max-h-[80vh] overflow-y-auto">
            {errors?.errors['design.design.body'] ? (
              <ErrorMessage>
                <p>{errors.message}</p>
                <small>{errors.errors['design.design.body']}</small>
              </ErrorMessage>
            ) : null}

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
                onError={(error: AxiosError<ArrayBuffer>) => {
                  if (error.response?.status === 422 && error.response.data) {
                    const response = new TextDecoder('utf-8').decode(
                      error.response.data
                    );

                    const body = JSON.parse(response) as ValidationBag;

                    setErrors(body);
                  }
                }}
                onRequest={() => setErrors(undefined)}
              />
            ) : null}
          </div>
        </Panel>
      </PanelGroup>
    </>
  );
}
