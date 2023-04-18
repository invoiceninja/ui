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
import { useEffect } from 'react';
import { Editor } from './components/Editor';
import { useDesignQuery } from '$app/common/queries/designs';
import { useParams } from 'react-router-dom';
import { atom, useAtom } from 'jotai';

export interface Payload {
  design: Design | null;
  entity_id: string;
  entity_type: 'invoice';
}

export const payloadAtom = atom<Payload>({
  design: null,
  entity_id: '-1',
  entity_type: 'invoice',
});

export default function Edit() {
  const [payload, setPayload] = useAtom(payloadAtom);

  const { id } = useParams();
  const { data } = useDesignQuery({ id, enabled: true });

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

  return <div>{payload.design !== null && <Editor />}</div>;
}
