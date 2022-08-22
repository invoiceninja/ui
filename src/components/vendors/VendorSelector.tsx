/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { GenericSelectorProps } from 'common/interfaces/generic-selector-props';
import { Vendor } from 'common/interfaces/vendor';
import { DebouncedCombobox, Record } from 'components/forms/DebouncedCombobox';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export function VendorSelector(props: GenericSelectorProps<Vendor>) {
  const [t] = useTranslation();
  const navigate = useNavigate();

  return (
    <DebouncedCombobox
      {...props}
      value="id"
      endpoint="/api/v1/vendors"
      label="name"
      defaultValue={props.value}
      onChange={(value: Record<Vendor>) =>
        value.resource && props.onChange(value.resource)
      }
      actionLabel={t('new_vendor')}
      onActionClick={() => navigate('/vendors/create')}
    />
  );
}
