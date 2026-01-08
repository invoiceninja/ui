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
import { Button, InputField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { RecurringInvoiceContext } from '../../create/Create';
import { Link, useOutletContext } from 'react-router-dom';
import { cloneDeep, get, set } from 'lodash';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { useColorScheme } from '$app/common/colors';
import { Icon } from '$app/components/icons/Icon';
import { MdCheckCircle } from 'react-icons/md';
import { $refetch } from '$app/common/hooks/useRefetch';
import { VALIDATION_ENTITIES } from '$app/pages/invoices/edit/components/EInvoice';
import { EntityError, ValidationEntityResponse } from '$app/pages/settings/e-invoice/common/hooks/useCheckEInvoiceValidation';
import { route } from '$app/common/helpers/route';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useCompanyVerifactu } from '$app/common/hooks/useCompanyVerifactu';

export default function EInvoice() {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const company = useCurrentCompany();
  const verifactuEnabled = useCompanyVerifactu();

  const displayEInvoiceAndStatusCard =
    (company?.settings.e_invoice_type === 'PEPPOL' &&
    company?.tax_data?.acts_as_sender) || verifactuEnabled;

  const context: RecurringInvoiceContext = useOutletContext();
  const { recurringInvoice, errors, setRecurringInvoice, eInvoiceValidationEntityResponse, setTriggerValidationQuery } = context;

  const handleChange = (property: string, value: string | number | boolean) => {
    const updatedInvoice = cloneDeep(recurringInvoice) as RecurringInvoice;

    set(updatedInvoice, property, value);

    setRecurringInvoice(updatedInvoice);
  };

  const getDateValue = (date: 'start' | 'end') => {
    return (
      (
        get(
          recurringInvoice,
          'e_invoice.Invoice.InvoicePeriod.0.Description'
        ) as unknown as string
      )?.split('|')?.[date === 'start' ? 0 : 1] || ''
    );
  };

  return (
    <>
      {displayEInvoiceAndStatusCard ?<Card
        title={t('e_invoice')}
        topRight={
          <Button
            behavior="button"
            onClick={() => {
              $refetch(['entity_validations']);
              setTriggerValidationQuery(true);
            }}
          >
            {t('validate')}
          </Button>
        }
        className="shadow-sm"
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
      >
        {Boolean(eInvoiceValidationEntityResponse && recurringInvoice) && (
          <div className="flex px-6">
            <div className="flex flex-1 flex-col space-y-4 text-sm">
              {VALIDATION_ENTITIES.map((entity, index) =>
                (
                  eInvoiceValidationEntityResponse?.[
                  entity as keyof ValidationEntityResponse
                  ] as Array<EntityError | string>
                ).length ? (
                  <div
                    key={index}
                    className="flex items-center space-x-4 border-l-2 border-red-500 pl-4 py-4"
                  >
                    <div className="whitespace-nowrap font-medium w-24">
                      {t(entity)}:
                    </div>

                    <div className="flex flex-1 items-center justify-between pr-4">
                      <div className="flex flex-col space-y-2.5">
                        {(
                          eInvoiceValidationEntityResponse?.[
                          entity as keyof ValidationEntityResponse
                          ] as Array<EntityError>
                        ).map((message, index) => (
                          <span key={index}>
                            {entity === 'invoice'
                              ? (message as unknown as string)
                              : message.label
                                ? `${message.label} (${t('required')})`
                                : message.field}
                          </span>
                        ))}
                      </div>

                      {entity === 'invoice' && (
                        <Link
                          to={route('/recurring_invoices/:id/edit', {
                            id: recurringInvoice?.id,
                          })}
                        >
                          {t('edit_recurring_invoice')}
                        </Link>
                      )}

                      {entity === 'client' && (
                        <Link
                          to={route('/clients/:id/edit', {
                            id: recurringInvoice?.client_id,
                          })}
                        >
                          {t('edit_client')}
                        </Link>
                      )}

                      {entity === 'company' && (
                        <Link to="/settings/company_details">
                          {t('settings')}
                        </Link>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    key={index}
                    className="flex items-center space-x-4 border-l-2 border-green-600 pl-4 py-4"
                  >
                    <div className="whitespace-nowrap font-medium w-24">
                      {t(entity)}:
                    </div>

                    <div>
                      <Icon element={MdCheckCircle} size={33} color="green" />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </Card>:null}
      
      <Card
        title={t('date_range')}
        className="shadow-sm"
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
      >
        <Element leftSide={t('start_date')}>
          <InputField
            element="textarea"
            value={getDateValue('start')}
            onValueChange={(value) =>
              handleChange(
                'e_invoice.Invoice.InvoicePeriod.0.Description',
                `${value}|${getDateValue('end')}`
              )
            }
            errorMessage={
              errors?.errors?.[
                'e_invoice.InvoicePeriod.Description.0.StartDate'
              ]
            }
          />
        </Element>

        <Element leftSide={t('end_date')}>
          <InputField
            element="textarea"
            value={getDateValue('end')}
            onValueChange={(value) =>
              handleChange(
                'e_invoice.Invoice.InvoicePeriod.0.Description',
                `${getDateValue('start')}|${value}`
              )
            }
            errorMessage={
              errors?.errors?.['e_invoice.InvoicePeriod.Description.0.EndDate']
            }
          />
        </Element>
      </Card>
    </>
  );
}
