/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { EntityState } from '$app/common/enums/entity-state';
import { endpoint, getEntityState } from '$app/common/helpers';
import { Design } from '$app/common/interfaces/design';
import { useBulkAction } from '$app/common/queries/invoice-design';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Action } from '$app/components/ResourceActions';
import { useTranslation } from 'react-i18next';
import {
  MdArchive,
  MdControlPointDuplicate,
  MdDelete,
  MdDownload,
  MdRestore,
} from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import { useExportInvoiceDesign } from '../../pages/custom-designs/hooks/useExportInvoiceDesign';
import { Divider } from '$app/components/cards/Divider';
import { useRefetch } from '$app/common/hooks/useRefetch';
import { request } from '$app/common/helpers/request';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { route } from '$app/common/helpers/route';
import { useState } from 'react';
import { toast } from '$app/common/helpers/toast/toast';

interface Params {
  withoutExportAction?: boolean;
}

export function useActions({ withoutExportAction = false }: Params = {}) {
  const [t] = useTranslation();

  const { id } = useParams();

  const refetch = useRefetch();

  const bulk = useBulkAction();
  const navigate = useNavigate();
  const exportInvoiceDesign = useExportInvoiceDesign();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const cloneToInvoiceDesign = (invoiceDesign: Design) => {
    if (!isFormBusy) {
      toast.processing();
      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/designs/bulk'), {
        ids: [invoiceDesign.id],
        action: 'clone',
      })
        .then((response: GenericSingleResourceResponse<Design>) => {
          refetch(['designs']);

          navigate(
            route('/settings/invoice_design/custom_designs/:id/edit', {
              id: response.data.data.id,
            })
          );
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  const actions: Action<Design>[] = [
    (invoiceDesign: Design) => (
      <DropdownElement
        onClick={() => cloneToInvoiceDesign(invoiceDesign)}
        icon={<Icon element={MdControlPointDuplicate} />}
        disabled={isFormBusy}
      >
        {t('clone')}
      </DropdownElement>
    ),
    (invoiceDesign) =>
      !withoutExportAction && (
        <DropdownElement
          onClick={() => exportInvoiceDesign(invoiceDesign)}
          icon={<Icon element={MdDownload} />}
          disabled={isFormBusy}
        >
          {t('export')}
        </DropdownElement>
      ),
    () => Boolean(id) && <Divider withoutPadding />,
    (invoiceDesign) =>
      Boolean(id && getEntityState(invoiceDesign) === EntityState.Active) && (
        <DropdownElement
          onClick={() => bulk([invoiceDesign.id], 'archive')}
          icon={<Icon element={MdArchive} />}
          disabled={isFormBusy}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (invoiceDesign) =>
      Boolean(
        id &&
          (getEntityState(invoiceDesign) === EntityState.Archived ||
            getEntityState(invoiceDesign) === EntityState.Deleted)
      ) && (
        <DropdownElement
          onClick={() => bulk([invoiceDesign.id], 'restore')}
          icon={<Icon element={MdRestore} />}
          disabled={isFormBusy}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (invoiceDesign) =>
      Boolean(
        id &&
          (getEntityState(invoiceDesign) === EntityState.Active ||
            getEntityState(invoiceDesign) === EntityState.Archived)
      ) && (
        <DropdownElement
          onClick={() => bulk([invoiceDesign.id], 'delete')}
          icon={<Icon element={MdDelete} />}
          disabled={isFormBusy}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}
