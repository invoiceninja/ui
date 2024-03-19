/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Design, Parts } from '$app/common/interfaces/design';
import { PreviewPayload } from '../../../CustomDesign';
import { Dispatch, SetStateAction } from 'react';

interface Params {
  payload: PreviewPayload;
  setPayload: Dispatch<SetStateAction<PreviewPayload>>;
}
export function useDesignUtilities(params: Params) {
  const { payload, setPayload } = params;

  const handlePropertyChange = (
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

  const handleBlockChange = (
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

  const handleResourceChange = (value: string, checked: boolean) => {
    if (!payload.design) {
      return;
    }

    const entities =
      payload.design.entities.length > 1
        ? payload.design.entities.split(',') || ([] as string[])
        : [];

    const filtered = entities.filter((e) => e !== value);

    if (checked) {
      filtered.push(value);
    }

    if (payload && payload.design) {
      setPayload({
        ...payload,
        design: { ...payload.design, entities: filtered.join(',') },
      });
    }
  };

  return {
    handlePropertyChange,
    handleBlockChange,
    handleResourceChange,
  };
}
