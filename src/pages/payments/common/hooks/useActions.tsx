/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { EntityState } from 'common/enums/entity-state';
import { getEntityState } from 'common/helpers';
import { route } from 'common/helpers/route';
import { Payment } from 'common/interfaces/payment';
import { useBulk } from 'common/queries/payments';
import { Divider } from 'components/cards/Divider';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Icon } from 'components/icons/Icon';
import { Action } from 'components/ResourceActions';
import { useTranslation } from 'react-i18next';
import {
  MdArchive,
  MdDelete,
  MdPayment,
  MdRestore,
  MdSend,
  MdSettingsBackupRestore,
} from 'react-icons/md';
import { useLocation } from 'react-router-dom';

export function useActions() {
  const [t] = useTranslation();
  const location = useLocation();

  const isEditPage = location.pathname.endsWith('/edit');

  const bulk = useBulk();

  const actions: Action<Payment>[] = [
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
        onClick={() => bulk(payment.id, 'email')}
        icon={<Icon element={MdSend} />}
      >
        {t('email_payment')}
      </DropdownElement>
    ),
    () => isEditPage && <Divider withoutPadding />,
    (payment: Payment) =>
      getEntityState(payment) === EntityState.Active &&
      isEditPage && (
        <DropdownElement
          onClick={() => bulk(payment.id, 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (payment: Payment) =>
      (getEntityState(payment) === EntityState.Archived ||
        getEntityState(payment) === EntityState.Deleted) &&
      isEditPage && (
        <DropdownElement
          onClick={() => bulk(payment.id, 'restore')}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (payment: Payment) =>
      (getEntityState(payment) === EntityState.Active ||
        getEntityState(payment) === EntityState.Archived) &&
      isEditPage && (
        <DropdownElement
          onClick={() => bulk(payment.id, 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}
