/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { Card } from '$app/components/cards';
import { InvoicePaymentAllocationBox } from '../../common/components/InvoicePaymentAllocationBox';
import { getInvoicePaymentAllocationRows } from '../../common/helpers/invoicePaymentAllocations';
import { Context } from '../Edit';

function Payments() {
  const [t] = useTranslation();

  const context: Context = useOutletContext();
  const { invoice } = context;

  const colors = useColorScheme();

  const { dateFormat } = useCurrentCompanyDateFormats();
  const paymentAllocationRows = getInvoicePaymentAllocationRows(invoice);

  return (
    <Card
      title={t('payments')}
      className="shadow-sm"
      style={{ maxHeight: '42.5rem', borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
      withoutBodyPadding
      withScrollableBody
    >
      <div
        className={classNames('flex justify-center w-full px-2 pt-2', {
          'pb-10': paymentAllocationRows.length,
          'pb-6': !paymentAllocationRows.length,
        })}
      >
        <div className="flex flex-col space-y-2 w-full lg:w-2/4">
          {invoice &&
            paymentAllocationRows.map((row) => (
              <InvoicePaymentAllocationBox
                key={row.paymentable.id}
                row={row}
                invoice={invoice}
                dateFormat={dateFormat}
              />
            ))}
        </div>
      </div>
    </Card>
  );
}

export default Payments;
