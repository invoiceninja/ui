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
import { useTranslation } from 'react-i18next';

type Props = { data?: any; onChange?: any };

export function Details(props: Props) {
  const [t] = useTranslation();

  return (
    <Card title={t('details')} className="mb-5">
      <Element leftSide={t('name')}>
        <InputField
          id="name"
          onChange={props.onChange}
          value={props.data.name}
        />
      </Element>
      <Element leftSide={t('number')}>
        <InputField
          id="name"
          onChange={props.onChange}
          value={props.data.number}
        />
      </Element>
      <Element leftSide={t('user')}>
        <InputField
          id="user"
          onChange={props.onChange}
          value={props.data.user}
        />
      </Element>
      <Element leftSide={t('id_number')}>
        <InputField
          id="id_number"
          onChange={props.onChange}
          value={props.data.id_number}
        />
      </Element>
      <Element leftSide={t('vat_number')}>
        <InputField
          id="vat_number"
          onChange={props.onChange}
          value={props.data.vat_number}
        />
      </Element>
      <Element leftSide={t('website')}>
        <InputField
          id="website"
          onChange={props.onChange}
          value={props.data.website}
        />
      </Element>
      <Element leftSide={t('phone')}>
        <InputField
          id="phone"
          onChange={props.onChange}
          value={props.data.phone}
        />
      </Element>
    </Card>
  );
}
