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

export function AdditionalInfo(props: Props) {
  const [t] = useTranslation();

  return (
    <Card title={t('additional_info')} className="mb-5">
      <Element leftSide={t('currency')}>
        <InputField></InputField>
      </Element>
      <Element leftSide={t('public_notes')}>
        <InputField></InputField>
      </Element>
      <Element leftSide={t('private_notes')}>
        <InputField></InputField>
      </Element>
    </Card>
  );
}
