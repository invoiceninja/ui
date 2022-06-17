/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { useCreditQuery } from 'common/queries/credits';
import {
  dismissCurrentCredit,
  toggleCurrentCreditInvitation,
} from 'common/stores/slices/credits';
import { setCurrentCredit } from 'common/stores/slices/credits/extra-reducers/set-current-credit';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { ClientSelector } from 'pages/invoices/common/components/ClientSelector';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { generatePath, useParams } from 'react-router-dom';
import { CreditDetails } from '../common/components/CreditDetails';
import { useCurrentCredit } from '../common/hooks/useCurrentCredit';
import { useInvoiceSum } from '../common/hooks/useInvoiceSum';
import { useSetCurrentCreditProperty } from '../common/hooks/useSetCurrentCreditProperty';

export function Edit() {
  const { documentTitle } = useTitle('edit_credit');
  const { id } = useParams();
  const { data: credit } = useCreditQuery({ id });

  const [t] = useTranslation();
  const dispatch = useDispatch();
  const handleChange = useSetCurrentCreditProperty();

  const handleSave = () => {};

  const currentCredit = useCurrentCredit();
  const invoiceSum = useInvoiceSum();

  const pages: BreadcrumRecord[] = [
    { name: t('credits'), href: '/credits' },
    {
      name: t('edit_credit'),
      href: generatePath('/credits/:id/edit', { id }),
    },
  ];

  useEffect(() => {
    if (credit?.data.data) {
      dispatch(setCurrentCredit(credit.data.data));
    }

    return () => {
      dispatch(dismissCurrentCredit());
    };
  }, [credit]);

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <div className="grid grid-cols-12 gap-4">
        {currentCredit && (
          <ClientSelector
            resource={currentCredit}
            readonly
            onChange={(id) => handleChange('client_id', id)}
            onClearButtonClick={() => handleChange('client_id', '')}
            onContactCheckboxChange={(contactId, value) =>
              dispatch(
                toggleCurrentCreditInvitation({ contactId, checked: value })
              )
            }
          />
        )}

        <CreditDetails />
      </div>
    </Default>
  );
}
