/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Invoice } from '$app/common/interfaces/invoice';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Card } from '$app/components/cards';
import { EInvoiceComponent } from '$app/pages/settings';
import { Dispatch, RefObject, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import {
  EntityError,
  ValidationEntityResponse,
} from '$app/pages/settings/e-invoice/common/hooks/useCheckEInvoiceValidation';
import { Link } from '$app/components/forms';
import { route } from '$app/common/helpers/route';
import { Icon } from '$app/components/icons/Icon';
import { MdCheckCircle } from 'react-icons/md';

export interface Context {
  invoice: Invoice | undefined;
  setInvoice: Dispatch<SetStateAction<Invoice | undefined>>;
  isDefaultTerms: boolean;
  setIsDefaultTerms: Dispatch<SetStateAction<boolean>>;
  isDefaultFooter: boolean;
  setIsDefaultFooter: Dispatch<SetStateAction<boolean>>;
  errors: ValidationBag | undefined;
  eInvoiceRef: RefObject<EInvoiceComponent> | undefined;
  eInvoiceValidationEntityResponse: ValidationEntityResponse | undefined;
}

const VALIDATION_ENTITIES = ['invoice', 'client', 'company'];

export default function EInvoice() {
  const [t] = useTranslation();

  const context: Context = useOutletContext();

  const { invoice, eInvoiceValidationEntityResponse } = context;

  return (
    <>
      <Card title={t('e_invoice')}>
        {Boolean(eInvoiceValidationEntityResponse && invoice) && (
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
                      <div className="flex flex-col space-y-1">
                        {(
                          eInvoiceValidationEntityResponse?.[
                            entity as keyof ValidationEntityResponse
                          ] as Array<EntityError>
                        ).map((message, index) => (
                          <div key={index} className="flex flex-col space-y-1">
                            <span>
                              {entity === 'invoice'
                                ? (message as unknown as string)
                                : message.label
                                ? `${message.label} (${t('required')})`
                                : message.field}
                            </span>
                          </div>
                        ))}
                      </div>

                      {entity === 'invoice' && (
                        <Link
                          to={route('/invoices/:id/edit', {
                            id: invoice?.id,
                          })}
                        >
                          {t('edit_invoice')}
                        </Link>
                      )}

                      {entity === 'client' && (
                        <Link
                          to={route('/clients/:id/edit', {
                            id: invoice?.client_id,
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
      </Card>
    </>
  );
}
