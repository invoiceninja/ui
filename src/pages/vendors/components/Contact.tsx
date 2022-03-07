/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Element } from '@invoiceninja/cards';
import { Button } from '@invoiceninja/forms';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContactModal } from './ContactModal';

interface Props {
  data: any;
  index: any;
  formikValues: any;
  handleChange?: any;
  setFieldValue?: any;
}

export function Contact(props: Props) {
  const [isOpen, setisOpen] = useState(false);
  const [t] = useTranslation();

  return (
    <>
      <Element
        leftSide={
          !props.data.first_name || !props.data.first_name
            ? t('blank_contact')
            : props.data.first_name + ' ' + props.data.last_name
        }
        leftSideHelp={props.data.email}
      >
        <Button
          behavior="button"
          type="minimal"
          onClick={() => {
            setisOpen(!isOpen);
          }}
        >
          {t('view')}
        </Button>
      </Element>

      <ContactModal
        isOpen={isOpen}
        setIsOpen={setisOpen}
        contact={props.data}
        index={props.index}
        formikValues={props.formikValues}
        handleChange={props.handleChange}
        setFieldValue={props.setFieldValue}
      />
    </>
  );
}
