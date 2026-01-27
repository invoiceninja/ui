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
import { useAtom } from 'jotai';
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
import { ErrorMessage } from '$app/components/ErrorMessage';
import { atomWithStorage } from 'jotai/utils';

export interface PreviewPayload {
  design: Design | null;
  entity_id: string;
  entity: EntityType;
}

export type EntityType = 'invoice' | 'quote' | 'credit' | 'purchase_order';

interface DesignEntitySelection {
  entity: EntityType;
  entity_id: string;
}

const DESIGN_ENTITY_STORAGE_KEY = 'custom_design_entity_selections';

function getStoredEntitySelection(
  designId: string
): DesignEntitySelection | null {
  try {
    const stored = localStorage.getItem(DESIGN_ENTITY_STORAGE_KEY);
    if (stored) {
      const selections = JSON.parse(stored) as Record<
        string,
        DesignEntitySelection
      >;
      return selections[designId] || null;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

function saveEntitySelection(
  designId: string,
  entity: EntityType,
  entity_id: string
): void {
  try {
    const stored = localStorage.getItem(DESIGN_ENTITY_STORAGE_KEY);
    const selections: Record<string, DesignEntitySelection> = stored
      ? JSON.parse(stored)
      : {};
    selections[designId] = { entity, entity_id };
    localStorage.setItem(DESIGN_ENTITY_STORAGE_KEY, JSON.stringify(selections));
  } catch {
    // Ignore storage errors
  }
}

const shouldRenderHTMLAtom = atomWithStorage<boolean>(
  'should_render_design_html',
  false
);

export default function CustomDesign() {
  useTitle('invoice_design');

  const actions = useActions({ withoutExportAction: true });

  const tabs = useTabs();
  const location = useLocation();

  const { id } = useParams();
  const { data } = useDesignQuery({ id, enabled: true });

  const [payload, setPayload] = useState<PreviewPayload>({
    design: null,
    entity_id: '-1',
    entity: 'invoice',
  });

  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [shouldRenderHTML, setShouldRenderHTML] = useAtom(shouldRenderHTMLAtom);

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
    if (data && id) {
      const storedSelection = getStoredEntitySelection(id);
      setPayload((current) => ({
        ...current,
        design: data,
        ...(storedSelection && {
          entity: storedSelection.entity,
          entity_id: storedSelection.entity_id,
        }),
      }));
    }

    return () =>
      setPayload({ design: null, entity_id: '-1', entity: 'invoice' });
  }, [data, id]);

  useEffect(() => {
    if (id && payload.design) {
      saveEntitySelection(id, payload.entity, payload.entity_id);
    }
  }, [id, payload.entity, payload.entity_id, payload.design]);

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
