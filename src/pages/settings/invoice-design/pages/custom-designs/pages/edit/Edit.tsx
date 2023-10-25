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
import { useSaveBtn } from '$app/components/layouts/common/hooks';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { InvoiceViewer } from '$app/pages/invoices/common/components/InvoiceViewer';
import { toast } from '$app/common/helpers/toast/toast';
import { useQueryClient } from 'react-query';
import { route } from '$app/common/helpers/route';
import { Variables } from './components/Variables';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { AxiosError } from 'axios';

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
  const [payload, setPayload] = useAtom(payloadAtom);

  const { id } = useParams();
  const { data } = useDesignQuery({ id, enabled: true });

  const [errors, setErrors] = useState<ValidationBag>();

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

  const queryClient = useQueryClient();

  useSaveBtn(
    {
      onClick() {
        toast.processing();

        request('PUT', endpoint('/api/v1/designs/:id', { id }), payload.design)
          .then(() => {
            queryClient.invalidateQueries(['/api/v1/designs']);
            queryClient.invalidateQueries(route('/api/v1/designs/:id', { id }));

            toast.success('updated_design');
          })
          .catch((error: AxiosError<ValidationBag>) => {
            if (error.response?.status === 422) {
              setErrors(error.response.data);
              toast.dismiss();
            }
          });
      },
    },
    [payload.design]
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="w-full lg:w-1/2 overflow-y-auto">
        <div className="space-y-4 max-h-[80vh] pl-1 py-2 pr-2">
          <Settings errors={errors} />
          <Body />
          <Header />
          <Footer />
          <Includes />
          <Variables />
        </div>
      </div>

      <div className="w-full lg:w-1/2 max-h-[80vh] overflow-y-scroll">
        {payload.design ? (
          <InvoiceViewer
            link={endpoint('/api/v1/preview')}
            resource={payload}
            method="POST"
            withToast
          />
        ) : null}
      </div>
    </div>
  );
}
