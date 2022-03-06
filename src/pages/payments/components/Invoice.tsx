/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '@invoiceninja/cards';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContactModal } from './InvoiceModal';

type Props = {
  data?: any;
  index?: any;
  formik?: any;
};

export function Invoice(props: Props) {
  const [isOpen, setisOpen] = useState(false);
  const [t] = useTranslation();

  return (
    <>
      <Card className="my-3">
        <div
          className="flex flex-col justify-center items-start p-5 hover:bg-gray-300 hover:rounded"
          onClick={() => {
            setisOpen(!isOpen);
          }}
        >
          <p>
          
           
              {t('invoice_number')+" "+ props.data.number  }
          </p>
          <p>{t('amount')+" "+props.data.amount}</p>
        </div>
        <ContactModal
          isOpen={isOpen}
          setIsOpen={setisOpen}
          data={props.data}
          index={props.index}
          formik={props.formik}
        />
      </Card>
    </>
  );
}
