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
import { Button } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { useTranslation } from 'react-i18next';
import { MdMarkEmailRead, MdSend } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

interface Props {
  invoice: Invoice;
}
export function CommonActions(props: Props) {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const colors = useColorScheme();

  const bulk = useBulk();

  const { invoice } = props;

  return (
    <div className="flex space-x-3">
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
    </div>
  );
}
