/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Modal } from 'components/Modal';
import { useTranslation } from 'react-i18next';
import { Element } from '@invoiceninja/cards';
import { Button, InputField } from '@invoiceninja/forms';

interface Props {
  contact?: any;
  formikValues?: any;
  handleChange?: any;
  setFieldValue?: any;
  isOpen: any;
  setIsOpen: any;
  index?: any;
}

export function ContactModal(props: Props) {
  const [t] = useTranslation();
  const removeContact = () => {
    props.setFieldValue(
      'contacts',
      props.formikValues.filter(
        (contact: any) => contact.id !== props.contact.id
      )
    );
  };
  return (
    <Modal
      visible={props.isOpen}
      title={t('contact')}
      onClose={() => {
        props.setIsOpen(!props.isOpen);
      }}
    >
      <div>
        <Element leftSide={t('first_name')}>
          <InputField
            id={`contacts[${props.index}].first_name`}
            onChange={props.handleChange}
            value={props.contact.first_name}
          />
        </Element>
        <Element leftSide={t('last_name')}>
          <InputField
            id={`contacts[${props.index}].last_name`}
            onChange={props.handleChange}
            value={props.contact.last_name}
          />
        </Element>
        <Element leftSide={t('email')}>
          <InputField
            id={`contacts[${props.index}].email`}
            onChange={props.handleChange}
            value={props.contact.email}
          />
        </Element>
        <Element leftSide={t('phone')}>
          <InputField
            id={`contacts[${props.index}].phone`}
            onChange={props.handleChange}
            value={props.contact.phone}
          />
        </Element>
        <div className="flex justify-between p-5">
          <Button behavior="button" type="minimal" onClick={removeContact}>
            Remove
          </Button>
          <Button
            behavior="button"
            onClick={() => {
              props.setIsOpen(false);
            }}
          >
            {t('ok')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
