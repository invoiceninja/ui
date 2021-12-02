/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../components/cards';
import Toggle from '../../../components/forms/Toggle';
import { Settings } from '../../../components/layouts/Settings';

export function ProductSettings() {
  const [t] = useTranslation();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t(
      'product_settings'
    )}`;
  });

  return (
    <Settings title={t('product_settings')}>
      <Card withSaveButton title={t('Settings')}>
        <Element
          leftSide={t('show_product_discount')}
          leftSideHelp={t('show_product_discount_help')}
          pushContentToRight
        >
          <Toggle />
        </Element>
        <Element
          leftSide={t('show_product_cost')}
          leftSideHelp={t('show_product_cost_help')}
          pushContentToRight
        >
          <Toggle />
        </Element>
        <Element
          leftSide={t('show_product_quantity')}
          leftSideHelp={t('show_product_quantity_help')}
          pushContentToRight
        >
          <Toggle />
        </Element>
        <Element
          leftSide={t('default_quantity')}
          leftSideHelp={t('default_quantity_help')}
          pushContentToRight
        >
          <Toggle />
        </Element>

        <div className="py-4 border-b"></div>

        <Element
          className="mt-4"
          leftSide={t('fill_products')}
          leftSideHelp={t('fill_products_help')}
          pushContentToRight
        >
          <Toggle />
        </Element>
        <Element
          leftSide={t('update_products')}
          leftSideHelp={t('update_products_help')}
          pushContentToRight
        >
          <Toggle />
        </Element>
        <Element
          leftSide={t('convert_products')}
          leftSideHelp={t('convert_products_help')}
          pushContentToRight
        >
          <Toggle />
        </Element>
      </Card>
    </Settings>
  );
}
