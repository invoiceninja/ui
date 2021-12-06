/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Element } from '../../../../components/cards';
import { InputField, SelectField } from '../../../../components/forms';

export function Field(props: { placeholder: string; id: string }) {
  const [t] = useTranslation();

  return (
    <Element
      leftSide={<InputField id={props.id} placeholder={props.placeholder} />}
    >
      <SelectField>
        <option value="single_line_text">{t('single_line_text')}</option>
        <option value="multi_line_text">{t('multi_line_text')}</option>
        <option value="switch">{t('switch')}</option>
        <option value="dropdown">{t('dropdown')}</option>
        <option value="date">{t('date')}</option>
      </SelectField>
    </Element>
  );
}
