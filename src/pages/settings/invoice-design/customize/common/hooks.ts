/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Settings } from '$app/common/interfaces/company.interface';
import { Design, Parts } from '$app/common/interfaces/design';
import { useDesignsQuery } from '$app/common/queries/designs';
import { atom, useAtom } from 'jotai';

export interface Payload {
  client_id: string;
  entity_type: 'invoice';
  group_id: string;
  settings: Settings | null;
  design: Design | null;
  settings_type: 'company';
}

export const payloadAtom = atom<Payload>({
  client_id: '-1',
  entity_type: 'invoice',
  group_id: '-1',
  settings: null,
  design: null,
  settings_type: 'company',
});

export function useDesignUtilities() {
  const { data: designs } = useDesignsQuery();
  const [payload, setPayload] = useAtom(payloadAtom);

  const handleDesignChange = (id: string) => {
    const design = designs?.find((design) => design.id === id);

    if (design) {
      setPayload(
        (current) => current && { ...current, design: { ...design, id: '-1' } }
      );
    }
  };

  const handleDesignPropertyChange = (
    property: keyof Design,
    value: string | number | Parts
  ) => {
    if (payload && payload.design) {
      setPayload({
        ...payload,
        design: { ...payload.design, [property]: value },
      });
    }
  };

  const handleDesignBlockChange = (
    property: keyof Design['design'],
    value: string
  ) => {
    if (payload && payload.design) {
      setPayload({
        ...payload,
        design: {
          ...payload.design,
          design: { ...payload.design.design, [property]: value },
        },
      });
    }
  };

  return {
    handleDesignChange,
    handleDesignPropertyChange,
    handleDesignBlockChange,
  };
}
