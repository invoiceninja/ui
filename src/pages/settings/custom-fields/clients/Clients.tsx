/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { Field } from '../components/Field';
import { useHandleCustomFieldChange } from '$app/common/hooks/useHandleCustomFieldChange';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { Divider } from '$app/components/cards/Divider';
import { useColorScheme } from '$app/common/colors';

export function Clients() {
  useTitle('custom_fields');

  const [t] = useTranslation();

  const colors = useColorScheme();
  const company = useCompanyChanges();

  const handleChange = useHandleCustomFieldChange();

  if (!company) {
    return null;
  }

  return (
    <div className="px-4 sm:px-6">
      {['client1', 'client2', 'client3', 'client4'].map((field) => (
        <Field
          key={field}
          field={field}
          placeholder={t('client_field')}
          onChange={(value) => handleChange(field, value)}
          initialValue={company.custom_fields[field]}
          withArrowAsSeparator
        />
      ))}

      <div className="py-4">
        <Divider
          className="border-dashed"
          borderColor={colors.$20}
          withoutPadding
        />
      </div>

      {['contact1', 'contact2', 'contact3', 'contact4'].map((field) => (
        <Field
          key={field}
          field={field}
          placeholder={t('contact_field')}
          onChange={(value) => handleChange(field, value)}
          initialValue={company.custom_fields[field]}
          withArrowAsSeparator
        />
      ))}
    </div>
  );
}
