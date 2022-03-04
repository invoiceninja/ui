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
import { InputField } from '@invoiceninja/forms';
import { Modal } from 'components/Modal';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = { data?: any; onChange?: any };

export function Contact(props: Props) {
  const [isOpen, setisOpen] = useState(false);
  const [t] = useTranslation();

  return (
    <>
      {' '}
      <Card>
        <div
          className="flex flex-col justify-center items-start p-5 hover:bg-gray-300 hover:rounded"
          onClick={() => {
            setisOpen(!isOpen);
          }}
        >
          <p>
            {props.data.first_name}
            {props.data.last_name}
          </p>
          <p>{props.data.email}</p>
        </div>
      </Card>
      <Modal
        visible={isOpen}
        title={t('new_contact')}
        onClose={() => {
          setisOpen(!isOpen);
        }}
      >
        <Element leftSide={t('first_name')}>
          <InputField
            id="phone"
            onChange={props.onChange}
            value={props.data.first_name}
          />
        </Element>
        <Element leftSide={t('last_name')}>
          <InputField
            id="phone"
            onChange={props.onChange}
            value={props.data.last_name}
          />
        </Element>
        <Element leftSide={t('email')}>
          <InputField
            id="phone"
            onChange={props.onChange}
            value={props.data.email}
          />
        </Element>
        <Element leftSide={t('phone')}>
          <InputField
            id="phone"
            onChange={props.onChange}
            value={props.data.phone}
          />
        </Element>
      </Modal>
    </>
  );
}
