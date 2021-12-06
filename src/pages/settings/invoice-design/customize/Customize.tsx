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
import { Card, ClickableElement, Element } from '../../../../components/cards';
import { InputField, SelectField } from '../../../../components/forms';
import Toggle from '../../../../components/forms/Toggle';
import { Default } from '../../../../components/layouts/Default';
import { Tabs } from './components';

export function Customize() {
  const [t] = useTranslation();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t(
      'customize_and_preview'
    )}`;
  });

  return (
    <Default title={t('invoice_design')}>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-5">
          <Tabs />

          <div className="my-4">
            <Card>
              <Element leftSide={t('name')}>
                <InputField id="name" />
              </Element>
              <Element leftSide={t('design')}>
                <SelectField>
                  <option value="clean">Clean</option>
                </SelectField>
              </Element>
              <Element
                leftSide={t('html_mode')}
                leftSideHelp="Preview updates faster but with less accuracy."
              >
                <Toggle />
              </Element>
              <ClickableElement href="https://invoiceninja.github.io/docs/custom-fields/">
                {t('view_docs')}
              </ClickableElement>
            </Card>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-7">
          <iframe
            src="http://www.africau.edu/images/default/sample.pdf"
            frameBorder={0}
            style={{ minWidth: '100%', minHeight: '85vh' }}
          ></iframe>
        </div>
      </div>
    </Default>
  );
}
