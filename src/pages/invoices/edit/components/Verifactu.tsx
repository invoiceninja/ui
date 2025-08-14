
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

export default function Verifactu() {
    const [t] = useTranslation();

    const context: Context = useOutletContext();

    const colors = useColorScheme();
    const VALIDATION_ENTITIES = ['invoice', 'client', 'company'];

    const {
        invoice,
        eInvoiceValidationEntityResponse,
        setTriggerValidationQuery,
        setInvoice,
        errors,
    } = context;

    return (
        <>
            <Card
                title={t('verifactu')}
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
        </>
    );
}