/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Invoice } from '$app/common/interfaces/invoice';
import { creditAtom } from '$app/pages/credits/common/atoms';
import { buildPeppolCreditNote } from '../../common/helpers/credit-note';

export function useCreatePeppolCreditNote() {
  const navigate = useNavigate();
  const company = useCurrentCompany();
  const setCredit = useSetAtom(creditAtom);

  return (invoice: Invoice) => {
    setCredit(
      buildPeppolCreditNote(invoice, company?.settings.credit_design_id)
    );

    navigate('/credits/create?action=clone');
  };
}
