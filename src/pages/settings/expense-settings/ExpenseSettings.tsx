/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { useTitle } from '$app/common/hooks/useTitle';
import { updateChanges } from '$app/common/stores/slices/company-users';
import { Divider } from '$app/components/cards/Divider';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Card, Element } from '../../../components/cards';
import { InputField, Radio } from '../../../components/forms';
import Toggle from '../../../components/forms/Toggle';
import { Settings } from '../../../components/layouts/Settings';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import { ExpenseCategories } from '../expense-categories';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { isSelfHosted } from '$app/common/helpers';
import { useHandleCurrentCompanyChangeProperty } from '../common/hooks/useHandleCurrentCompanyChange';

export function ExpenseSettings() {
  useTitle('expense_settings');
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('expense_settings'), href: '/settings/expense_settings' },
  ];

  const companyChanges = useInjectCompanyChanges();
  const { isCompanySettingsActive } = useCurrentSettingsLevel();

  const dispatch = useDispatch();
  const onCancel = useDiscardChanges();
  const onSave = useHandleCompanySave();
  const handleCurrentCompanyChangeProperty =
    useHandleCurrentCompanyChangeProperty();

  return (
    <Settings
      onSaveClick={onSave}
      onCancelClick={onCancel}
      title={t('expense_settings')}
      breadcrumbs={pages}
      docsLink="en/basic-settings/#expense_settings"
    >
      <Card title={t('settings')}>
        <Element
          leftSide={t('should_be_invoiced')}
          leftSideHelp={t('should_be_invoiced_help')}
        >
          <Toggle
            checked={companyChanges?.mark_expenses_invoiceable}
            onChange={(value: boolean) =>
              handleCurrentCompanyChangeProperty(
                'mark_expenses_invoiceable',
                value
              )
            }
            cypressRef="shouldBeInvoicedToggle"
          />
        </Element>

        <Element leftSide={t('mark_paid')} leftSideHelp={t('mark_paid_help')}>
          <Toggle
            checked={companyChanges?.mark_expenses_paid}
            onChange={(value: boolean) =>
              handleCurrentCompanyChangeProperty('mark_expenses_paid', value)
            }
            cypressRef="markPaidToggle"
          />
        </Element>

        <Element
          leftSide={t('convert_currency')}
          leftSideHelp={t('convert_expense_currency_help')}
        >
          <Toggle
            checked={companyChanges?.convert_expense_currency}
            onChange={(value: boolean) =>
              handleCurrentCompanyChangeProperty(
                'convert_expense_currency',
                value
              )
            }
            cypressRef="convertCurrencyToggle"
          />
        </Element>

        <Element
          leftSide={t('add_documents_to_invoice')}
          leftSideHelp={t('add_documents_to_invoice_help')}
        >
          <Toggle
            checked={companyChanges?.invoice_expense_documents}
            onChange={(value: boolean) =>
              handleCurrentCompanyChangeProperty(
                'invoice_expense_documents',
                value
              )
            }
            cypressRef="addDocumentsToInvoiceToggle"
          />
        </Element>

        <Element
          leftSide={t('notify_vendor_when_paid')}
          leftSideHelp={t('notify_vendor_when_paid_help')}
        >
          <Toggle
            onChange={(value: boolean) =>
              handleCurrentCompanyChangeProperty(
                'notify_vendor_when_paid',
                value
              )
            }
            checked={companyChanges?.notify_vendor_when_paid || false}
          />
        </Element>

        {isCompanySettingsActive && isSelfHosted() && (
          <>
            <Divider withoutPadding />

            <Element className="mt-3.5" leftSide={t('expense_mailbox_active')}>
              <Toggle
                checked={Boolean(companyChanges?.expense_mailbox_active)}
                onChange={(value: boolean) =>
                  handleCurrentCompanyChangeProperty(
                    'expense_mailbox_active',
                    value
                  )
                }
              />
            </Element>

            {Boolean(companyChanges?.expense_mailbox_active) && (
              <>
                <Element leftSide={t('expense_mailbox')}>
                  <InputField
                    value={companyChanges?.expense_mailbox || ''}
                    onValueChange={(value) =>
                      handleCurrentCompanyChangeProperty(
                        'expense_mailbox',
                        value
                      )
                    }
                  />
                </Element>

                <Element leftSide={t('inbound_mailbox_allow_company_users')}>
                  <Toggle
                    checked={Boolean(
                      companyChanges?.inbound_mailbox_allow_company_users
                    )}
                    onChange={(value: boolean) =>
                      handleCurrentCompanyChangeProperty(
                        'inbound_mailbox_allow_company_users',
                        value
                      )
                    }
                  />
                </Element>

                <Element leftSide={t('inbound_mailbox_allow_vendors')}>
                  <Toggle
                    checked={Boolean(
                      companyChanges?.inbound_mailbox_allow_vendors
                    )}
                    onChange={(value: boolean) =>
                      handleCurrentCompanyChangeProperty(
                        'inbound_mailbox_allow_vendors',
                        value
                      )
                    }
                  />
                </Element>

                <Element leftSide={t('inbound_mailbox_allow_clients')}>
                  <Toggle
                    checked={Boolean(
                      companyChanges?.inbound_mailbox_allow_clients
                    )}
                    onChange={(value: boolean) =>
                      handleCurrentCompanyChangeProperty(
                        'inbound_mailbox_allow_clients',
                        value
                      )
                    }
                  />
                </Element>

                <Element
                  leftSide={t('inbound_mailbox_whitelist')}
                  leftSideHelp={t('inbound_mailbox_whitelist_help')}
                >
                  <InputField
                    value={companyChanges?.inbound_mailbox_whitelist || ''}
                    onValueChange={(value) =>
                      handleCurrentCompanyChangeProperty(
                        'inbound_mailbox_whitelist',
                        value
                      )
                    }
                  />
                </Element>

                <Element
                  leftSide={t('inbound_mailbox_blacklist')}
                  leftSideHelp={t('inbound_mailbox_blacklist_help')}
                >
                  <InputField
                    value={companyChanges?.inbound_mailbox_blacklist || ''}
                    onValueChange={(value) =>
                      handleCurrentCompanyChangeProperty(
                        'inbound_mailbox_blacklist',
                        value
                      )
                    }
                  />
                </Element>

                <Element leftSide={t('inbound_mailbox_allow_unknown')}>
                  <Toggle
                    checked={Boolean(
                      companyChanges?.inbound_mailbox_allow_unknown
                    )}
                    onChange={(value: boolean) =>
                      handleCurrentCompanyChangeProperty(
                        'inbound_mailbox_allow_unknown',
                        value
                      )
                    }
                  />
                </Element>
              </>
            )}
          </>
        )}

        <Divider className="pb-3.5" withoutPadding />

        <Element leftSide={t('enter_taxes')}>
          <Radio
            onValueChange={(value) =>
              dispatch(
                updateChanges({
                  object: 'company',
                  property: 'calculate_expense_tax_by_amount',
                  value: value === 'true' ? true : false,
                })
              )
            }
            options={[
              { id: 'by_rate', title: t('by_rate'), value: 'false' },
              { id: 'by_amount', title: t('by_amount'), value: 'true' },
            ]}
            name="calculate_expense_tax_by_amount"
            defaultSelected={companyChanges?.calculate_expense_tax_by_amount.toString()}
            cypressRef="taxByRadio"
          />
        </Element>

        <Element
          leftSide={t('inclusive_taxes')}
          leftSideHelp={
            <span className="flex flex-col">
              <span>{t('exclusive')}: 100 + 10% = 100 + 10</span>
              <span>{t('inclusive')}: 100 + 10% = 90.91 + 9.09</span>
            </span>
          }
        >
          <Toggle
            onChange={(value: boolean) =>
              handleCurrentCompanyChangeProperty(
                'expense_inclusive_taxes',
                value
              )
            }
            checked={companyChanges?.expense_inclusive_taxes || false}
            cypressRef="inclusiveTaxesToggle"
          />
        </Element>
      </Card>

      <ExpenseCategories />
    </Settings>
  );
}
