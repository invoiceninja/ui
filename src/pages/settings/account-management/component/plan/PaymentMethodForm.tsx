import { endpoint } from "$app/common/helpers";
import { wait } from "$app/common/helpers/wait";
import { useCurrentAccount } from "$app/common/hooks/useCurrentAccount";
import { GatewayToken } from "$app/common/interfaces/client";
import { request } from '$app/common/helpers/request';
import { RadioGroup } from "@headlessui/react";
import { Alert } from "$app/components/Alert";
import { Spinner } from "$app/components/Spinner";
import { Button } from "$app/components/forms";
import { Icon } from "$app/components/icons/Icon";
import { MdCreditCard } from "react-icons/md";
import { useLogin } from "$app/pages/authentication/common/hooks";

import type {
    Stripe,
    StripeCardElement,
    StripeElements,
    PaymentIntent as StripePaymentIntent,
} from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js/pure";
import type { AxiosError, AxiosResponse } from "axios";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "$app/common/helpers/toast/toast";

export interface ResponsePaymentIntent {
    id: string;
    client_secret: string;
    amount: number;
    currency: string;
    upgraded: boolean;
}

interface ApiError {
    message: string;
}

export interface PaymentIntent {
    id: string;
    client_secret: string;
    amount: number;
    currency: string;
    upgraded: boolean;
}

type PaymentSuccessResult =
    | StripePaymentIntent
    | PaymentIntent
    | { status: "succeeded" };

export interface PaymentProps {
    tokens: GatewayToken[];
    num_users?: number;
    amount_string?: string;
    amount_raw?: number;
    onPaymentSuccess?: (result: PaymentSuccessResult) => void;
    onPaymentComplete?: () => void;
    onCancel?: () => void;
}

type PaymentMethod = "new_card" | string; // string will be gateway token id

export function PaymentMethodForm({
    tokens,
    num_users,
    amount_string,
    amount_raw,
    onPaymentSuccess,
    onPaymentComplete,
    onCancel,
}: PaymentProps) {
    const account = useCurrentAccount();
    const { t } = useTranslation();
    const isDestroyed = useRef(false);
    const handleLogin = useLogin();

    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("new_card");
    const [errors, setErrors] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [amount, setAmount] = useState<number>(0);
    const [intent, setIntent] = useState<{
        intent: string;
        secret: string;
    } | null>(null);

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
                        setContext({ stripe, elements, card });

                        // Only create payment intent for new cards
                        request('POST', endpoint('/api/client/account_management/payment/intent'), {
                            num_users: num_users ?? 1,
                            amount: amount_raw ?? 0,
                            product: "docuninja_users",
                        })
                        .then((response: AxiosResponse<ResponsePaymentIntent>) => {
                            if (!mounted) return;

                            if (response.data?.upgraded === true) {
                                if (onPaymentSuccess) {
                                    onPaymentSuccess(response.data);
                                }
                                return;
                            }

                            setIntent({
                                intent: response.data.id,
                                secret: response.data.client_secret,
                            });
                            setAmount(response.data.amount);
                        })
                        .catch((error: AxiosError<ApiError>) => {
                            if (!mounted) return;
                            setErrors(
                                error.response?.data?.message ||
                                "Failed to initialize payment",
                            );
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
        if (method !== "new_card") {
            // Set the amount directly for token payments
            setAmount(amount_raw ?? 0);
        }
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
        }
    };

    const handleSubmit = () => {
        if (selectedMethod === "new_card") {
            if (!context || !intent) {
                return;
            }

            setErrors(null);
            setIsSubmitting(true);

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
                        return;
                    }

                    if (
                        result.paymentIntent &&
                        result.paymentIntent.status === "succeeded"
                    ) {
                        request('POST', endpoint('/api/client/account_management/docuninja/upgrade'), {
                                payment_intent: result.paymentIntent.id,
                                num_users: num_users,
                                amount: amount_raw ?? 0,
                                product: "docuninja_users",
                            })
                            .then(() => {
                                toast.success(t("payment_successful") as string);
                                if (onPaymentSuccess) {
                                    onPaymentSuccess(result.paymentIntent);
                                }
                                if (onPaymentComplete) {
                                    onPaymentComplete();
                                }
                                setIsSubmitting(false);
                            })
                            .catch((error: AxiosError<ApiError>) => {
                                setErrors(
                                    error.response?.data?.message || "Failed to confirm payment",
                                );
                                setIsSubmitting(false);
                            });
                    }
                })
                .catch(() => {
                    setErrors("An unexpected error occurred");
                    setIsSubmitting(false);
                });
        } else {
            // Using existing payment method
            setIsSubmitting(true);
            request('POST', endpoint('/api/client/account_management/payment/token'), {
                    gateway_token_id: selectedMethod,
                    num_users: num_users,
                    amount: amount_raw ?? 0,
                    product: "docuninja_users",
                })
                .then(() => {
                    toast.success(t("payment_successful") as string);
                    if (onPaymentSuccess) {
                        onPaymentSuccess({ status: "succeeded" });
                    }
                    if (onPaymentComplete) {
                        onPaymentComplete();
                    }
                    setIsSubmitting(false);
                })
                .catch((error: AxiosError<ApiError>) => {
                    setErrors(
                        error.response?.data?.message || "Failed to process payment",
                    );
                    setIsSubmitting(false);
                });
        }
    };

    return (
        <div className="space-y-4">
            <div className="text-lg font-semibold">
                <p className="text-sm text-gray-500">
                    {t("payment_amount")}
                </p>
                {selectedMethod === "new_card" ? (
                    amount === 0 ? (
                        <div className="flex items-center justify-center">
                            <Spinner variant="dark" />
                        </div>
                    ) : (
                        <p className="text-lg font-semibold">
                            {amount_string}
                        </p>
                    )
                ) : (
                    <p className="text-lg font-semibold">
                        {amount_string}
                    </p>
                )}
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

            <div className="flex justify-end gap-2">
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
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
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
