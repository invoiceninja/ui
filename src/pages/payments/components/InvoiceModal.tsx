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
import { Card, Element } from '@invoiceninja/cards';
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
      <Card>
        
        <Element leftSide={t('invoice_number')}>
          <InputField
            id={`invoices[${props.index}].invoice_number`}
            onChange={props.formik.handleChange}
            value={props.data.number}
          />
        </Element>
        <Element leftSide={t('amount')}>
          <InputField
            id={`invoices[${props.index}].amount`}
            onChange={props.formik.handleChange}
            value={props.data.amount}
          />
        </Element>
        
        <div className="flex justify-between">
          <Button
            type="minimal"
            onClick={(event: any) => {
              event.preventDefault();
              props.formik.setFieldValue(
                'invoices',
                props.formik.values.invoices.filter(
                  (invoice: any) => invoice.id !== props.data.id
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
      </Card>
    </Modal>
  );
}
