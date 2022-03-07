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
      <div className="space-y-4">
        <InputField
          label={t('first_name')}
          id={`contacts[${props.index}].first_name`}
          onChange={props.handleChange}
          value={props.contact.first_name}
        />

        <InputField
          label={t('last_name')}
          id={`contacts[${props.index}].last_name`}
          onChange={props.handleChange}
          value={props.contact.last_name}
        />

        <InputField
          label={t('email_address')}
          id={`contacts[${props.index}].email`}
          onChange={props.handleChange}
          value={props.contact.email}
        />

        <InputField
          label={t('phone')}
          id={`contacts[${props.index}].phone`}
          onChange={props.handleChange}
          value={props.contact.phone}
        />

        <div className="flex justify-between items-center">
          <Button behavior="button" type="minimal" onClick={removeContact}>
            Remove
          </Button>

          <Button
            behavior="button"
            onClick={() => {
              props.setIsOpen(false);
            }}
          >
            {t('save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
