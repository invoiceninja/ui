/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { getEntityState } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Action } from '$app/components/ResourceActions';
import { useTranslation } from 'react-i18next';
import { Icon } from '$app/components/icons/Icon';
import {
  MdArchive,
  MdComment,
  MdDelete,
  MdEdit,
  MdRestore,
} from 'react-icons/md';
import { EntityState } from '$app/common/enums/entity-state';
import { useBulkAction } from '$app/common/queries/vendor';
import { Vendor } from '$app/common/interfaces/vendor';
import { useEntityPageIdentifier } from '$app/common/hooks/useEntityPageIdentifier';
import { AddActivityComment } from '$app/pages/dashboard/hooks/useGenerateActivityElement';
import { MergeVendorsAction } from '../components/MergeVendorsAction';
import { Divider } from '$app/components/cards/Divider';

interface Params {
  showEditAction?: boolean;
  showCommonBulkAction?: boolean;
}

export function useActions(params?: Params) {
  const [t] = useTranslation();

  const { showEditAction, showCommonBulkAction } = params || {};

  const bulk = useBulkAction();

  const { isEditOrShowPage } = useEntityPageIdentifier({
    entity: 'vendor',
  });

  const actions: Action<Vendor>[] = [
    (vendor) =>
      Boolean(showEditAction) && (
        <DropdownElement
          to={route('/vendors/:id/edit', { id: vendor.id })}
          icon={<Icon element={MdEdit} />}
        >
          {t('edit')}
        </DropdownElement>
      ),
    () => Boolean(showEditAction) && <Divider withoutPadding />,
    (vendor) => (
      <AddActivityComment
        entity="vendor"
        entityId={vendor.id}
        label={vendor.number}
        labelElement={
          <DropdownElement icon={<Icon element={MdComment} />}>
            {t('add_comment')}
          </DropdownElement>
        }
      />
    ),
    (vendor) => vendor && <MergeVendorsAction mergeFromVendorId={vendor.id} />,
    () =>
      (isEditOrShowPage || Boolean(showCommonBulkAction)) && (
        <Divider withoutPadding />
      ),
    (vendor) =>
      (isEditOrShowPage || Boolean(showCommonBulkAction)) &&
      getEntityState(vendor) === EntityState.Active && (
        <DropdownElement
          onClick={() => bulk(vendor.id, 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (vendor) =>
      (isEditOrShowPage || Boolean(showCommonBulkAction)) &&
      (getEntityState(vendor) === EntityState.Archived ||
        getEntityState(vendor) === EntityState.Deleted) && (
        <DropdownElement
          onClick={() => bulk(vendor.id, 'restore')}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (vendor) =>
      (isEditOrShowPage || Boolean(showCommonBulkAction)) &&
      (getEntityState(vendor) === EntityState.Active ||
        getEntityState(vendor) === EntityState.Archived) && (
        <DropdownElement
          onClick={() => bulk(vendor.id, 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}
