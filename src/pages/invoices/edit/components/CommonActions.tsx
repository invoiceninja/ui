/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { InvoiceStatus } from '$app/common/enums/invoice-status';
import { route } from '$app/common/helpers/route';
import { Invoice } from '$app/common/interfaces/invoice';
import { useBulk } from '$app/common/queries/invoices';
import { CommonActionsPreferenceModal } from '$app/components/CommonActionsPreferenceModal';
import { Button } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdMarkEmailRead, MdSend, MdSettings } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import {
  useAllCommonActions,
  useDefaultCommonActions,
} from '../../common/hooks/useCommonActions';

interface Props {
  invoice: Invoice;
}
export function CommonActions(props: Props) {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const allCommonActions = useAllCommonActions();
  const defaultCommonActions = useDefaultCommonActions();

  const [isPreferenceModalOpen, setIsPreferenceModalOpen] =
    useState<boolean>(false);

  const colors = useColorScheme();

  const bulk = useBulk();

  const { invoice } = props;

  return (
    <>
      <div className="flex items-center space-x-3">
        {invoice.status_id === InvoiceStatus.Draft && !invoice.is_deleted && (
          <Button
            className="flex space-x-2"
            behavior="button"
            onClick={() => bulk([invoice.id], 'mark_sent')}
          >
            <Icon element={MdMarkEmailRead} color={colors.$1} />
            <span>{t('mark_sent')}</span>
          </Button>
        )}

        <Button
          className="flex space-x-2"
          behavior="button"
          onClick={() =>
            navigate(route('/invoices/:id/email', { id: invoice.id }))
          }
        >
          <Icon element={MdSend} color={colors.$1} />
          <span>{t('email_invoice')}</span>
        </Button>

        <div>
          <Icon className="cursor-pointer" element={MdSettings} size={25} />
        </div>
      </div>

      <CommonActionsPreferenceModal
        entity="invoice"
        allCommonActions={allCommonActions}
        defaultCommonActions={defaultCommonActions}
        visible={isPreferenceModalOpen}
        setVisible={setIsPreferenceModalOpen}
      />
    </>
  );
}
