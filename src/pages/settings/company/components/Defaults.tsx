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
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '$app/common/stores/store';
import { updateChanges } from '$app/common/stores/slices/company-users';
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import { useDisableSettingsField } from '$app/common/hooks/useDisableSettingsField';
import { PropertyCheckbox } from '$app/components/PropertyCheckbox';
import { SettingsLabel } from '$app/components/SettingsLabel';

export function Defaults() {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const disableSettingsField = useDisableSettingsField();

  const companyChanges = useSelector(
    (state: RootState) => state.companyUsers.changes.company
  );

  return (
    <>
      {companyChanges?.settings && (
        <Card title={t('defaults')}>
          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="invoice_terms"
                labelElement={<SettingsLabel label={t('invoice_terms')} />}
              />
            }
          >
            <MarkdownEditor
              value={companyChanges?.settings?.invoice_terms || ''}
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
              value={companyChanges?.settings?.invoice_footer || ''}
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
              value={companyChanges?.settings?.quote_terms || ''}
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
              value={companyChanges?.settings?.quote_footer || ''}
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
              value={companyChanges?.settings?.credit_terms || ''}
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
              value={companyChanges?.settings?.credit_footer || ''}
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
              value={companyChanges?.settings?.purchase_order_terms || ''}
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
              value={companyChanges?.settings?.purchase_order_footer || ''}
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
