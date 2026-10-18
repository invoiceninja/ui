/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { MdSend, MdWarning } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { CreditStatus } from '$app/common/enums/credit-status';
import { InvoiceStatus } from '$app/common/enums/invoice-status';
import {
  Classification,
  PEPPOL_CLASSIFICATIONS,
  PEPPOL_COUNTRIES,
} from '$app/common/helpers/peppol-countries';
import { route } from '$app/common/helpers/route';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { Credit } from '$app/common/interfaces/credit';
import { Invoice } from '$app/common/interfaces/invoice';
import { Tooltip } from '$app/components/Tooltip';

interface Props {
  entity: 'invoice' | 'credit';
  resource: Invoice | Credit;
}

export function PeppolSendingStatus({ entity, resource }: Props) {
  const [t] = useTranslation();

  const navigate = useNavigate();
  const reactSettings = useReactSettings();
  const currentCompany = useCurrentCompany();

  const isPeppolEnabled =
    !reactSettings?.preferences?.hide_peppol_sent_status &&
    currentCompany.settings.e_invoice_type === 'PEPPOL' &&
    PEPPOL_COUNTRIES.includes(resource.client?.country_id || '') &&
    PEPPOL_CLASSIFICATIONS[
      resource.client?.country_id as keyof typeof PEPPOL_CLASSIFICATIONS
    ]?.includes(
      (resource.client?.classification || 'business') as Classification
    );

  const isDraft =
    resource.status_id ===
    (entity === 'invoice' ? InvoiceStatus.Draft : CreditStatus.Draft);

  if (!isPeppolEnabled) {
    return null;
  }

  if (resource.backup?.guid) {
    return (
      <Tooltip
        message={t('peppol_sending_success') as string}
        width="auto"
        placement="top"
      >
        <MdSend
          color="#22c55e"
          size={18}
          style={{ transform: 'rotate(-45deg)' }}
        />
      </Tooltip>
    );
  }

  if (isDraft || resource.is_deleted || resource.archived_at) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        navigate(route(`/${entity}s/:id/e_invoice`, { id: resource.id }));
      }}
    >
      <Tooltip
        message={t('peppol_sending_failed') as string}
        width="auto"
        placement="top"
      >
        <MdWarning color="red" size={20} />
      </Tooltip>
    </button>
  );
}
