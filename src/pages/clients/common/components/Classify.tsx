/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { SelectField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { ClientContext } from '../../edit/Edit';
import { useOutletContext } from 'react-router-dom';
import { useStaticsQuery } from '$app/common/queries/statics';
import { Client } from '$app/common/interfaces/client';

export default function Classify() {
  const [t] = useTranslation();

  const context: ClientContext = useOutletContext();

  const { client, errors, setClient } = context;

  const { data: statics } = useStaticsQuery();

  const handleChange = <T extends keyof Client>(
    property: T,
    value: Client[typeof property]
  ) => {
    setClient((client) => client && { ...client, [property]: value });
  };

  return (
    <Card title={t('classify')}>
      {statics && (
        <Element leftSide={t('size_id')}>
          <SelectField
            id="size_id"
            value={client?.size_id || ''}
            onValueChange={(value) => handleChange('size_id', value)}
            errorMessage={errors?.errors.size_id}
            withBlank
            customSelector
          >
            {statics?.sizes.map(
              (size: { id: string; name: string }, index: number) => (
                <option key={index} value={size.id}>
                  {size.name}
                </option>
              )
            )}
          </SelectField>
        </Element>
      )}

      {statics && (
        <Element leftSide={t('industry')}>
          <SelectField
            id="industry_id"
            value={client?.industry_id || ''}
            errorMessage={errors?.errors.industry_id}
            onValueChange={(value) => handleChange('industry_id', value)}
            withBlank
            customSelector
          >
            {statics?.industries.map(
              (size: { id: string; name: string }, index: number) => (
                <option key={index} value={size.id}>
                  {size.name}
                </option>
              )
            )}
          </SelectField>
        </Element>
      )}
    </Card>
  );
}
