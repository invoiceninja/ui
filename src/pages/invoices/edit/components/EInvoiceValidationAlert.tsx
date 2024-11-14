/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from '$app/common/helpers/route';
import { Alert } from '$app/components/Alert';
import { Link } from '$app/components/forms';
import {
  EntityError,
  ValidationEntityResponse,
} from '$app/pages/settings/e-invoice/common/hooks/useCheckEInvoiceValidation';
import { useTranslation } from 'react-i18next';

interface Props {
  validationResponse: ValidationEntityResponse | undefined;
  clientId: string;
  currentInvoiceErrors: string[];
  invoiceId: string;
}

const VALIDATION_ENTITIES = ['invoice', 'client', 'company'];

export function EInvoiceValidationAlert(props: Props) {
  const [t] = useTranslation();

  const { validationResponse, clientId, currentInvoiceErrors, invoiceId } =
    props;

  if (!validationResponse) {
    return null;
  }

  return (
    <>
      <Alert type="danger" disableClosing>
        <div className="flex flex-col space-y-4">
          {VALIDATION_ENTITIES.filter(
            (value) =>
              (
                validationResponse[
                  value as keyof ValidationEntityResponse
                ] as Array<string>
              ).length
          ).map((entity, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="whitespace-nowrap font-medium w-24">
                {t(entity)}:
              </div>

              <div className="flex flex-1 items-center justify-between pr-4">
                <div className="flex flex-col space-y-1">
                  {(
                    validationResponse[
                      entity as keyof ValidationEntityResponse
                    ] as Array<EntityError>
                  ).map((message, index) => (
                    <div key={index} className="flex flex-col space-y-1">
                      <span>
                        {message.label
                          ? `${message.label} (${t('required')})`
                          : message.field}
                      </span>
                    </div>
                  ))}
                </div>

                {entity === 'client' ? (
                  <Link to={route('/clients/:id/edit', { id: clientId })}>
                    {t('edit_client')}
                  </Link>
                ) : (
                  <Link to="/settings/company_details">{t('settings')}</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </Alert>

      {Boolean(currentInvoiceErrors.length) && (
        <Alert type="danger" disableClosing>
          <div className="flex items-center space-x-4">
            <div className="whitespace-nowrap font-medium w-24">
              {t('invoice')}:
            </div>

            <div className="flex flex-1 items-center justify-between pr-4">
              <div className="flex flex-col space-y-1">
                {currentInvoiceErrors.map((message, index) => (
                  <span key={index}>{message}</span>
                ))}
              </div>

              <Link to={route('/invoices/:id/edit', { id: invoiceId })}>
                {t('edit_invoice')}
              </Link>
            </div>
          </div>
        </Alert>
      )}
    </>
  );
}
