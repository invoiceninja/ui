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
import { useParams } from 'react-router-dom';
import { atom, useAtom } from 'jotai';
import { Settings } from './components/Settings';
import { Body } from './components/Body';
import { Header } from './components/Headers';
import { Footer } from './components/Footer';
import { Includes } from './components/Includes';
import { useNavigationTopRightElement } from '$app/components/layouts/common/hooks';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { InvoiceViewer } from '$app/pages/invoices/common/components/InvoiceViewer';
import { toast } from '$app/common/helpers/toast/toast';
import { Variables } from './components/Variables';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { AxiosError } from 'axios';
import { $refetch } from '$app/common/hooks/useRefetch';
import { ResourceActions } from '$app/components/ResourceActions';
import { useActions } from '$app/pages/settings/invoice-design/common/hooks/useActions';
import { PanelResizeHandle } from 'react-resizable-panels';
import { PanelGroup } from './components/PanelGroup';
import { useMediaQuery } from 'react-responsive';
import { Panel } from './components/Panel';

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

export default function Edit() {
  const actions = useActions();

  const isLargeScreen = useMediaQuery({ query: '(min-width: 1024px)' });

  const { id } = useParams();
  const { data } = useDesignQuery({ id, enabled: true });

  const [payload, setPayload] = useAtom(payloadAtom);
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
    [payload.design, isFormBusy]
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
    <PanelGroup>
      <Panel>
        <div className="w-full lg:w-1/2 overflow-y-auto">
          <div className="space-y-4 max-h-[80vh] pl-1 pr-2">
            <Settings
              errors={errors}
              isFormBusy={isFormBusy}
              shouldRenderHTML={shouldRenderHTML}
              setShouldRenderHTML={setShouldRenderHTML}
            />
            <Body />
            <Header />
            <Footer />
            <Includes />
            <Variables />
          </div>
        </div>
      </Panel>

      {isLargeScreen && <PanelResizeHandle className="w-1 bg-gray-500" />}

      <Panel>
        <div className="w-full lg:w-1/2 max-h-[80vh] overflow-y-scroll">
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
  );
}
