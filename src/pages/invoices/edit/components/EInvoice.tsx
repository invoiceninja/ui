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
import { Card, Element } from '$app/components/cards';
import { EInvoiceComponent } from '$app/pages/settings';
import {
  Dispatch,
  ReactNode,
  RefObject,
  SetStateAction,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useOutletContext } from 'react-router-dom';
import {
  EntityError,
  ValidationEntityResponse,
} from '$app/pages/settings/e-invoice/common/hooks/useCheckEInvoiceValidation';
import { Button, InputField, Link } from '$app/components/forms';
import { route } from '$app/common/helpers/route';
import { Icon } from '$app/components/icons/Icon';
import { MdCheckCircle } from 'react-icons/md';
import { $refetch } from '$app/common/hooks/useRefetch';
import { InvoiceStatus } from '$app/common/enums/invoice-status';
import { toast } from '$app/common/helpers/toast/toast';
import { request } from '$app/common/helpers/request';
import { endpoint, trans } from '$app/common/helpers';
import { AxiosResponse } from 'axios';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { InvoiceActivity } from '$app/common/interfaces/invoice-activity';
import { useQuery } from 'react-query';
import reactStringReplace from 'react-string-replace';
import { useColorScheme } from '$app/common/colors';
import { cloneDeep, get, set } from 'lodash';

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
  setTriggerValidationQuery: Dispatch<SetStateAction<boolean>>;
}

const VALIDATION_ENTITIES = ['invoice', 'client', 'company'];
const EINVOICE_ACTIVITY_TYPES = [145, 146, 147] as number[];

export default function EInvoice() {
  const [t] = useTranslation();

  const location = useLocation();
  const colors = useColorScheme();

  const context: Context = useOutletContext();

  const {
    invoice,
    eInvoiceValidationEntityResponse,
    setTriggerValidationQuery,
    setInvoice,
    errors,
  } = context;

  const { data: activities } = useQuery({
    queryKey: ['/api/v1/activities/entity', invoice?.id],
    queryFn: () =>
      request('POST', endpoint('/api/v1/activities/entity'), {
        entity: 'invoice',
        entity_id: invoice?.id,
      }).then(
        (response: AxiosResponse<GenericManyResponse<InvoiceActivity>>) =>
          response.data.data
      ),
    enabled:
      invoice !== null &&
      location.pathname.includes('e_invoice') &&
      Boolean(
        invoice?.status_id === InvoiceStatus.Sent && invoice?.backup?.guid
      ),
    staleTime: Infinity,
  });

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const handleSend = () => {
    if (!isFormBusy) {
      toast.processing();
      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/einvoice/peppol/send'), {
        entity: 'invoice',
        entity_id: invoice?.id,
      })
        .then(() => {
          $refetch(['invoices']);
          toast.success('success');
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  const getActivityText = (activityTypeId: number) => {
    let text = trans(
      `activity_${activityTypeId}`,
      {}
    ) as unknown as ReactNode[];
    const invoiceElement = (
      <Link to={route('/invoices/:id/edit', { id: invoice?.id })}>
        {invoice?.number}
      </Link>
    );

    const clientElement = (
      <Link to={route('/clients/:id', { id: invoice?.client_id })}>
        {invoice?.client?.display_name}
      </Link>
    );

    const notesElement = '';

    text = reactStringReplace(text, `:invoice`, () => invoiceElement);
    text = reactStringReplace(text, `:client`, () => clientElement);
    text = reactStringReplace(text, `:notes`, () => notesElement);

    return text;
  };

  const handleChange = (property: string, value: string | number | boolean) => {
    const updatedInvoice = cloneDeep(invoice) as Invoice;

    set(updatedInvoice, property, value);

    setInvoice(updatedInvoice);
  };

  return (
    <>
      <Card
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
      >
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

      {Boolean([InvoiceStatus.Sent, InvoiceStatus.Draft, InvoiceStatus.Paid, InvoiceStatus.Partial].includes((invoice?.status_id?.toString() ?? InvoiceStatus.Draft) as InvoiceStatus)) && (
        <Card title={t('status')}>
          <div className="flex px-6 text-sm">
            <div
              className="flex items-center space-x-4 border-l-2 pl-4 py-4"
              style={{
                borderColor: colors.$5,
              }}
            >
              {invoice?.backup?.guid && (
                <span className="whitespace-nowrap font-medium">
                  {t('reference')}:
                </span>
              )}

              {invoice?.backup?.guid ? (
                <div className="flex flex-col space-y-2.5">
                  <span>{invoice?.backup?.guid}</span>

                  {activities
                    ?.filter((activity) =>
                      EINVOICE_ACTIVITY_TYPES.includes(
                        activity.activity_type_id
                      )
                    )
                    .map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center space-x-4"
                      >
                        <span className="font-medium">{t('message')}:</span>
                        <div>{getActivityText(activity.activity_type_id)}</div>
                      </div>
                    ))}
                </div>
              ) : (
                <Button
                  behavior="button"
                  onClick={handleSend}
                  disabled={isFormBusy}
                  disableWithoutIcon
                >
                  {t('send')}
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      <Card title={t('date_range')}>
        <Element leftSide={t('start_date')}>
          <InputField
            type="date"
            value={
              get(invoice, 'e_invoice.Invoice.InvoicePeriod.0.StartDate') || ''
            }
            onValueChange={(value) =>
              handleChange('e_invoice.Invoice.InvoicePeriod.0.StartDate', value)
            }
            errorMessage={
              errors?.errors?.['e_invoice.InvoicePeriod.0.StartDate']
            }
          />
        </Element>

        <Element leftSide={t('end_date')}>
          <InputField
            type="date"
            value={
              get(invoice, 'e_invoice.Invoice.InvoicePeriod.0.EndDate') || ''
            }
            onValueChange={(value) =>
              handleChange('e_invoice.Invoice.InvoicePeriod.0.EndDate', value)
            }
            errorMessage={errors?.errors?.['e_invoice.InvoicePeriod.0.EndDate']}
          />
        </Element>
      </Card>
    </>
  );
}
