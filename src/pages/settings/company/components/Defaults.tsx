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
import Toggle from '../../../../components/forms/Toggle';
import { useDispatch, useSelector } from 'react-redux';
import { useStaticsQuery } from '$app/common/queries/statics';
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
import { SearchableSelect } from '$app/components/SearchableSelect';
import { useHandleCurrentCompanyChangeProperty } from '../../common/hooks/useHandleCurrentCompanyChange';

export function Defaults() {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const { data: statics } = useStaticsQuery();

  const { isCompanySettingsActive } = useCurrentSettingsLevel();

  const errors = useAtomValue(companySettingsErrorsAtom);

  const { data: terms } = useQuery('/api/v1/payment_terms', () =>
    request('GET', endpoint('/api/v1/payment_terms'))
  );

  const companyChanges = useSelector(
    (state: RootState) => state.companyUsers.changes.company
  );

  const handleChange = useHandleCurrentCompanyChangeProperty();

  return (
    <>
      {companyChanges?.settings && (
        <Card title={t('defaults')}>
          <Element leftSide={t('payment_type')}>
            <SearchableSelect
              value={companyChanges?.settings?.payment_type_id || '0'}
              onValueChange={(v) => handleChange('settings.payment_type_id', v)}
              errorMessage={errors?.errors['settings.payment_type_id']}
            >
              <option value="0"></option>
              {statics?.payment_types.map(
                (type: { id: string; name: string }) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                )
              )}
            </SearchableSelect>
          </Element>

          {terms && (
            <Element leftSide={t('quote_valid_until')}>
              <SearchableSelect
                value={companyChanges?.settings?.valid_until || ''}
                onValueChange={(v) => handleChange('settings.valid_until', v)}
                errorMessage={errors?.errors['settings.valid_until']}
              >
                <option value=""></option>
                {terms.data.data.map((type: PaymentTerm) => (
                  <option key={type.id} value={type.num_days}>
                    {type.name}
                  </option>
                ))}
              </SearchableSelect>
            </Element>
          )}

          <Element leftSide={t('expense_payment_type')}>
            <SearchableSelect
              value={
                companyChanges?.settings?.default_expense_payment_type_id || ''
              }
              onValueChange={(v) => handleChange('settings.default_expense_payment_type_id', v)}
              errorMessage={
                errors?.errors['settings.default_expense_payment_type_id']
              }
            >
              <option value="0"></option>
              {statics?.payment_types.map(
                (type: { id: string; name: string }) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                )
              )}
            </SearchableSelect>
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

          <Element className="mt-4" leftSide={t('invoice_terms')}>
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
            />
          </Element>

          <Element className="mt-4" leftSide={t('invoice_footer')}>
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
            />
          </Element>

          <Element className="mt-4" leftSide={t('quote_terms')}>
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
            />
          </Element>

          <Element className="mt-4" leftSide={t('quote_footer')}>
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
            />
          </Element>

          <Element className="mt-4" leftSide={t('credit_terms')}>
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
            />
          </Element>

          <Element className="mt-4" leftSide={t('credit_footer')}>
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
            />
          </Element>

          <Element className="mt-4" leftSide={t('purchase_order_terms')}>
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
            />
          </Element>

          <Element className="mt-4" leftSide={t('purchase_order_footer')}>
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
            />
          </Element>
        </Card>
      )}
    </>
  );
}
