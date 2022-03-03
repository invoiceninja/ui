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
import { Textarea } from '@invoiceninja/forms';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';

type Props = { data?: any };

export function AdditionalInfo(props: Props) {
  const [t] = useTranslation();

  return (
    <Card title={t('additional_info')} className="mb-5">
      <Element leftSide={t('currency')}>
        <Select value={props.data.curreny_id} />
      </Element>
      <Element leftSide={t('public_notes')}>
        <Textarea value={props.data.public_notes}></Textarea>
      </Element>
      <Element leftSide={t('private_notes')}>
        <Textarea value={props.data.private_notes}></Textarea>
      </Element>
    </Card>
  );
}
