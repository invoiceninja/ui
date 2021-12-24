/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios, { AxiosError, AxiosResponse } from 'axios';
import { endpoint } from 'common/helpers';
import { useCompanyChanges } from 'common/hooks/useCompanyChanges';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { defaultHeaders } from 'common/queries/common/headers';
import {
  injectInChanges,
  resetChanges,
  updateChanges,
  updateRecord,
} from 'common/stores/slices/company-users';
import { Divider } from 'components/cards/Divider';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Card, Element } from '../../../components/cards';
import Toggle from '../../../components/forms/Toggle';
import { Settings } from '../../../components/layouts/Settings';

export function ProductSettings() {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const company = useCurrentCompany();
  const companyChanges = useCompanyChanges();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t(
      'product_settings'
    )}`;

    dispatch(injectInChanges({ object: 'company', data: company }));
  }, [company]);

  const handleToggleChange = (id: string, value: boolean) => {
    dispatch(
      updateChanges({
        object: 'company',
        property: id,
        value,
      })
    );
  };

  const onSave = () => {
    toast.loading(t('processing'));

    axios
      .put(
        endpoint('/api/v1/companies/:id', { id: companyChanges.id }),
        companyChanges,
        { headers: defaultHeaders }
      )
      .then((response: AxiosResponse) => {
        dispatch(updateRecord({ object: 'company', data: response.data.data }));

        toast.dismiss();
        toast.success(t('updated_settings'));
      })
      .catch((error: AxiosError) => {
        console.error(error);

        toast.dismiss();
        toast.error(t('error_title'));
      });
  };

  return (
    <Settings
      onSaveClick={onSave}
      onCancelClick={() => dispatch(resetChanges('company'))}
      title={t('product_settings')}
    >
      <Card title={t('Settings')}>
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
          leftSideHelp={t('show_product_cost_help')}
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
