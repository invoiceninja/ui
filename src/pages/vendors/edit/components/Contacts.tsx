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
import { useState } from 'react';

import { Plus } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { Contact } from './Contact';

type Props = { data?: any; onChange?: any; formik?: any };

export function Contacts(props: Props) {
  const [data, setdata] = useState(props.data);
  const [t] = useTranslation();
  return (
    <Card title={t('contacts')} className="mb-5">
      <Element leftSide={t('contacts')}>
        {console.log(data)}{' '}
        {props.data &&
          props.data.map((contact: any, index: any) => {
            return (
              <Contact
                data={contact}
                key={index}
                index={index}
                onChange={props.onChange}
                formik={props.formik}
              />
            );
          })}
        <button
          className="w-full py-2 inline-flex justify-center items-center space-x-2"
          onClick={(event: any) => {
            event.preventDefault();
            console.log('1');
           props.data.push({
              archived_at: 0,
              created_at: Date.now().toString(),
              custom_value1: '',
              custom_value2: '',
              custom_value3: '',
              custom_value4: '',
              email: '',
              first_name: t('new'),
              id: '',
              is_primary: false,
              last_name: t('contact'),
              phone: '',
              updated_at: Date.now().toString(),
            });
            console.log('2');
            console.log('3');
            props.formik.setFieldValue('contacts', props.data);
            console.log('state:',props.data);

            // console.log("data",props.data);
            // console.log({
            // archived_at: 0,
            // created_at: Date.now(),
            // custom_value1: '',
            // custom_value2: '',
            // custom_value3: '',
            // custom_value4: '',
            // email: 'elias.cummings@example.org',
            // first_name: 'Annabel',
            // id: 'LDdwj2Rb1Y',
            // is_primary: true,
            // last_name: 'Brown',
            // phone: '+12676475991',
            // updated_at: Date.now(),
            // });
          }}
        >
          <Plus size={18} />
          <span>{t('add_item')}</span>
        </button>
      </Element>
    </Card>
  );
}
