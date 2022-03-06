/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { InvoiceStatus } from 'common/enums/invoice-status';

import { Plus } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { Invoice } from './Invoice';

type Props = { data?: any; formik?: any };

export function Invoices(props: Props) {
  const [t] = useTranslation();
  return (
    
      <Element leftSide={t('invoices')}>
        {props.data &&
          props.data.map((invoice: any, index: any) => {
            if(invoice.status_id!=InvoiceStatus.Paid)
            return (
              <Invoice
                data={invoice}
                key={index}
                index={index}
                formik={props.formik}
              />
            );
          })}
       
      </Element>
  );
}
