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
import ReactQuill from 'react-quill';
import { Card, Element } from '../../../../components/cards';
import { Checkbox, Link, SelectField } from '../../../../components/forms';
import 'react-quill/dist/quill.snow.css';

export function Defaults() {
  const [t] = useTranslation();

  return (
    <>
      <Card title={t('defaults')}>
        <Element leftSide={t('auto_bill')}>
          <SelectField>
            <option defaultChecked></option>
            <option value="enabled">{t('enabled')}</option>
            <option value="enabled_by_default">Enabled by default</option>
            <option value="disabled_by_default">Disabled by default</option>
            <option value="disabled">Disabled</option>
          </SelectField>
        </Element>
        <Element leftSide={t('payment_type')}>
          <SelectField>
            <option value="disabled">PayPal</option>
          </SelectField>
        </Element>
        <Element leftSide={t('payment_terms')}>
          <SelectField>
            <option value=""></option>
            <option value="-1">Net 0</option>
            <option value="7">Net 7</option>
            <option value="10">Net 10</option>
            <option value="14">Net 14</option>
            <option value="15">Net 15</option>
            <option value="30">Net 30</option>
            <option value="60">Net 60</option>
            <option value="90">Net 90</option>
          </SelectField>

          <Link to="/settings/payment_terms" className="block mt-2">
            {t('configure_payment_terms')}
          </Link>
        </Element>
        <Element leftSide={t('quote_valid_until')}>
          <SelectField>
            <option value=""></option>
            <option value="-1">Net 0</option>
            <option value="7">Net 7</option>
            <option value="10">Net 10</option>
            <option value="14">Net 14</option>
            <option value="15">Net 15</option>
            <option value="30">Net 30</option>
            <option value="60">Net 60</option>
            <option value="90">Net 90</option>
          </SelectField>
        </Element>
        <Element leftSide={t('invoice_valid_until')}>
          <SelectField>
            <option value=""></option>
            <option value="-1">Net 0</option>
            <option value="7">Net 7</option>
            <option value="10">Net 10</option>
            <option value="14">Net 14</option>
            <option value="15">Net 15</option>
            <option value="30">Net 30</option>
            <option value="60">Net 60</option>
            <option value="90">Net 90</option>
          </SelectField>
        </Element>

        <div className="pt-6 border-b"></div>

        <Element className="mt-4" leftSide={t('manual_payment_email')}>
          <Checkbox id="manual_payment_email" label={t('email_receipt')} />
        </Element>
        <Element leftSide={t('online_payment_email')}>
          <Checkbox id="online_payment_email" label={t('email_receipt')} />
        </Element>

        <div className="pt-6 border-b"></div>

        <Element className="mt-4" leftSide={t('invoice_terms')}>
          <ReactQuill theme="snow" />
        </Element>
        <Element className="mt-4" leftSide={t('invoice_footer')}>
          <ReactQuill theme="snow" />
        </Element>
        <Element className="mt-4" leftSide={t('quote_terms')}>
          <ReactQuill theme="snow" />
        </Element>
        <Element className="mt-4" leftSide={t('quote_footer')}>
          <ReactQuill theme="snow" />
        </Element>
        <Element className="mt-4" leftSide={t('credit_terms')}>
          <ReactQuill theme="snow" />
        </Element>
        <Element className="mt-4" leftSide={t('credit_footer')}>
          <ReactQuill theme="snow" />
        </Element>
      </Card>
    </>
  );
}
