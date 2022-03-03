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

type Props = { data?: any };

export function Details(props: Props) {
  const [t] = useTranslation();

  return (
    <Card title={t('details')} className="mb-5">
      <Element leftSide={t('name')}>
        <InputField></InputField>
      </Element>
      <Element leftSide={t('number')}>
        <InputField></InputField>
      </Element>
      <Element leftSide={t('user')}>
        <InputField></InputField>
      </Element>
      <Element leftSide={t('id_number')}>
        <InputField></InputField>
      </Element>
      <Element leftSide={t('vat_number')}>
        <InputField></InputField>
      </Element>
      <Element leftSide={t('website')}>
        <InputField></InputField>
      </Element>
      <Element leftSide={t('phone')}>
        <InputField></InputField>
      </Element>
    </Card>
  );
}
