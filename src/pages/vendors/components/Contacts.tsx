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
import { Button } from '@invoiceninja/forms';
import { useTranslation } from 'react-i18next';
import { Contact } from './Contact';

interface Props {
  data: any;
  handleChange: any;
  setFieldValue: any;
  isSubmitting: any;
  handleSubmit: any;
}

export function Contacts(props: Props) {
  const [t] = useTranslation();

  const addNewContact = () => {
    props.data.push({
      archived_at: 0,
      created_at: '',
      custom_value1: '',
      custom_value2: '',
      custom_value3: '',
      custom_value4: '',
      email: '',
      first_name: '',
      id: '',
      is_primary: props.data?.find((contact: any) => {
        return contact.is_primary;
      })
        ? false
        : true,
      last_name: '',
      phone: '',
      updated_at: '',
    });

    props.setFieldValue('contacts', props.data);
  };
  return (
    <Card
      disableSubmitButton={props.isSubmitting}
      onFormSubmit={props.handleSubmit}
      withSaveButton
      title={t('contacts')}
    >
      {props.data &&
        props.data.map((contact: any, index: any) => {
          return (
            <Contact
              data={contact}
              key={index}
              index={index}
              handleChange={props.handleChange}
              setFieldValue={props.setFieldValue}
              formikValues={props.data}
            />
          );
        })}

      <Element>
        <Button type="minimal" behavior="button" onClick={addNewContact}>
          {t('add_contact')}
        </Button>
      </Element>
    </Card>
  );
}
