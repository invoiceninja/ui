/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCompanyChanges } from 'common/hooks/useCompanyChanges';
import { useInjectCompanyChanges } from 'common/hooks/useInjectCompanyChanges';
import { useTitle } from 'common/hooks/useTitle';
import { updateChanges } from 'common/stores/slices/company-users';
import { Divider } from 'components/cards/Divider';
import { InputField } from 'components/forms/InputField';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Card, Element } from '../../../components/cards';
import Toggle from '../../../components/forms/Toggle';
import { Settings } from '../../../components/layouts/Settings';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';

export function ProductSettings() {
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('product_settings'), href: '/settings/product_settings' },
  ];

  useInjectCompanyChanges();
  useTitle('product_settings');

  const dispatch = useDispatch();

  const companyChanges = useCompanyChanges();

  const handleToggleChange = (id: string, value: boolean) => {
    dispatch(
      updateChanges({
        object: 'company',
        property: id,
        value,
      })
    );
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    dispatch(
      updateChanges({
        object: 'company',
        property: event.target.id,
        value: event.target.value,
      })
  );

  const onSave = useHandleCompanySave();
  const onCancel = useDiscardChanges();

  return (
    <Settings
      onSaveClick={onSave}
      onCancelClick={onCancel}
      title={t('product_settings')}
      breadcrumbs={pages}
      docsLink="docs/basic-settings/#product_settings"
    >
      <Card title={t('Settings')}>

        <Element
          leftSide={t('track_inventory')}
          leftSideHelp={t('track_inventory_help')}
        >
          <Toggle
            checked={companyChanges?.track_inventory}
            onChange={(value: boolean) =>
              handleToggleChange('track_inventory', value)
            }
          />
        </Element>
        <Element
          leftSide={t('stock_notifications')}
          leftSideHelp={t('stock_notifications_help')}
        >
          <Toggle
            checked={companyChanges?.stock_notification}
            onChange={(value: boolean) =>
              handleToggleChange('stock_notification', value)
            }
          />
        </Element>
        {companyChanges?.stock_notification === true ?
          <>
          <Element leftSide={t('notification_threshold')}>
            <InputField
              id="inventory_notification_threshold"
              onChange={handleChange}
              value={companyChanges?.inventory_notification_threshold || ''}
            />
          </Element>
        </> : ''
        }

        <Divider />

        <Element
          leftSide={t('show_product_discount')}
          leftSideHelp={t('show_product_discount_help')}
        >
          <Toggle
            checked={companyChanges?.enable_product_discount}
            onChange={(value: boolean) =>
              handleToggleChange('enable_product_discount', value)
            }
          />
        </Element>
        <Element
          leftSide={t('show_product_cost')}
          leftSideHelp={t('show_cost_help')}
        >
          <Toggle
            checked={companyChanges?.enable_product_cost}
            onChange={(value: boolean) =>
              handleToggleChange('enable_product_cost', value)
            }
          />
        </Element>
        <Element
          leftSide={t('show_product_quantity')}
          leftSideHelp={t('show_product_quantity_help')}
        >
          <Toggle
            checked={companyChanges?.enable_product_quantity}
            onChange={(value: boolean) =>
              handleToggleChange('enable_product_quantity', value)
            }
          />
        </Element>
        <Element
          leftSide={t('default_quantity')}
          leftSideHelp={t('default_quantity_help')}
        >
          <Toggle
            checked={companyChanges?.default_quantity}
            onChange={(value: boolean) =>
              handleToggleChange('default_quantity', value)
            }
          />
        </Element>

        <Divider />

        <Element
          leftSide={t('fill_products')}
          leftSideHelp={t('fill_products_help')}
        >
          <Toggle
            checked={companyChanges?.fill_products}
            onChange={(value: boolean) =>
              handleToggleChange('fill_products', value)
            }
          />
        </Element>
        <Element
          leftSide={t('update_products')}
          leftSideHelp={t('update_products_help')}
        >
          <Toggle
            checked={companyChanges?.update_products}
            onChange={(value: boolean) =>
              handleToggleChange('update_products', value)
            }
          />
        </Element>
        <Element
          leftSide={t('convert_products')}
          leftSideHelp={t('convert_products_help')}
        >
          <Toggle
            checked={companyChanges?.convert_products}
            onChange={(value: boolean) =>
              handleToggleChange('convert_products', value)
            }
          />
        </Element>
      </Card>
    </Settings>
  );
}
