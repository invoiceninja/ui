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
import { Link, SelectField } from '../../../../components/forms';
import 'react-quill/dist/quill.snow.css';
import Toggle from '../../../../components/forms/Toggle';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'common/stores/store';
import { useStaticsQuery } from 'common/queries/statics';
import { updateChanges } from 'common/stores/slices/company';
import { ChangeEvent } from 'react';

export function Defaults() {
  const [t] = useTranslation();
  const company = useSelector((state: RootState) => state.company);
  const { data } = useStaticsQuery();
  const dispatch = useDispatch();

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    dispatch(
      updateChanges({ property: event.target.id, value: event.target.value })
    );
  }

  return (
    <>
      {company.current?.company?.settings && (
        <Card title={t('defaults')}>
          <Element leftSide={t('auto_bill')}>
            <SelectField
              onChange={handleChange}
              id="settings.auto_bill"
              value={company.current.company.settings.auto_bill}
            >
              <option defaultChecked></option>
              <option value="always">{t('enabled')}</option>
              <option value="optout">{t('enabled_by_default')}</option>
              <option value="optin">{t('disabled_by_default')}</option>
              <option value="disabled">{t('disabled')}</option>
            </SelectField>
          </Element>
          <Element leftSide={t('payment_type')}>
            <SelectField
              onChange={handleChange}
              id="settings.payment_type_id"
              value={company.current.company.settings.payment_type_id}
            >
              <option value="0"></option>
              {data?.data.payment_types.map(
                (type: { id: string; name: string }) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                )
              )}
            </SelectField>
          </Element>
          <Element leftSide={t('payment_terms')}>
            <SelectField
              id="settings.payment_terms"
              onChange={handleChange}
              value={company.current.company.settings.payment_terms}
            >
              <option value=""></option>
              <option value="0">Net 0</option>
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
            <SelectField
              id="settings.valid_until"
              onChange={handleChange}
              value={company.current.company.settings.valid_until}
            >
              <option value=""></option>
              <option value="0">Net 0</option>
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

          <Element className="mt-6" leftSide={t('manual_payment_email')}>
            <Toggle
              checked={
                company.current.company.settings
                  .client_manual_payment_notification
              }
              onChange={(value: boolean) =>
                dispatch(
                  updateChanges({
                    property: 'settings.client_manual_payment_notification',
                    value,
                  })
                )
              }
            />
          </Element>
          <Element leftSide={t('online_payment_email')}>
            <Toggle
              checked={
                company.current.company.settings
                  .client_online_payment_notification
              }
              onChange={(value: boolean) =>
                dispatch(
                  updateChanges({
                    property: 'settings.client_online_payment_notification',
                    value,
                  })
                )
              }
            />
          </Element>

          <div className="pt-6 border-b"></div>

          <Element className="mt-4" leftSide={t('invoice_terms')}>
            <ReactQuill
              theme="snow"
              value={company.current.company.settings.invoice_terms}
              onChange={(value: string) =>
                dispatch(
                  updateChanges({
                    property: 'settings.invoice_terms',
                    value,
                  })
                )
              }
            />
          </Element>
          <Element className="mt-4" leftSide={t('invoice_footer')}>
            <ReactQuill
              theme="snow"
              value={company.current.company.settings.invoice_footer}
              onChange={(value: string) =>
                dispatch(
                  updateChanges({
                    property: 'settings.invoice_footer',
                    value,
                  })
                )
              }
            />
          </Element>
          <Element className="mt-4" leftSide={t('quote_terms')}>
            <ReactQuill
              theme="snow"
              value={company.current.company.settings.quote_terms}
              onChange={(value: string) =>
                dispatch(
                  updateChanges({
                    property: 'settings.quote_terms',
                    value,
                  })
                )
              }
            />
          </Element>
          <Element className="mt-4" leftSide={t('quote_footer')}>
            <ReactQuill
              theme="snow"
              value={company.current.company.settings.quote_footer}
              onChange={(value: string) =>
                dispatch(
                  updateChanges({
                    property: 'settings.quote_footer',
                    value,
                  })
                )
              }
            />
          </Element>
          <Element className="mt-4" leftSide={t('credit_terms')}>
            <ReactQuill
              theme="snow"
              value={company.current.company.settings.credit_terms}
              onChange={(value: string) =>
                dispatch(
                  updateChanges({
                    property: 'settings.credit_terms',
                    value,
                  })
                )
              }
            />
          </Element>
          <Element className="mt-4" leftSide={t('credit_footer')}>
            <ReactQuill
              theme="snow"
              value={company.current.company.settings.credit_footer}
              onChange={(value: string) =>
                dispatch(
                  updateChanges({
                    property: 'settings.credit_footer',
                    value,
                  })
                )
              }
            />
          </Element>
        </Card>
      )}
    </>
  );
}
