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
import { ContactModal } from './ContactModal';

type Props = {
  data?: any;
  onChange?: any;
  formikUpdateField?: any;
  index?: any;
  formik?: any;
};

export function Contact(props: Props) {
  const [isOpen, setisOpen] = useState(false);

  return (
    <>
      {' '}
      <Card className="my-3">
        <div
          className="flex flex-col justify-center items-start p-5 hover:bg-gray-300 hover:rounded"
          onClick={() => {
            setisOpen(!isOpen);
          }}
        >
          <p>{props.data.first_name + ' ' + props.data.last_name}</p>
          <p>{props.data.email}</p>
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
