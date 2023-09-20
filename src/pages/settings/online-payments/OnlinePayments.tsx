/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';

import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { useTitle } from '$app/common/hooks/useTitle';
import Toggle from '$app/components/forms/Toggle';
import { Settings } from '$app/components/layouts/Settings';
import { useTranslation } from 'react-i18next';
import { InputField, Link, SelectField } from '../../../components/forms';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import {
  useHandleCurrentCompanyChange,
  useHandleCurrentCompanyChangeProperty,
} from '../common/hooks/useHandleCurrentCompanyChange';
import { Gateways } from '../gateways/index/Gateways';
import { usePaymentTermsQuery } from '$app/common/queries/payment-terms';
import { PaymentTerm } from '$app/common/interfaces/payment-term';
import { useEffect, useState } from 'react';
import { updateChanges } from '$app/common/stores/slices/company-users';
import { useDispatch } from 'react-redux';
import { useAtomValue } from 'jotai';
import { companySettingsErrorsAtom } from '../common/atoms';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';

export function OnlinePayments() {
  const [t] = useTranslation();

  const dispatch = useDispatch();

  const { isCompanySettingsActive } = useCurrentSettingsLevel();

  useTitle('online_payments');

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('online_payments'), href: '/settings/online_payments' },
  ];

  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>();

  const { data: termsResponse } = usePaymentTermsQuery({});

  const errors = useAtomValue(companySettingsErrorsAtom);

  const company = useInjectCompanyChanges();

  const handleChange = useHandleCurrentCompanyChange();
  const handleChangeProperty = useHandleCurrentCompanyChangeProperty();

  const onSave = useHandleCompanySave();
  const onCancel = useDiscardChanges();

  const handleToggleChange = (id: string, value: boolean) => {
    dispatch(
      updateChanges({
        object: 'company',
        property: id,
        value,
      })
    );
  };

  useEffect(() => {
    if (termsResponse) {
      setPaymentTerms(termsResponse.data.data);
    }
  }, [termsResponse]);

  return (
    <Settings
      title={t('online_payments')}
      breadcrumbs={pages}
      docsLink="en/basic-settings/#online_payments"
      onSaveClick={onSave}
      onCancelClick={onCancel}
      withoutBackButton
    >
      <Card title={t('settings')}>
        <Element leftSide={t('auto_bill_standard_invoices')}>
          <Toggle
            checked={Boolean(company?.settings?.auto_bill_standard_invoices)}
            onChange={(value) =>
              handleChangeProperty(
                'settings.auto_bill_standard_invoices',
                value
              )
            }
          />
        </Element>

        <Element leftSide={`${t('auto_bill')} ${t('recurring_invoices')}`}>
          <SelectField
            value={company?.settings.auto_bill || 'off'}
            onChange={handleChange}
            id="settings.auto_bill"
            errorMessage={errors?.errors['settings.auto_bill']}
          >
            <option value="always">
              {t('enabled')} ({t('auto_bill_help_always')})
            </option>
            <option value="optout">
              {t('optout')} ({t('auto_bill_help_optout')})
            </option>
            <option value="optin">
              {t('optin')} ({t('auto_bill_help_optin')})
            </option>
            <option value="off">
              {t('disabled')} ({t('auto_bill_help_off')})
            </option>
          </SelectField>
        </Element>

        <Element leftSide={t('auto_bill_on')}>
          <SelectField
            id="settings.auto_bill_date"
            value={company?.settings.auto_bill_date || 'on_send_date'}
            onChange={handleChange}
            errorMessage={errors?.errors['settings.auto_bill_date']}
          >
            <option value="on_send_date">{t('send_date')}</option>
            <option value="on_due_date">{t('due_date')}</option>
          </SelectField>
        </Element>

        <Element leftSide={t('use_available_credits')}>
          <SelectField
            value={company?.settings.use_credits_payment || 'off'}
            id="settings.use_credits_payment"
            onChange={handleChange}
            errorMessage={errors?.errors['settings.use_credits_payment']}
          >
            <option value="always">{t('enabled')}</option>
            <option value="option">{t('show_option')}</option>
            <option value="off">{t('off')}</option>
          </SelectField>
        </Element>

        {paymentTerms && (
          <>
            <Element leftSide={t('payment_terms')}>
              <SelectField
                value={company?.settings?.payment_terms || ''}
                id="settings.payment_terms"
                onChange={handleChange}
                errorMessage={errors?.errors['settings.payment_terms']}
              >
                <option value=""></option>
                {paymentTerms.map((type: PaymentTerm) => (
                  <option key={type.id} value={type.num_days}>
                    {type.name}
                  </option>
                ))}
              </SelectField>
            </Element>

            <Element className="py-0 sm:py-0">
              <Link to="/settings/payment_terms">
                {t('configure_payment_terms')}
              </Link>
            </Element>
          </>
        )}

        <Element leftSide={t('manual_payment_email')}>
          <Toggle
            checked={Boolean(
              company?.settings.client_manual_payment_notification
            )}
            onChange={(value: boolean) =>
              handleToggleChange(
                'settings.client_manual_payment_notification',
                value
              )
            }
          />
        </Element>

        <Element leftSide={t('online_payment_email')}>
          <Toggle
            checked={Boolean(
              company?.settings.client_online_payment_notification
            )}
            onChange={(value: boolean) =>
              handleToggleChange(
                'settings.client_online_payment_notification',
                value
              )
            }
          />
        </Element>

        <Element
          leftSide={t('mark_paid_payment_email')}
          leftSideHelp={t('mark_paid_payment_email_help')}
        >
          <Toggle
            checked={Boolean(company?.settings.mark_paid_payment_email)}
            onChange={(value: boolean) =>
              handleToggleChange('settings.mark_paid_payment_email', value)
            }
          />
        </Element>

        {isCompanySettingsActive && (
          <Element leftSide={t('enable_applying_payments')}>
            <Toggle
              label={t('enable_applying_payments_help')}
              id="allow_over_payment"
              checked={Boolean(company?.enable_applying_payments)}
              onChange={(value) =>
                handleChangeProperty('enable_applying_payments', value)
              }
            />
          </Element>
        )}

        <Element leftSide={t('allow_over_payment')}>
          <Toggle
            label={t('allow_over_payment_help')}
            id="allow_over_payment"
            checked={Boolean(
              company?.settings.client_portal_allow_over_payment
            )}
            onChange={(value) =>
              handleChangeProperty(
                'settings.client_portal_allow_over_payment',
                value
              )
            }
          />
        </Element>

        <Element leftSide={t('allow_under_payment')}>
          <Toggle
            label={t('allow_under_payment_help')}
            id="allow_under_payment"
            checked={Boolean(
              company?.settings.client_portal_allow_under_payment
            )}
            onChange={(value) =>
              handleChangeProperty(
                'settings.client_portal_allow_under_payment',
                value
              )
            }
          />
        </Element>
        {company?.settings.client_portal_allow_under_payment && (
          <Element leftSide={t('minimum_under_payment_amount')}>
            <InputField
              type="number"
              value={
                company?.settings.client_portal_under_payment_minimum || ''
              }
              onValueChange={(value) =>
                handleChangeProperty(
                  'settings.client_portal_under_payment_minimum',
                  parseFloat(value)
                )
              }
              errorMessage={
                errors?.errors['settings.client_portal_under_payment_minimum']
              }
            />
          </Element>
        )}

        <Element leftSide={t('client_initiated_payments')}>
          <Toggle
            label={t('client_initiated_payments_help')}
            id="client_initiated_payments"
            checked={Boolean(company?.settings.client_initiated_payments)}
            onChange={(value) =>
              handleChangeProperty('settings.client_initiated_payments', value)
            }
          />
        </Element>

        {company?.settings.client_initiated_payments && (
          <Element leftSide={t('minimum_payment_amount')}>
            <InputField
              type="number"
              value={company?.settings.client_initiated_payments_minimum || ''}
              onValueChange={(value) =>
                handleChangeProperty(
                  'settings.client_initiated_payments_minimum',
                  parseFloat(value)
                )
              }
              errorMessage={
                errors?.errors['settings.client_initiated_payments_minimum']
              }
            />
          </Element>
        )}
      </Card>

      <Gateways />
    </Settings>
  );
}
