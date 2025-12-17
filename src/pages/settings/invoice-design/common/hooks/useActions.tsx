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
import { getEntityState } from '$app/common/helpers';
import { Design } from '$app/common/interfaces/design';
import { useBulkAction } from '$app/common/queries/invoice-design';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Action } from '$app/components/ResourceActions';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  MdArchive,
  MdControlPointDuplicate,
  MdDelete,
  MdDownload,
  MdRestore,
} from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import { invoiceDesignAtom } from '../../pages/custom-designs/pages/create/Create';
import { useExportInvoiceDesign } from '../../pages/custom-designs/hooks/useExportInvoiceDesign';
import { Divider } from '$app/components/cards/Divider';

interface Params {
  withoutExportAction?: boolean;
}

export function useActions({ withoutExportAction = false }: Params = {}) {
  const [t] = useTranslation();

  const { id } = useParams();

  const bulk = useBulkAction();
  const navigate = useNavigate();
  const exportInvoiceDesign = useExportInvoiceDesign();

  const setInvoiceDesign = useSetAtom(invoiceDesignAtom);

  const cloneToInvoiceDesign = (invoiceDesign: Design) => {
    setInvoiceDesign({ ...invoiceDesign, id: '' });

    navigate('/settings/invoice_design/custom_designs/create?action=clone');
  };

  const actions: Action<Design>[] = [
    (invoiceDesign: Design) => (
      <DropdownElement
        onClick={() => cloneToInvoiceDesign(invoiceDesign)}
        icon={<Icon element={MdControlPointDuplicate} />}
      >
        {t('clone')}
      </DropdownElement>
    ),
    (invoiceDesign) =>
      !withoutExportAction && (
        <DropdownElement
          onClick={() => exportInvoiceDesign(invoiceDesign)}
          icon={<Icon element={MdDownload} />}
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
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}
