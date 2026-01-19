/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Card, Element } from '$app/components/cards';
import { useQueryClient } from 'react-query';
import { Dispatch, ReactNode, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useOutletContext } from 'react-router-dom';
import {
  EntityError,
  ValidationEntityResponse,
} from '$app/pages/settings/e-invoice/common/hooks/useCheckEInvoiceValidation';
import { Button, Link } from '$app/components/forms';
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
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Credit } from '$app/common/interfaces/credit';
import { InvoiceSelector } from '$app/components/invoices/InvoiceSelector';

export interface Context {
  credit: Credit | undefined;
  setCredit: Dispatch<SetStateAction<Credit | undefined>>;
  isDefaultTerms: boolean;
  setIsDefaultTerms: Dispatch<SetStateAction<boolean>>;
  isDefaultFooter: boolean;
  setIsDefaultFooter: Dispatch<SetStateAction<boolean>>;
  errors: ValidationBag | undefined;
  eInvoiceValidationEntityResponse: ValidationEntityResponse | undefined;
  setTriggerValidationQuery: Dispatch<SetStateAction<boolean>>;
}

export const VALIDATION_ENTITIES = ['invoice', 'client', 'company'];
const EINVOICE_ACTIVITY_TYPES = [145, 146, 147] as number[];

export default function EInvoice() {
  const [t] = useTranslation();

  const queryClient = useQueryClient();

  const location = useLocation();
  const colors = useColorScheme();
  const company = useCurrentCompany();

  const context: Context = useOutletContext();

  const {
    credit,
    eInvoiceValidationEntityResponse,
    setTriggerValidationQuery,
    setCredit,
    errors,
  } = context;

  const displayEInvoiceAndStatusCard =
    company?.settings.e_invoice_type === 'PEPPOL' &&
    company?.tax_data?.acts_as_sender;

  const { data: activities } = useQuery({
    queryKey: ['/api/v1/activities/entity', credit?.id],
    queryFn: () =>
      request('POST', endpoint('/api/v1/activities/entity'), {
        entity: 'credit',
        entity_id: credit?.id,
      }).then(
        (response: AxiosResponse<GenericManyResponse<InvoiceActivity>>) =>
          response.data.data
      ),
    enabled:
      credit !== null &&
      location.pathname.includes('e_invoice') &&
      Boolean(credit?.status_id === InvoiceStatus.Sent && credit?.backup?.guid),
    staleTime: Infinity,
  });

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const handleSend = () => {
    if (!isFormBusy) {
      toast.processing();
      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/einvoice/peppol/send'), {
        entity: 'credit',
        entity_id: credit?.id,
      })
        .then(() => {
          setTimeout(() => {
            queryClient.invalidateQueries(['/api/v1/credits', credit?.id]);
          }, 2000);
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
      <Link to={route('/credits/:id/edit', { id: credit?.id })}>
        {credit?.number}
      </Link>
    );

    const clientElement = (
      <Link to={route('/clients/:id', { id: credit?.client_id })}>
        {credit?.client?.display_name}
      </Link>
    );

    const notesElement = '';

    text = reactStringReplace(text, `:invoice`, () => invoiceElement);
    text = reactStringReplace(text, `:client`, () => clientElement);
    text = reactStringReplace(text, `:notes`, () => notesElement);

    return text;
  };

  return (
    <>
      {displayEInvoiceAndStatusCard ? (
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
          className="shadow-sm"
          style={{ borderColor: colors.$24 }}
          headerStyle={{ borderColor: colors.$20 }}
        >
          {Boolean(eInvoiceValidationEntityResponse && credit) && (
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
                            to={route('/credits/:id/edit', {
                              id: credit?.id,
                            })}
                          >
                            {t('edit_credit')}
                          </Link>
                        )}

                        {entity === 'client' && (
                          <Link
                            to={route('/clients/:id/edit', {
                              id: credit?.client_id,
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
      ) : null}

      {Boolean(
        [
          InvoiceStatus.Sent,
          InvoiceStatus.Draft,
          InvoiceStatus.Paid,
          InvoiceStatus.Partial,
        ].includes(
          (credit?.status_id?.toString() ??
            InvoiceStatus.Draft) as InvoiceStatus
        )
      ) &&
        displayEInvoiceAndStatusCard && (
          <Card title={t('status')}>
            <div className="px-6 text-sm">
              <div
                className="flex items-center space-x-4 border-l-2 pl-4 py-4"
                style={{
                  borderColor: colors.$5,
                }}
              >
                <div className="flex flex-col space-y-2.5">
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
                        <span className="font-medium">
                          {' '}
                          {activity.activity_type_id === 147
                            ? t('failure')
                            : t('success')}
                          :
                        </span>
                        <div>
                          {activity.notes.length > 1
                            ? activity.notes
                            : getActivityText(activity.activity_type_id)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {!credit?.backup?.guid && (
                <div className="flex items-center space-x-4 px-6 py-4">
                  <Button
                    behavior="button"
                    onClick={handleSend}
                    disabled={isFormBusy}
                    disableWithoutIcon
                  >
                    {t('send')}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

      {credit ? (
        <Card title={t('invoice_reference')}>
          <Element leftSide={t('invoice')}>
            <InvoiceSelector
              clientId={credit.client_id}
              value={
                get(
                  credit,
                  'e_invoice.CreditNote.BillingReference.0.InvoiceDocumentReference.ID',
                  ''
                ) as string | undefined
              }
              onChange={(value) => {
                const updatedCredit = cloneDeep(credit) as Credit;
                set(
                  updatedCredit,
                  'e_invoice.CreditNote.BillingReference.0.InvoiceDocumentReference.ID',
                  value.number
                );
                set(
                  updatedCredit,
                  'e_invoice.CreditNote.BillingReference.0.InvoiceDocumentReference.IssueDate',
                  value.date
                );
                setCredit(updatedCredit);
              }}
              onClearButtonClick={() => {
                const updatedCredit = cloneDeep(credit) as Credit;
                set(
                  updatedCredit,
                  'e_invoice.CreditNote.BillingReference.0.InvoiceDocumentReference.ID',
                  ''
                );
                set(
                  updatedCredit,
                  'e_invoice.CreditNote.BillingReference.0.InvoiceDocumentReference.IssueDate',
                  ''
                );
                setCredit(updatedCredit);
              }}
              errorMessage={
                errors?.errors?.[
                  'e_invoice.CreditNote.BillingReference.0.InvoiceDocumentReference.ID'
                ]
              }
            />
          </Element>
        </Card>
      ) : null}
    </>
  );
}
