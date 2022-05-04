/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { SelectField, Textarea } from '@invoiceninja/forms';
import { VendorProps } from 'common/interfaces/vendor-props';
import { useStaticsQuery } from 'common/queries/statics';
import { Alert } from 'components/Alert';
import { useTranslation } from 'react-i18next';

export function AdditionalInfo(props: VendorProps) {
  const [t] = useTranslation();
  const { data: statics } = useStaticsQuery();

  return (
    <Card title={t('additional_info')} className="mb-5">
      {props.errors?.notes && <Alert type="danger">{props.errors.notes}</Alert>}
      <Element leftSide={t('currency')}>
        <SelectField
          value={props.data.currency_id}
          onChange={(event: any) => {
            props.setFieldValue('currency_id', event.target.value);
          }}
        >
          <option value=""></option>
          {statics?.data.currencies.map((element: any, index: any) => {
            return (
              <option value={element.id} key={index}>
                {element.name}
              </option>
            );
          })}
        </SelectField>
      </Element>
      <Element leftSide={t('public_notes')}>
        <Textarea
          id="public_notes"
          onChange={props.handleChange}
          value={props.data.public_notes}
        />
      </Element>
      <Element leftSide={t('private_notes')}>
        <Textarea
          id="private_notes"
          onChange={props.handleChange}
          value={props.data.private_notes}
        />
      </Element>
    </Card>
  );
}
