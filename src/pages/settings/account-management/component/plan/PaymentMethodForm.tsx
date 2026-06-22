import { endpoint } from "$app/common/helpers";
import { wait } from "$app/common/helpers/wait";
import { GatewayToken } from "$app/common/interfaces/client";
import { request } from '$app/common/helpers/request';
import { RadioGroup } from "@headlessui/react";
import { Alert } from "$app/components/Alert";
import { Spinner } from "$app/components/Spinner";
import { Button } from "$app/components/forms";
import { Icon } from "$app/components/icons/Icon";
import { MdCreditCard } from "react-icons/md";

import type {
    Stripe,
    StripeCardElement,
    StripeElements,
    PaymentIntent as StripePaymentIntent,
} from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js/pure";
import type { AxiosError, AxiosResponse } from "axios";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "$app/common/helpers/toast/toast";
import { useQueryClient } from "react-query";
import { useDocuNinjaActions } from "$app/common/hooks/useDocuNinjaActions";

export interface ResponsePaymentIntent {
    requires_payment: boolean;
    client_secret: string;
}

interface ApiError {
    message: string;
}

type PaymentSuccessResult =
    | StripePaymentIntent
    | { status: "succeeded" };

export interface PaymentProps {
    tokens: GatewayToken[];
    amount_string?: string;
    onPaymentSuccess?: (result: PaymentSuccessResult) => void;
    onPaymentComplete?: () => void;
    onCancel?: () => void;
}

type PaymentMethod = "new_card" | string; // string will be gateway token id

type PaymentUiState =
    | "payment_intent_pending"
    | "stripe_confirmation_pending"
    | "finalizing_plan_change"
    | "plan_change_failed";

export function PaymentMethodForm({
    tokens,
    amount_string,
    onPaymentSuccess,
    onPaymentComplete,
    onCancel,
}: PaymentProps) {
    const { t } = useTranslation();
    const isDestroyed = useRef(false);

    const queryClient = useQueryClient();
    const { refresh } = useDocuNinjaActions();

    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("new_card");
    const [errors, setErrors] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [intent, setIntent] = useState<{
        secret: string;
    } | null>(null);
    const [paymentState, setPaymentState] = useState<PaymentUiState | null>(null);

    const [context, setContext] = useState<{
        stripe: Stripe;
        elements: StripeElements;
        card: StripeCardElement;
    } | null>(null);

    // Initial token selection
    useEffect(() => {
        if (tokens?.length > 0) {
            const defaultToken = tokens.find((token) => token.is_default);
            if (defaultToken) {
                setSelectedMethod(defaultToken.id);
            }
        } else {
            setSelectedMethod("new_card");
        }
    }, [tokens]);

    // Stripe initialization and intent creation only when new_card is selected
    useEffect(() => {
        let mounted = true;

        if (selectedMethod === "new_card") {
            if (!context) {
                wait("#card-element").then(() => {
                    if (!mounted) return;

                    loadStripe(import.meta.env.VITE_HOSTED_STRIPE_PK).then((stripe) => {
                        if (!stripe || !mounted) return;

                        const elements = stripe.elements();
                        const card = elements.create("card");
                        card.mount("#card-element");
                        isDestroyed.current = false;
                        setContext({ stripe, elements, card });

                        setPaymentState("payment_intent_pending");

                        request('POST', endpoint('/api/client/account_management/payment/intent'), {})
                        .then((response: AxiosResponse<ResponsePaymentIntent>) => {
                            if (!mounted) return;

                            if (!response.data?.requires_payment || !response.data?.client_secret) {
                                setErrors(t("no_payment_required") as string);
                                setPaymentState("plan_change_failed");
                                return;
                            }

                            setIntent({
                                secret: response.data.client_secret,
                            });
                            setPaymentState(null);
                        })
                        .catch((error: AxiosError<ApiError>) => {
                            if (!mounted) return;
                            setErrors(
                                error.response?.data?.message ||
                                t("payment_failed"),
                            );
                            setPaymentState("plan_change_failed");
                        });
                    });
                });
            }
        } else {
            cleanupStripe();
        }

        return () => {
            mounted = false;
            if (selectedMethod !== "new_card") {
                cleanupStripe();
            }
        };
    }, [selectedMethod]);

    const handleMethodChange = (method: PaymentMethod) => {
        setSelectedMethod(method);
    };

    const cleanupStripe = () => {
        if (context?.card && !isDestroyed.current && !isSubmitting) {
            try {
                context.card.destroy();
            } catch (e) {
                console.error("Error destroying card:", e);
            }
            isDestroyed.current = true;
        }
        if (!isSubmitting) {
            setContext(null);
            setIntent(null);
            setErrors(null);
            setPaymentState(null);
        }
    };

    const handleSubmit = () => {
        if (selectedMethod === "new_card") {
            if (!context || !intent) {
                return;
            }

            setErrors(null);
            setIsSubmitting(true);
            setPaymentState("stripe_confirmation_pending");

            context.stripe
                .confirmCardPayment(intent.secret, {
                    payment_method: {
                        card: context.card,
                    },
                })
                .then((result) => {
                    if (result.error) {
                        setErrors(result.error.message || "Payment failed");
                        setIsSubmitting(false);
                        setPaymentState("plan_change_failed");
                        return;
                    }

                    if (
                        result.paymentIntent &&
                        result.paymentIntent.status === "succeeded"
                    ) {
                        setPaymentState("finalizing_plan_change");
                        request('POST', endpoint('/api/client/account_management/v2/payment'), {
                                payment_intent: result.paymentIntent.id
                            })
                            .then(() => {
                                toast.success(t("payment_successful") as string);
                                setIsSubmitting(false);
                                setPaymentState(null);
                                if (onPaymentSuccess) {
                                    onPaymentSuccess(result.paymentIntent);
                                }
                                if (onPaymentComplete) {
                                    onPaymentComplete();
                                }
                                queryClient.invalidateQueries('/api/client/account_management/methods');
                                // Invalidate DocuNinja login query to refresh account data
                                queryClient.invalidateQueries('/api/docuninja/login');
                                // Force DocuNinja service to reinitialize
                                refresh();
                            })
                            .catch((error: AxiosError<ApiError>) => {
                                setErrors(
                                    error.response?.data?.message || "Failed to confirm payment",
                                );
                                setIsSubmitting(false);
                                setPaymentState("plan_change_failed");
                            });
                        return;
                    }

                    setErrors("Payment was not completed");
                    setIsSubmitting(false);
                    setPaymentState("plan_change_failed");
                })
                .catch(() => {
                    setErrors("An unexpected error occurred");
                    setIsSubmitting(false);
                    setPaymentState("plan_change_failed");
                });
        } else {
            // Using existing payment method
            setIsSubmitting(true);
            setPaymentState("finalizing_plan_change");
            request('POST', endpoint('/api/client/account_management/v2/payment/token'), {
                    gateway_token_id: selectedMethod
                })
                .then(() => {
                    toast.success(t("payment_successful") as string);
                    setIsSubmitting(false);
                    setPaymentState(null);
                    if (onPaymentSuccess) {
                        onPaymentSuccess({ status: "succeeded" });
                    }
                    if (onPaymentComplete) {
                        onPaymentComplete();
                    }
                    // Invalidate DocuNinja login query to refresh account data
                    queryClient.invalidateQueries('/api/docuninja/login');
                    // Force DocuNinja service to reinitialize
                    refresh();
                })
                .catch((error: AxiosError<ApiError>) => {
                    setErrors(
                        error.response?.data?.message || "Failed to process payment",
                    );
                    setIsSubmitting(false);
                    setPaymentState("plan_change_failed");
                });
        }
    };

    const isWaitingForIntent = selectedMethod === "new_card" && paymentState === "payment_intent_pending";
    const isNewCardReady = selectedMethod !== "new_card" || Boolean(intent);

    return (
        <div className="pl-4 pr-4">
            <div className="text-lg font-semibold">
                <p className="text-sm text-gray-500">
                    {t("payment_amount")}
                </p>
                <p className="text-lg font-semibold">
                    {amount_string}
                </p>
            </div>

            {errors && (
                <Alert type="error">
                    {errors}
                </Alert>
            )}

            <div className="space-y-4">
                <RadioGroup value={selectedMethod} onChange={handleMethodChange}>
                    <RadioGroup.Label className="sr-only">Payment Method</RadioGroup.Label>
                    <div className="space-y-2">
                        {tokens?.map((token: GatewayToken) => (
                            <RadioGroup.Option
                                key={token.id}
                                value={token.id}
                            >
                                {({ active, checked }) => (
                                    <div
                                        className={`${
                                            active ? 'ring-2 ring-primary ring-opacity-60 ring-offset-2' : ''
                                        }
                                        ${
                                            checked ? 'bg-gray-50 border-primary border-2' : 'bg-white border border-gray-200'
                                        }
                                        relative flex cursor-pointer rounded-lg px-5 py-4 shadow-sm focus:outline-none`}
                                    >
                                        <div className="flex w-full items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="text-sm">
                                                    <div className="flex items-center space-x-2">
                                                        <Icon element={MdCreditCard} size={16} />
                                                        <span className={checked ? 'text-primary font-medium' : 'text-gray-900'}>
                                                            {token.meta.brand} ending in {token.meta.last4}
                                                            {token.is_default && " (Default)"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {checked && (
                                                <div className="shrink-0 text-primary">
                                                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                                                        <circle cx={12} cy={12} r={12} fill="currentColor" fillOpacity="0.2" />
                                                        <path d="M7 13l3 3 7-7" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </RadioGroup.Option>
                        ))}
                        
                        <RadioGroup.Option value="new_card">
                            {({ active, checked }) => (
                                <div
                                    className={`${
                                        active ? 'ring-2 ring-primary ring-opacity-60 ring-offset-2' : ''
                                    }
                                    ${
                                        checked ? 'bg-gray-50 border-primary border-2' : 'bg-white border border-gray-200'
                                    }
                                    relative flex cursor-pointer rounded-lg px-5 py-4 shadow-sm focus:outline-none`}
                                >
                                    <div className="flex w-full items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="text-sm">
                                                <span className={checked ? 'text-primary font-medium' : 'text-gray-900'}>
                                                    {t("add_payment_method")}
                                                </span>
                                            </div>
                                        </div>
                                        {checked && (
                                            <div className="shrink-0 text-primary">
                                                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                                                    <circle cx={12} cy={12} r={12} fill="currentColor" fillOpacity="0.2" />
                                                    <path d="M7 13l3 3 7-7" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </RadioGroup.Option>
                    </div>
                </RadioGroup>
            </div>

            {selectedMethod === "new_card" && (
                <div
                    id="card-element"
                    className="border p-4 rounded"
                    style={{ backgroundColor: "white", borderColor: "#e2e8f0" }}
                />
            )}

            <div className="flex justify-end gap-2 mt-2">
                <button
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    {t("cancel")}
                </button>
                <Button
                    type="primary"
                    onClick={handleSubmit}
                    disabled={isSubmitting || isWaitingForIntent || !isNewCardReady}
                >
                    {isSubmitting || isWaitingForIntent ? (
                        <div className="flex items-center space-x-2">
                            <Spinner variant="dark" />
                            <span>{t("processing")}</span>
                        </div>
                    ) : (
                        t("pay_now")
                    )}
                </Button>
            </div>
        </div>
    );
}
