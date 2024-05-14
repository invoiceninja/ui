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
import { PropertyCheckbox } from '$app/components/PropertyCheckbox';
import { useDisableSettingsField } from '$app/common/hooks/useDisableSettingsField';
import { SettingsLabel } from '$app/components/SettingsLabel';
import { useStaticsQuery } from '$app/common/queries/statics';

export function OnlinePayments() {
  useTitle('online_payments');
  const [t] = useTranslation();

  const dispatch = useDispatch();
  const disableSettingsField = useDisableSettingsField();

  const { isCompanySettingsActive } = useCurrentSettingsLevel();

  const { data: statics } = useStaticsQuery();

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
      <Gateways />

      <Card title={t('settings')}>
        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="auto_bill_standard_invoices"
              labelElement={
                <SettingsLabel
                  label={t('auto_bill_standard_invoices')}
                  helpLabel={t('auto_bill_standard_invoices_help')}
                />
              }
              defaultValue={false}
            />
          }
        >
          <Toggle
            checked={Boolean(company?.settings?.auto_bill_standard_invoices)}
            onChange={(value) =>
              handleChangeProperty(
                'settings.auto_bill_standard_invoices',
                value
              )
            }
            disabled={disableSettingsField('auto_bill_standard_invoices')}
          />
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="auto_bill"
              labelElement={
                <SettingsLabel
                  label={`${t('auto_bill')} ${t('recurring_invoices')}`}
                />
              }
              defaultValue="off"
            />
          }
        >
          <SelectField
            value={company?.settings.auto_bill || 'off'}
            onChange={handleChange}
            id="settings.auto_bill"
            disabled={disableSettingsField('auto_bill')}
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

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="auto_bill_date"
              labelElement={
                <SettingsLabel
                  label={t('auto_bill_on')}
                  helpLabel={t('auto_bill_on_help')}
                />
              }
              defaultValue="on_send_date"
            />
          }
        >
          <SelectField
            id="settings.auto_bill_date"
            value={company?.settings.auto_bill_date || 'on_send_date'}
            onChange={handleChange}
            disabled={disableSettingsField('auto_bill_date')}
            errorMessage={errors?.errors['settings.auto_bill_date']}
          >
            <option value="on_send_date">{t('send_date')}</option>
            <option value="on_due_date">{t('due_date')}</option>
          </SelectField>
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="use_credits_payment"
              labelElement={
                <SettingsLabel
                  label={t('use_available_credits')}
                  helpLabel={t('use_available_credits_help')}
                />
              }
              defaultValue="off"
            />
          }
        >
          <SelectField
            value={company?.settings.use_credits_payment || 'off'}
            id="settings.use_credits_payment"
            onChange={handleChange}
            disabled={disableSettingsField('use_credits_payment')}
            errorMessage={errors?.errors['settings.use_credits_payment']}
          >
            <option value="always">{t('enabled')}</option>
            <option value="option">{t('show_option')}</option>
            <option value="off">{t('off')}</option>
          </SelectField>
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="use_unapplied_payment"
              labelElement={
                <SettingsLabel
                  label={t('use_unapplied_payments')}
                  helpLabel={t('use_unapplied_payments_help')}
                />
              }
              defaultValue="off"
            />
          }
        >
          <SelectField
            value={company?.settings.use_unapplied_payment || 'off'}
            id="settings.use_unapplied_payment"
            onChange={handleChange}
            disabled={disableSettingsField('use_unapplied_payment')}
            errorMessage={errors?.errors['settings.use_unapplied_payment']}
          >
            <option value="always">{t('enabled')}</option>
            <option value="option">{t('show_option')}</option>
            <option value="off">{t('off')}</option>
          </SelectField>
        </Element>

        {paymentTerms && (
          <>
            <Element
              leftSide={
                <PropertyCheckbox
                  propertyKey="payment_terms"
                  labelElement={
                    <SettingsLabel
                      label={t('payment_terms')}
                      helpLabel={t('payment_terms_help')}
                    />
                  }
                />
              }
            >
              <SelectField
                value={company?.settings?.payment_terms || ''}
                id="settings.payment_terms"
                onChange={handleChange}
                disabled={disableSettingsField('payment_terms')}
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

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="payment_type_id"
              labelElement={
                <SettingsLabel
                  label={t('payment_type')}
                  helpLabel={t('payment_type_help')}
                />
              }
            />
          }
        >
          <SelectField
            value={company?.settings?.payment_type_id || '0'}
            onChange={handleChange}
            id="settings.payment_type_id"
            blankOptionValue="0"
            disabled={disableSettingsField('payment_type_id')}
            withBlank
            errorMessage={errors?.errors['settings.payment_type_id']}
          >
            {statics?.payment_types.map(
              (type: { id: string; name: string }) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              )
            )}
          </SelectField>
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="valid_until"
              labelElement={
                <SettingsLabel
                  label={t('quote_valid_until')}
                  helpLabel={t('quote_valid_until_help')}
                />
              }
            />
          }
        >
          <SelectField
            value={company?.settings?.valid_until || ''}
            id="settings.valid_until"
            onChange={handleChange}
            disabled={disableSettingsField('valid_until')}
            withBlank
            errorMessage={errors?.errors['settings.valid_until']}
          >
            {paymentTerms?.map((type: PaymentTerm) => (
              <option key={type.id} value={type.num_days}>
                {type.name}
              </option>
            ))}
          </SelectField>
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="default_expense_payment_type_id"
              labelElement={
                <SettingsLabel
                  label={t('expense_payment_type')}
                  helpLabel={t('expense_payment_type_help')}
                />
              }
            />
          }
        >
          <SelectField
            value={company?.settings?.default_expense_payment_type_id || ''}
            onChange={handleChange}
            disabled={disableSettingsField('default_expense_payment_type_id')}
            id="settings.default_expense_payment_type_id"
            blankOptionValue="0"
            withBlank
            errorMessage={
              errors?.errors['settings.default_expense_payment_type_id']
            }
          >
            {statics?.payment_types.map(
              (type: { id: string; name: string }) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              )
            )}
          </SelectField>
        </Element>

        <Element
          leftSideHelp={t('manual_payment_email_help')}
          leftSide={
            <PropertyCheckbox
              propertyKey="client_manual_payment_notification"
              labelElement={<SettingsLabel label={t('manual_payment_email')} />}
              defaultValue={false}
            />
          }
        >
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
            disabled={disableSettingsField(
              'client_manual_payment_notification'
            )}
          />
        </Element>

        <Element
          leftSideHelp={t('online_payment_email_help')}
          leftSide={
            <PropertyCheckbox
              propertyKey="client_online_payment_notification"
              labelElement={<SettingsLabel label={t('online_payment_email')} />}
              defaultValue={false}
            />
          }
        >
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
            disabled={disableSettingsField(
              'client_online_payment_notification'
            )}
          />
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="send_email_on_mark_paid"
              labelElement={
                <SettingsLabel
                  label={t('mark_paid_payment_email')}
                  helpLabel={t('mark_paid_payment_email_help')}
                />
              }
              defaultValue={false}
            />
          }
        >
          <Toggle
            checked={Boolean(company?.settings.send_email_on_mark_paid)}
            onChange={(value: boolean) =>
              handleToggleChange('settings.send_email_on_mark_paid', value)
            }
            disabled={disableSettingsField('send_email_on_mark_paid')}
          />
        </Element>

        {isCompanySettingsActive && (
          <Element
            leftSide={t('enable_applying_payments')}
            leftSideHelp={t('enable_applying_payments_help')}
          >
            <Toggle
              id="allow_over_payment"
              checked={Boolean(company?.enable_applying_payments)}
              onChange={(value) =>
                handleChangeProperty('enable_applying_payments', value)
              }
            />
          </Element>
        )}

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="client_portal_allow_over_payment"
              labelElement={<SettingsLabel label={t('allow_over_payment')} />}
              defaultValue={false}
            />
          }
          leftSideHelp={t('allow_over_payment_help')}
        >
          <Toggle
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
            disabled={disableSettingsField('client_portal_allow_over_payment')}
          />
        </Element>

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="client_portal_allow_under_payment"
              labelElement={<SettingsLabel label={t('allow_under_payment')} />}
              defaultValue={false}
            />
          }
          leftSideHelp={t('allow_under_payment_help')}
        >
          <Toggle
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
            disabled={disableSettingsField('client_portal_allow_under_payment')}
          />
        </Element>
        {company?.settings.client_portal_allow_under_payment && (
          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="client_portal_under_payment_minimum"
                labelElement={
                  <SettingsLabel label={t('minimum_under_payment_amount')} />
                }
              />
            }
          >
            <InputField
              type="number"
              value={
                company?.settings.client_portal_under_payment_minimum || ''
              }
              onValueChange={(value) =>
                handleChangeProperty(
                  'settings.client_portal_under_payment_minimum',
                  parseFloat(value) || 0
                )
              }
              disabled={disableSettingsField(
                'client_portal_under_payment_minimum'
              )}
              errorMessage={
                errors?.errors['settings.client_portal_under_payment_minimum']
              }
            />
          </Element>
        )}

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="client_initiated_payments"
              labelElement={
                <SettingsLabel label={t('client_initiated_payments')} />
              }
              defaultValue={false}
            />
          }
          leftSideHelp={t('client_initiated_payments_help')}
        >
          <Toggle
            id="client_initiated_payments"
            checked={Boolean(company?.settings.client_initiated_payments)}
            onChange={(value) =>
              handleChangeProperty('settings.client_initiated_payments', value)
            }
            disabled={disableSettingsField('client_initiated_payments')}
          />
        </Element>

        {company?.settings.client_initiated_payments && (
          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="client_initiated_payments_minimum"
                labelElement={
                  <SettingsLabel label={t('minimum_payment_amount')} />
                }
              />
            }
          >
            <InputField
              type="number"
              value={company?.settings.client_initiated_payments_minimum || ''}
              onValueChange={(value) =>
                handleChangeProperty(
                  'settings.client_initiated_payments_minimum',
                  parseFloat(value)
                )
              }
              disabled={disableSettingsField(
                'client_initiated_payments_minimum'
              )}
              errorMessage={
                errors?.errors['settings.client_initiated_payments_minimum']
              }
            />
          </Element>
        )}

        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey="payment_email_all_contacts"
              labelElement={
                <SettingsLabel label={t('payment_email_all_contacts')} />
              }
              defaultValue={false}
            />
          }
          leftSideHelp={t('payment_email_all_contacts_help')}
        >
          <Toggle
            id="payment_email_all_contacts"
            checked={Boolean(company?.settings.payment_email_all_contacts)}
            onChange={(value) =>
              handleChangeProperty('settings.payment_email_all_contacts', value)
            }
            disabled={disableSettingsField('payment_email_all_contacts')}
          />
        </Element>
      </Card>
    </Settings>
  );
}
