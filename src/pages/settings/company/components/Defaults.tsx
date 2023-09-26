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
import { SelectField } from '../../../../components/forms';
import Toggle from '../../../../components/forms/Toggle';
import { useDispatch, useSelector } from 'react-redux';
import { useStaticsQuery } from '$app/common/queries/statics';
import { ChangeEvent } from 'react';
import { endpoint } from '$app/common/helpers';
import { useQuery } from 'react-query';
import { RootState } from '$app/common/stores/store';
import { updateChanges } from '$app/common/stores/slices/company-users';
import { PaymentTerm } from '../../../../common/interfaces/payment-term';
import { request } from '$app/common/helpers/request';
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import { Divider } from '$app/components/cards/Divider';
import { useAtomValue } from 'jotai';
import { companySettingsErrorsAtom } from '../../common/atoms';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { useDisableSettingsField } from '$app/common/hooks/useDisableSettingsField';
import { PropertyCheckbox } from '$app/components/PropertyCheckbox';
import { SettingsLabel } from '$app/components/SettingsLabel';

export function Defaults() {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const { data: statics } = useStaticsQuery();

  const disableSettingsField = useDisableSettingsField();

  const { isCompanySettingsActive } = useCurrentSettingsLevel();

  const errors = useAtomValue(companySettingsErrorsAtom);

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
          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="payment_type_id"
                labelElement={<SettingsLabel label={t('payment_type')} />}
              />
            }
          >
            <SelectField
              value={companyChanges?.settings?.payment_type_id || '0'}
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

          {terms && (
            <Element
              leftSide={
                <PropertyCheckbox
                  propertyKey="valid_until"
                  labelElement={
                    <SettingsLabel label={t('quote_valid_until')} />
                  }
                />
              }
            >
              <SelectField
                value={companyChanges?.settings?.valid_until || ''}
                id="settings.valid_until"
                onChange={handleChange}
                disabled={disableSettingsField('valid_until')}
                withBlank
                errorMessage={errors?.errors['settings.valid_until']}
              >
                {terms.data.data.map((type: PaymentTerm) => (
                  <option key={type.id} value={type.num_days}>
                    {type.name}
                  </option>
                ))}
              </SelectField>
            </Element>
          )}

          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="default_expense_payment_type_id"
                labelElement={
                  <SettingsLabel label={t('expense_payment_type')} />
                }
              />
            }
          >
            <SelectField
              value={
                companyChanges?.settings?.default_expense_payment_type_id || ''
              }
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

          <Divider />

          {isCompanySettingsActive && (
            <Element
              className="mb-3"
              leftSide={t('use_quote_terms')}
              leftSideHelp={t('use_quote_terms_help')}
            >
              <Toggle
                checked={Boolean(companyChanges?.use_quote_terms_on_conversion)}
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
          )}

          {isCompanySettingsActive && <Divider withoutPadding />}

          <Element
            className="mt-4"
            leftSide={
              <PropertyCheckbox
                propertyKey="invoice_terms"
                labelElement={<SettingsLabel label={t('invoice_terms')} />}
              />
            }
          >
            <MarkdownEditor
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
              disabled={disableSettingsField('invoice_terms')}
            />
          </Element>

          <Element
            className="mt-4"
            leftSide={
              <PropertyCheckbox
                propertyKey="invoice_footer"
                labelElement={<SettingsLabel label={t('invoice_footer')} />}
              />
            }
          >
            <MarkdownEditor
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
              disabled={disableSettingsField('invoice_footer')}
            />
          </Element>

          <Element
            className="mt-4"
            leftSide={
              <PropertyCheckbox
                propertyKey="quote_terms"
                labelElement={<SettingsLabel label={t('quote_terms')} />}
              />
            }
          >
            <MarkdownEditor
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
              disabled={disableSettingsField('quote_terms')}
            />
          </Element>

          <Element
            className="mt-4"
            leftSide={
              <PropertyCheckbox
                propertyKey="quote_footer"
                labelElement={<SettingsLabel label={t('quote_footer')} />}
              />
            }
          >
            <MarkdownEditor
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
              disabled={disableSettingsField('quote_footer')}
            />
          </Element>

          <Element
            className="mt-4"
            leftSide={
              <PropertyCheckbox
                propertyKey="credit_terms"
                labelElement={<SettingsLabel label={t('credit_terms')} />}
              />
            }
          >
            <MarkdownEditor
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
              disabled={disableSettingsField('credit_terms')}
            />
          </Element>

          <Element
            className="mt-4"
            leftSide={
              <PropertyCheckbox
                propertyKey="credit_footer"
                labelElement={<SettingsLabel label={t('credit_footer')} />}
              />
            }
          >
            <MarkdownEditor
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
              disabled={disableSettingsField('credit_footer')}
            />
          </Element>

          <Element
            className="mt-4"
            leftSide={
              <PropertyCheckbox
                propertyKey="purchase_order_terms"
                labelElement={
                  <SettingsLabel label={t('purchase_order_terms')} />
                }
              />
            }
          >
            <MarkdownEditor
              value={companyChanges?.settings?.purchase_order_terms}
              onChange={(value) =>
                dispatch(
                  updateChanges({
                    object: 'company',
                    property: 'settings.purchase_order_terms',
                    value,
                  })
                )
              }
              disabled={disableSettingsField('purchase_order_terms')}
            />
          </Element>

          <Element
            className="mt-4"
            leftSide={
              <PropertyCheckbox
                propertyKey="purchase_order_footer"
                labelElement={
                  <SettingsLabel label={t('purchase_order_footer')} />
                }
              />
            }
          >
            <MarkdownEditor
              value={companyChanges?.settings?.purchase_order_footer}
              onChange={(value) =>
                dispatch(
                  updateChanges({
                    object: 'company',
                    property: 'settings.purchase_order_footer',
                    value,
                  })
                )
              }
              disabled={disableSettingsField('purchase_order_footer')}
            />
          </Element>
        </Card>
      )}
    </>
  );
}
