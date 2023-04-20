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
import { toast } from '$app/common/helpers/toast/toast';
import { Settings } from '$app/common/interfaces/company.interface';
import { Design, Parts } from '$app/common/interfaces/design';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import {
  isModalVisibleAtom,
  validationBagAtom,
} from '$app/pages/settings/invoice-design/customize/components/EditModal';
import { designAtom } from '$app/pages/settings/invoice-design/customize/components/Settings';
import { AxiosError } from 'axios';
import { atom, useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

export type DesignType = 'stock' | 'custom';

export interface Payload {
  client_id: string;
  entity_type: 'invoice';
  group_id: string;
  settings: Settings | null;
  design?: Parts;
  settings_type: 'company';
  internal_design_type: DesignType;
}

export const payloadAtom = atom<Payload>({
  client_id: '-1',
  entity_type: 'invoice',
  group_id: '-1',
  settings: null,
  settings_type: 'company',
  internal_design_type: 'stock',
});

export function useDesignUtilities() {
  const [payload, setPayload] = useAtom(payloadAtom);

  const handleDesignChange = (design: Design, type: DesignType) => {
    if (design) {
      setPayload(
        (current) =>
          current && {
            ...current,
            design: design.design,
            internal_design_type: type,
          }
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
          [property]: value,
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

export function useHandleDesignSave() {
  const [, setValidationBag] = useAtom(validationBagAtom);
  const [, setIsVisible] = useAtom(isModalVisibleAtom);
  const [payload] = useAtom(payloadAtom);

  const queryClient = useQueryClient();

  return (design: Design) => {
    toast.processing();
    setValidationBag(null);

    const body =
      payload.internal_design_type === 'stock'
        ? design
        : { ...design, design: payload.design };

    request('PUT', endpoint('/api/v1/designs/:id', { id: design.id }), body)
      .then(() => {
        toast.success('updated_design');

        window.dispatchEvent(
          new CustomEvent('invalidate.combobox.queries', {
            detail: {
              url: endpoint('/api/v1/designs'),
            },
          })
        );

        queryClient.invalidateQueries('/api/v1/designs');

        setIsVisible(false);
      })
      .catch((e: AxiosError<ValidationBag>) => {
        if (e.response?.status === 422) {
          setValidationBag(e.response.data);
        }

        console.error(e);
        toast.error();
      });
  };
}

export function useDesignActions() {
  const { t } = useTranslation();

  const [design] = useAtom(designAtom);
  const [, setIsModalVisible] = useAtom(isModalVisibleAtom);

  const queryClient = useQueryClient();

  const restore = () => {
    request('POST', endpoint('/api/v1/designs/bulk'), {
      action: 'restore',
      ids: [design?.id],
    })
      .then(() => {
        toast.success('restored_design');
        window.dispatchEvent(
          new CustomEvent('invalidate.combobox.queries', {
            detail: {
              url: endpoint('/api/v1/designs'),
            },
          })
        );

        queryClient.invalidateQueries('/api/v1/designs');

        setIsModalVisible(false);
      })
      .catch((error) => {
        toast.error();
        console.error(error);
      });
  };

  const destroy = () => {
    request('POST', endpoint('/api/v1/designs/bulk'), {
      action: 'delete',
      ids: [design?.id],
    })
      .then(() => {
        toast.success('deleted_design');
        window.dispatchEvent(
          new CustomEvent('invalidate.combobox.queries', {
            detail: {
              url: endpoint('/api/v1/designs'),
            },
          })
        );

        queryClient.invalidateQueries('/api/v1/designs');

        setIsModalVisible(false);
      })
      .catch((error) => {
        toast.error();
        console.error(error);
      });
  };

  return [
    (design: Design) =>
      design.is_deleted && (
        <DropdownElement onClick={restore}>{t('restore')}</DropdownElement>
      ),
    (design: Design) =>
      !design.is_deleted && (
        <DropdownElement onClick={destroy}>{t('delete')}</DropdownElement>
      ),
  ];
}
