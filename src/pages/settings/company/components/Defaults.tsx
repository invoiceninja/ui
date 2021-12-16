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
import { Card, Element } from '../../../../components/cards';
import { Link, SelectField } from '../../../../components/forms';
import Toggle from '../../../../components/forms/Toggle';
import { useDispatch } from 'react-redux';
import { useStaticsQuery } from 'common/queries/statics';
import { updateChanges } from 'common/stores/slices/company';
import { ChangeEvent } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { endpoint } from 'common/helpers';
import { useQuery } from 'react-query';
import axios from 'axios';
import { defaultHeaders } from 'common/queries/common/headers';

export function Defaults() {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const company = useCurrentCompany();
  const statics = useStaticsQuery();

  const { data: terms, isLoading } = useQuery('/api/v1/paymen_terms', () =>
    axios.get(endpoint('/api/v1/payment_terms'), { headers: defaultHeaders })
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    dispatch(
      updateChanges({ property: event.target.id, value: event.target.value })
    );

  return (
    <>
      {company?.settings && (
        <Card title={t('defaults')}>
          <Element leftSide={t('auto_bill')}>
            <SelectField
              onChange={handleChange}
              id="settings.auto_bill"
              value={company.settings.auto_bill}
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
              value={company.settings.payment_type_id}
            >
              <option value="0"></option>
              {statics.data?.data.payment_types.map(
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
                id="settings.payment_terms"
                onChange={handleChange}
                value={company.settings.payment_terms}
              >
                <option value=""></option>
                {terms.data.data.map((type: { id: string; name: string }) => (
                  <option key={type.id} value={type.id}>
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
                id="settings.valid_until"
                onChange={handleChange}
                value={company.settings.valid_until}
              >
                <option value=""></option>
                {terms.data.data.map(
                  (type: { id: string; name: string }) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  )
                )}
              </SelectField>
            </Element>
          )}

          <div className="pt-6 border-b"></div>

          <Element className="mt-6" leftSide={t('manual_payment_email')}>
            <Toggle
              checked={company.settings.client_manual_payment_notification}
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
              checked={company.settings.client_online_payment_notification}
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
            <MDEditor
              value={company.settings.invoice_terms}
              onChange={(value) =>
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
            <MDEditor
              value={company.settings.invoice_footer}
              onChange={(value) =>
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
            <MDEditor
              value={company.settings.quote_terms}
              onChange={(value) =>
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
            <MDEditor
              value={company.settings.quote_footer}
              onChange={(value) =>
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
            <MDEditor
              value={company.settings.credit_terms}
              onChange={(value) =>
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
            <MDEditor
              value={company.settings.credit_footer}
              onChange={(value) =>
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
