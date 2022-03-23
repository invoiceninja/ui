/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentInvoice } from 'common/hooks/useCurrentInvoice';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { useDownloadPdf } from 'pages/invoices/common/hooks/useDownloadPdf';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate, useParams } from 'react-router-dom';

export function Actions() {
  const [t] = useTranslation();
  const { id } = useParams();
  const invoice = useCurrentInvoice();
  const downloadPdf = useDownloadPdf();
  const navigate = useNavigate();

  return (
    <Dropdown label={t('more_actions')} className="divide-y">
      <div>
        <DropdownElement to={generatePath('/invoices/:id/pdf', { id })}>
          {t('view_pdf')}
        </DropdownElement>

        <DropdownElement onClick={() => invoice && downloadPdf(invoice)}>
          {t('download')}
        </DropdownElement>

        <DropdownElement
          onClick={() => navigate(generatePath('/invoices/:id/email', { id }))}
        >
          {t('email_invoice')}
        </DropdownElement>
        
        <DropdownElement>{t('mark_paid')}</DropdownElement>
        <DropdownElement>{t('enter_payment')}</DropdownElement>
        <DropdownElement>{t('client_portal')}</DropdownElement>
      </div>

      <div>
        <DropdownElement>{t('clone_to_invoice')}</DropdownElement>
        <DropdownElement>{t('clone_to_other')}</DropdownElement>
      </div>

      <div>
        <DropdownElement>{t('cancel')}</DropdownElement>
        <DropdownElement>{t('reverse')}</DropdownElement>
        <DropdownElement>{t('archive')}</DropdownElement>
        <DropdownElement>{t('delete')}</DropdownElement>
      </div>
    </Dropdown>
  );
}
