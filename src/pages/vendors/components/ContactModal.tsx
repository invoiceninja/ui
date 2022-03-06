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

type Props = {
  data?: any;
  formik?: any;
  isOpen: any;
  setIsOpen: any;
  index?: any;
};

export function ContactModal(props: Props) {
  const [t] = useTranslation();

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
            onChange={props.formik.handleChange}
            value={props.data.first_name}
          />
        </Element>
        <Element leftSide={t('last_name')}>
          <InputField
            id={`contacts[${props.index}].last_name`}
            onChange={props.formik.handleChange}
            value={props.data.last_name}
          />
        </Element>
        <Element leftSide={t('email')}>
          <InputField
            id={`contacts[${props.index}].email`}
            onChange={props.formik.handleChange}
            value={props.data.email}
          />
        </Element>
        <Element leftSide={t('phone')}>
          <InputField
            id={`contacts[${props.index}].phone`}
            onChange={props.formik.handleChange}
            value={props.data.phone}
          />
        </Element>
        <div className="flex justify-between p-5">
          <Button
            type="minimal"
            onClick={(event: any) => {
              event.preventDefault();
              props.formik.setFieldValue(
                'contacts',
                props.formik.values.contacts.filter(
                  (contact: any) => contact.id !== props.data.id
                )
              );
            }}
          >
            Remove
          </Button>
          <Button
            onClick={(event: any) => {
              event.preventDefault();
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
