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
import { Card, Element } from '../../../../components/cards';
import { Link, SelectField } from '../../../../components/forms';
import Toggle from '../../../../components/forms/Toggle';
import { useDispatch, useSelector } from 'react-redux';
import { useStaticsQuery } from 'common/queries/statics';
import { ChangeEvent } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { endpoint } from 'common/helpers';
import { useQuery } from 'react-query';
import { RootState } from 'common/stores/store';
import { updateChanges } from 'common/stores/slices/company-users';
import { PaymentTerm } from '../../../../common/interfaces/payment-term';
import { request } from 'common/helpers/request';

export function Defaults() {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const { data: statics } = useStaticsQuery();

  const { data: terms } = useQuery('/api/v1/payment_terms', () =>
    request('GET', endpoint('/api/v1/payment_terms'))
  );

  const companyChanges = useSelector(
    (state: RootState) => state.companyUsers.changes.company
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    dispatch(
      updateChanges({
        object: 'company',
        property: event.target.id,
        value: event.target.value,
      })
    );

  return (
    <>
      {companyChanges?.settings && (
        <Card title={t('defaults')}>
          <Element leftSide={t('auto_bill')}>
            <SelectField
              value={companyChanges?.settings?.auto_bill}
              onChange={handleChange}
              id="settings.auto_bill"
            >
              <option defaultChecked></option>
              <option value="always">{t('enabled')}</option>
              <option value="optout">{t('optout')}</option>
              <option value="optin">{t('optin')}</option>
              <option value="off">{t('disabled')}</option>
            </SelectField>
          </Element>

          <Element leftSide={t('payment_type')}>
            <SelectField
              value={companyChanges?.settings?.payment_type_id}
              onChange={handleChange}
              id="settings.payment_type_id"
            >
              <option value="0"></option>
              {statics?.payment_types.map(
                (type: { id: string; name: string }) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                )
              )}
            </SelectField>
          </Element>

          {terms && (
            <Element leftSide={t('payment_terms')}>
              <SelectField
                value={companyChanges?.settings?.payment_terms}
                id="settings.payment_terms"
                onChange={handleChange}
              >
                <option value=""></option>
                {terms.data.data.map((type: PaymentTerm) => (
                  <option key={type.id} value={type.num_days}>
                    {type.name}
                  </option>
                ))}
              </SelectField>

              <Link to="/settings/payment_terms" className="block mt-2">
                {t('configure_payment_terms')}
              </Link>
            </Element>
          )}

          {terms && (
            <Element leftSide={t('quote_valid_until')}>
              <SelectField
                value={companyChanges?.settings?.valid_until}
                id="settings.valid_until"
                onChange={handleChange}
              >
                <option value=""></option>
                {terms.data.data.map((type: PaymentTerm) => (
                  <option key={type.id} value={type.num_days}>
                    {type.name}
                  </option>
                ))}
              </SelectField>
            </Element>
          )}

          <div className="pt-6 border-b"></div>

          <Element className="mt-6" leftSide={t('manual_payment_email')}>
            <Toggle
              checked={
                companyChanges?.settings?.client_manual_payment_notification
              }
              onChange={(value: boolean) =>
                dispatch(
                  updateChanges({
                    object: 'company',
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
                companyChanges?.settings?.client_online_payment_notification
              }
              onChange={(value: boolean) =>
                dispatch(
                  updateChanges({
                    object: 'company',
                    property: 'settings.client_online_payment_notification',
                    value,
                  })
                )
              }
            />
          </Element>

          <Element leftSide={t('use_quote_terms')}>
            <Toggle
              checked={
                companyChanges?.use_quote_terms_on_conversion
              }
              onChange={(value: boolean) =>
                dispatch(
                  updateChanges({
                    object: 'company',
                    property: 'use_quote_terms_on_conversion',
                    value,
                  })
                )
              }
            />
          </Element>

          <div className="pt-6 border-b"></div>

          <Element className="mt-4" leftSide={t('invoice_terms')}>
            <MDEditor
              value={companyChanges?.settings?.invoice_terms}
              onChange={(value) =>
                dispatch(
                  updateChanges({
                    object: 'company',
                    property: 'settings.invoice_terms',
                    value,
                  })
                )
              }
            />
          </Element>

          <Element className="mt-4" leftSide={t('invoice_footer')}>
            <MDEditor
              value={companyChanges?.settings?.invoice_footer}
              onChange={(value) =>
                dispatch(
                  updateChanges({
                    object: 'company',
                    property: 'settings.invoice_footer',
                    value,
                  })
                )
              }
            />
          </Element>

          <Element className="mt-4" leftSide={t('quote_terms')}>
            <MDEditor
              value={companyChanges?.settings?.quote_terms}
              onChange={(value) =>
                dispatch(
                  updateChanges({
                    object: 'company',
                    property: 'settings.quote_terms',
                    value,
                  })
                )
              }
            />
          </Element>

          <Element className="mt-4" leftSide={t('quote_footer')}>
            <MDEditor
              value={companyChanges?.settings?.quote_footer}
              onChange={(value) =>
                dispatch(
                  updateChanges({
                    object: 'company',
                    property: 'settings.quote_footer',
                    value,
                  })
                )
              }
            />
          </Element>

          <Element className="mt-4" leftSide={t('credit_terms')}>
            <MDEditor
              value={companyChanges?.settings?.credit_terms}
              onChange={(value) =>
                dispatch(
                  updateChanges({
                    object: 'company',
                    property: 'settings.credit_terms',
                    value,
                  })
                )
              }
            />
          </Element>

          <Element className="mt-4" leftSide={t('credit_footer')}>
            <MDEditor
              value={companyChanges?.settings?.credit_footer}
              onChange={(value) =>
                dispatch(
                  updateChanges({
                    object: 'company',
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
