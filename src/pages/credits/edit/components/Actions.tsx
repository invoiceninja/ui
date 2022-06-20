/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { CreditStatus } from 'common/enums/credit-status';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { useCurrentCredit } from 'pages/credits/common/hooks/useCurrentCredit';
import { useMarkSent } from 'pages/credits/common/hooks/useMarkSent';
import { openClientPortal } from 'pages/invoices/common/helpers/open-client-portal';
import { useDownloadPdf } from 'pages/invoices/common/hooks/useDownloadPdf';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';

export function Actions() {
  const [t] = useTranslation();

  const { id } = useParams();

  const credit = useCurrentCredit();

  const downloadPdf = useDownloadPdf({ resource: 'credit' });
  const markSent = useMarkSent();

  return (
    <Dropdown label={t('more_actions')} className="divide-y">
      <div>
        <DropdownElement to={generatePath('/credits/:id/pdf', { id })}>
          {t('view_pdf')}
        </DropdownElement>

        {credit && (
          <DropdownElement onClick={() => downloadPdf(credit)}>
            {t('download_pdf')}
          </DropdownElement>
        )}

        <DropdownElement to={generatePath('/credits/:id/email', { id })}>
          {t('email_credit')}
        </DropdownElement>

        <DropdownElement onClick={() => credit && openClientPortal(credit)}>
          {t('client_portal')}
        </DropdownElement>
      </div>

      <div>
        <DropdownElement to={generatePath('/credits/:id/clone', { id })}>
          {t('clone_to_credit')}
        </DropdownElement>
      </div>

      {credit && credit.status_id === CreditStatus.Draft && (
        <div>
          <DropdownElement onClick={() => markSent(credit)}>
            {t('mark_sent')}
          </DropdownElement>
        </div>
      )}
    </Dropdown>
  );
}
