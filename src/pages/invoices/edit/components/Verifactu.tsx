
import { Invoice } from '$app/common/interfaces/invoice';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Card } from '$app/components/cards';
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
import { useColorScheme } from '$app/common/colors';
import reactStringReplace from 'react-string-replace';
import { Element } from '$app/components/cards';

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

const EINVOICE_ACTIVITY_TYPES = [150, 151, 152, 153] as number[];

export default function Verifactu() {
    const [t] = useTranslation();

    const context: Context = useOutletContext();

    const {
        invoice,
        eInvoiceValidationEntityResponse,
        setTriggerValidationQuery,
        setInvoice,
        errors,
    } = context;

    const colors = useColorScheme();
    const location = useLocation();
    
    const VALIDATION_ENTITIES = ['invoice', 'client', 'company'];

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
            location.pathname.includes('verifactu'),
        staleTime: Infinity,
    });
    

    const getActivityText = (activity: InvoiceActivity) => {
        let text = trans(
            `activity_${activity.activity_type_id}`,
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

        const notesElement = `[ ${activity.notes} ]`;

        text = reactStringReplace(text, `:invoice`, () => invoiceElement);
        text = reactStringReplace(text, `:client`, () => clientElement);
        text = reactStringReplace(text, `:notes`, () => notesElement);

        return text;
    };
    
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

            {Boolean([InvoiceStatus.Sent, InvoiceStatus.Draft, InvoiceStatus.Cancelled].includes((invoice?.status_id?.toString()) as InvoiceStatus)) && !invoice?.is_deleted&& (
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
                    <div className="mt-4 px-6 text-sm">
                        {activities
                            ?.filter((activity) =>
                                EINVOICE_ACTIVITY_TYPES.includes(
                                    activity.activity_type_id
                                )
                            )
                            .map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-center space-x-4 py-1"
                                >
                                    <span className="font-medium">{t('message')}:</span>
                                    <div>{getActivityText(activity)}</div>
                                </div>
                            ))}
                    </div>
                </Card>
            )}

            {/* Show the history of the invoice if it has a backup - can be parent or child invoice relations */}
            {invoice?.backup?.guid && (invoice.backup?.parent_invoice_id || (invoice.backup?.child_invoice_ids && invoice.backup?.child_invoice_ids?.length > 0)) &&(
                <Card title={t('history')}>

                {invoice.backup?.parent_invoice_id && (
                    <Element leftSide={t('linked_to')}>
                    <Link to={route('/invoices/:id/edit', { id: invoice.backup?.parent_invoice_id })}>{t('invoice')} {invoice.backup?.parent_invoice_number}</Link>
                    </Element>
                )}

                {invoice.backup?.child_invoice_ids && invoice.backup?.child_invoice_ids?.length > 0 && (
                    <Element leftSide="Factura Rectificativa">
                        <ul className="list-none space-y-4">
                        {invoice.backup?.child_invoice_ids.map((id) => (
                            <li key={id}>
                                <div className="flex items-start">
                                    <Link to={route('/invoices/:id/edit', { id })}>{t('invoice')}</Link>
                                </div>
                            </li>
                        ))}
                        </ul>
                    </Element>
                )}
                </Card>
            )}
        </>
    );
}