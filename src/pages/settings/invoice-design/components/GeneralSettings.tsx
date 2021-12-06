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
import { Card, ClickableElement, Element } from '../../../../components/cards';
import { SelectField } from '../../../../components/forms';
import Toggle from '../../../../components/forms/Toggle';

export function GeneralSettings() {
  const [t] = useTranslation();

  return (
    <Card title={t('general_settings')}>
      <ClickableElement to="/settings/invoice_design/customize">
        {t('customize_and_preview')}
      </ClickableElement>

      <div className="pt-4 border-b"></div>

      <Element className="mt-4" leftSide={t('invoice_design')}>
        <SelectField>
          <option value="modern">Modern</option>
        </SelectField>
      </Element>

      <Element leftSide={t('quote_design')}>
        <SelectField>
          <option value="modern">Modern</option>
        </SelectField>
      </Element>

      <Element leftSide={t('credit_design')}>
        <SelectField>
          <option value="modern">Modern</option>
        </SelectField>
      </Element>

      <Element leftSide={t('page_layout')}>
        <SelectField>
          <option value="portait">{t('portait')}</option>
          <option value="landscape">{t('landscape')}</option>
        </SelectField>
      </Element>

      <Element leftSide={t('page_size')}>
        <SelectField>
          <option value="a4">A4</option>
        </SelectField>
      </Element>

      <Element leftSide={t('font_size')}>
        <SelectField>
          <option value="9">9</option>
        </SelectField>
      </Element>

      <div className="pt-4 border-b"></div>

      <Element className="mt-4" leftSide={t('primary_font')}>
        <SelectField>
          <option value="roboto">Roboto</option>
        </SelectField>
      </Element>

      <Element leftSide={t('secondary_font')}>
        <SelectField>
          <option value="roboto">Roboto</option>
        </SelectField>
      </Element>

      <Element leftSide={t('primary_color')}>
        <input type="color" />
      </Element>

      <Element leftSide={t('secondary_color')}>
        <input type="color" />
      </Element>

      <div className="pt-4 border-b"></div>

      <Element className="mt-4" leftSide={t('show_empty_columns')}>
        <Toggle />
      </Element>
    </Card>
  );
}
