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
import { route } from '$app/common/helpers/route';
import { useEntityPageIdentifier } from '$app/common/hooks/useEntityPageIdentifier';
import { Payment } from '$app/common/interfaces/payment';
import { useBulk } from '$app/common/queries/payments';
import { Divider } from '$app/components/cards/Divider';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Action } from '$app/components/ResourceActions';
import { useChangeTemplate } from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';
import { useTranslation } from 'react-i18next';
import {
  MdArchive,
  MdDelete,
  MdDesignServices,
  MdEdit,
  MdPayment,
  MdRestore,
  MdSend,
  MdSettingsBackupRestore,
} from 'react-icons/md';

interface Params {
  showEditAction?: boolean;
  showCommonBulkAction?: boolean;
}
export function useActions(params?: Params) {
  const [t] = useTranslation();

  const { showEditAction, showCommonBulkAction } = params || {};

  const { isEditPage } = useEntityPageIdentifier({
    entity: 'payment',
    editPageTabs: ['documents', 'payment_fields', 'apply', 'refund'],
  });

  const bulk = useBulk();

  const {
    setChangeTemplateVisible,
    setChangeTemplateResources,
  } = useChangeTemplate();

  const actions: Action<Payment>[] = [
    (payment: Payment) =>
      Boolean(showEditAction) && (
        <DropdownElement
          to={route('/payments/:id/edit', { id: payment.id })}
          icon={<Icon element={MdEdit} />}
        >
          {t('edit')}
        </DropdownElement>
      ),
    () => Boolean(showEditAction) && <Divider withoutPadding />,
    (resource: Payment) =>
      resource.amount - resource.applied > 0 &&
      !resource.is_deleted && (
        <DropdownElement
          to={route('/payments/:id/apply', { id: resource.id })}
          icon={<Icon element={MdPayment} />}
        >
          {t('apply_payment')}
        </DropdownElement>
      ),
    (resource: Payment) =>
      resource.amount !== resource.refunded &&
      !resource.is_deleted && (
        <DropdownElement
          to={route('/payments/:id/refund', { id: resource.id })}
          icon={<Icon element={MdSettingsBackupRestore} />}
        >
          {t('refund_payment')}
        </DropdownElement>
      ),
    (payment: Payment) => (
      <DropdownElement
        onClick={() => bulk([payment.id], 'email')}
        icon={<Icon element={MdSend} />}
      >
        {t('email_payment')}
      </DropdownElement>
    ),
    (payment: Payment) => (
      <DropdownElement
        onClick={() => {
          setChangeTemplateVisible(true);
          setChangeTemplateResources([payment]);
        }}
        icon={<Icon element={MdDesignServices} />}
      >
        {t('run_template')}
      </DropdownElement>
    ),
    (payment: Payment) =>
      (isEditPage || showCommonBulkAction) &&
      getEntityState(payment) !== EntityState.Deleted && (
        <Divider withoutPadding />
      ),
    (payment: Payment) =>
      getEntityState(payment) === EntityState.Active &&
      (isEditPage || showCommonBulkAction) && (
        <DropdownElement
          onClick={() => bulk([payment.id], 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (payment: Payment) =>
      getEntityState(payment) === EntityState.Archived &&
      getEntityState(payment) !== EntityState.Deleted &&
      (isEditPage || showCommonBulkAction) && (
        <DropdownElement
          onClick={() => bulk([payment.id], 'restore')}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (payment: Payment) =>
      (getEntityState(payment) === EntityState.Active ||
        getEntityState(payment) === EntityState.Archived) &&
      (isEditPage || showCommonBulkAction) && (
        <DropdownElement
          onClick={() => bulk([payment.id], 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}
