import { endpoint } from '$app/common/helpers';
import { wait } from '$app/common/helpers/wait';
import type { GatewayToken as ClientGatewayToken } from '$app/common/interfaces/client';
import { request } from '$app/common/helpers/request';
import { RadioGroup } from '@headlessui/react';
import { Alert } from '$app/components/Alert';
import { Spinner } from '$app/components/Spinner';
import { Button } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { MdCreditCard } from 'react-icons/md';

import type {
  Stripe,
  StripeCardElement,
  StripeElements,
  PaymentIntent as StripePaymentIntent,
} from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js/pure';
import type { AxiosError, AxiosResponse } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '$app/common/helpers/toast/toast';
import { useQueryClient } from 'react-query';
import { useDocuNinjaActions } from '$app/common/hooks/useDocuNinjaActions';

export interface ResponsePaymentIntent {
  requires_payment: boolean;
  client_secret: string;
  payment_hash?: string;
}

interface ApiError {
  message: string;
}

type PaymentSuccessResult = StripePaymentIntent | { status: 'succeeded' };

export interface PaymentProps {
  tokens: ClientGatewayToken[];
  amount_string?: string;
  paymentIntent?: ResponsePaymentIntent | null;
  onCreatePaymentIntent?: () => Promise<ResponsePaymentIntent>;
  onFinalizeStripePayment?: (
    paymentIntent: StripePaymentIntent
  ) => Promise<void> | void;
  onPaymentSuccess?: (result: PaymentSuccessResult) => void;
  onPaymentComplete?: () => void;
  onCancel?: () => void;
}

type PaymentMethod = 'new_card' | string;

type PaymentUiState =
  | 'payment_intent_pending'
  | 'stripe_confirmation_pending'
  | 'finalizing_payment'
  | 'payment_failed';

function getApiErrorMessage(error: unknown, fallback: string) {
  return (error as AxiosError<ApiError>).response?.data?.message || fallback;
}

function getStripePaymentMethodId(token: ClientGatewayToken) {
  return token.token;
}

export function PaymentMethodForm({
  tokens,
  amount_string,
  paymentIntent,
  onCreatePaymentIntent,
  onFinalizeStripePayment,
  onPaymentSuccess,
  onPaymentComplete,
  onCancel,
}: PaymentProps) {
  const { t } = useTranslation();
  const isDestroyed = useRef(false);

  const queryClient = useQueryClient();
  const { refresh } = useDocuNinjaActions();

  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>('new_card');
  const [errors, setErrors] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [intent, setIntent] = useState<{
    secret: string;
  } | null>(null);
  const [confirmedPaymentIntent, setConfirmedPaymentIntent] =
    useState<StripePaymentIntent | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentUiState | null>(null);

  const [context, setContext] = useState<{
    stripe: Stripe;
    elements: StripeElements;
    card: StripeCardElement;
  } | null>(null);

  const externalIntentSecret = paymentIntent?.client_secret;

  useEffect(() => {
    setSelectedMethod((current) => {
      if (
        current !== 'new_card' &&
        tokens?.some((token) => token.id === current)
      ) {
        return current;
      }

      return tokens?.find((token) => token.is_default)?.id || 'new_card';
    });
  }, [tokens]);

  useEffect(() => {
    if (externalIntentSecret) {
      setIntent({ secret: externalIntentSecret });
      setConfirmedPaymentIntent(null);
      setPaymentState(null);
      setErrors(null);
    }
  }, [externalIntentSecret]);

  const createIntent = () => {
    if (onCreatePaymentIntent) {
      return onCreatePaymentIntent();
    }

    return request(
      'POST',
      endpoint('/api/client/account_management/payment/intent'),
      {}
    ).then((response: AxiosResponse<ResponsePaymentIntent>) => response.data);
  };

  const resolvePaymentIntent = async () => {
    if (intent?.secret) {
      return intent;
    }

    setPaymentState('payment_intent_pending');

    try {
      const response = await createIntent();

      if (!response?.requires_payment || !response?.client_secret) {
        setErrors(t('no_payment_required') as string);
        setPaymentState('payment_failed');
        return null;
      }

      const resolvedIntent = { secret: response.client_secret };

      setIntent(resolvedIntent);
      setPaymentState(null);

      return resolvedIntent;
    } catch (error) {
      setErrors(
        getApiErrorMessage(error, t('payment_failed') as string) ||
          (t('payment_failed') as string)
      );
      setPaymentState('payment_failed');
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    if (selectedMethod === 'new_card') {
      if (!context) {
        wait('#card-element').then(() => {
          if (!mounted) {
            return;
          }

          loadStripe(import.meta.env.VITE_HOSTED_STRIPE_PK).then((stripe) => {
            if (!stripe || !mounted) {
              return;
            }

            const elements = stripe.elements();
            const card = elements.create('card');
            card.mount('#card-element');
            isDestroyed.current = false;
            setContext({ stripe, elements, card });

            if (externalIntentSecret) {
              setIntent({ secret: externalIntentSecret });
            }
          });
        });
      }
    } else {
      cleanupStripe();
    }

    return () => {
      mounted = false;

      if (selectedMethod !== 'new_card') {
        cleanupStripe();
      }
    };
  }, [selectedMethod, externalIntentSecret]);

  const handleMethodChange = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setErrors(null);
  };

  const cleanupStripe = () => {
    if (context?.card && !isDestroyed.current && !isSubmitting) {
      try {
        context.card.destroy();
      } catch (error) {
        console.error('Error destroying card:', error);
      }

      isDestroyed.current = true;
    }

    if (!isSubmitting) {
      setContext(null);
      setIntent(externalIntentSecret ? { secret: externalIntentSecret } : null);
      setErrors(null);
      setPaymentState(null);
    }
  };

  const runAccountPaymentSuccessSideEffects = () => {
    if (onFinalizeStripePayment) {
      return;
    }

    queryClient.invalidateQueries('/api/client/account_management/methods');
    queryClient.invalidateQueries('/api/docuninja/login');
    refresh();
  };

  const handleSuccessfulPayment = (result: PaymentSuccessResult) => {
    toast.success(t('payment_successful') as string);
    setIsSubmitting(false);
    setPaymentState(null);
    setConfirmedPaymentIntent(null);

    if (onPaymentSuccess) {
      onPaymentSuccess(result);
    }

    if (onPaymentComplete) {
      onPaymentComplete();
    }

    runAccountPaymentSuccessSideEffects();
  };

  const finalizeStripePayment = async (
    stripePaymentIntent: StripePaymentIntent
  ) => {
    if (onFinalizeStripePayment) {
      await onFinalizeStripePayment(stripePaymentIntent);
      return;
    }

    await request(
      'POST',
      endpoint('/api/client/account_management/v2/payment'),
      {
        payment_intent: stripePaymentIntent.id,
      }
    );
  };

  const handleStripePaymentIntent = async (
    stripePaymentIntent: StripePaymentIntent
  ) => {
    setConfirmedPaymentIntent(stripePaymentIntent);
    setPaymentState('finalizing_payment');

    try {
      await finalizeStripePayment(stripePaymentIntent);
      handleSuccessfulPayment(stripePaymentIntent);
    } catch (error) {
      setErrors(
        getApiErrorMessage(error, t('failed_payment') as string) ||
          'Failed to confirm payment'
      );
      setIsSubmitting(false);
      setPaymentState('payment_failed');
    }
  };

  const confirmNewCardPayment = async () => {
    const resolvedIntent = await resolvePaymentIntent();

    if (!context || !resolvedIntent) {
      setIsSubmitting(false);
      return;
    }

    setPaymentState('stripe_confirmation_pending');

    const result = await context.stripe.confirmCardPayment(
      resolvedIntent.secret,
      {
        payment_method: {
          card: context.card,
        },
      }
    );

    if (result.error) {
      setErrors(result.error.message || 'Payment failed');
      setIsSubmitting(false);
      setPaymentState('payment_failed');
      return;
    }

    if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
      await handleStripePaymentIntent(result.paymentIntent);
      return;
    }

    setErrors('Payment was not completed');
    setIsSubmitting(false);
    setPaymentState('payment_failed');
  };

  const confirmSavedTokenPaymentWithStripe = async (
    token: ClientGatewayToken
  ) => {
    const paymentMethodId = getStripePaymentMethodId(token);

    if (!paymentMethodId) {
      setErrors(t('payment_failed') as string);
      setIsSubmitting(false);
      setPaymentState('payment_failed');
      return;
    }

    const resolvedIntent = await resolvePaymentIntent();

    if (!resolvedIntent) {
      setIsSubmitting(false);
      return;
    }

    const stripe =
      context?.stripe ||
      (await loadStripe(import.meta.env.VITE_HOSTED_STRIPE_PK));

    if (!stripe) {
      setErrors(t('payment_failed') as string);
      setIsSubmitting(false);
      setPaymentState('payment_failed');
      return;
    }

    setPaymentState('stripe_confirmation_pending');

    const result = await stripe.confirmCardPayment(resolvedIntent.secret, {
      payment_method: paymentMethodId,
    });

    if (result.error) {
      setErrors(result.error.message || 'Payment failed');
      setIsSubmitting(false);
      setPaymentState('payment_failed');
      return;
    }

    if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
      await handleStripePaymentIntent(result.paymentIntent);
      return;
    }

    setErrors('Payment was not completed');
    setIsSubmitting(false);
    setPaymentState('payment_failed');
  };

  const handleSubmit = async () => {
    setErrors(null);
    setIsSubmitting(true);

    try {
      if (confirmedPaymentIntent) {
        await handleStripePaymentIntent(confirmedPaymentIntent);
        return;
      }

      if (selectedMethod === 'new_card') {
        await confirmNewCardPayment();
        return;
      }

      const token = tokens.find(({ id }) => id === selectedMethod);

      if (!token) {
        setErrors(t('payment_failed') as string);
        setIsSubmitting(false);
        setPaymentState('payment_failed');
        return;
      }

      await confirmSavedTokenPaymentWithStripe(token);
    } catch {
      setErrors('An unexpected error occurred');
      setIsSubmitting(false);
      setPaymentState('payment_failed');
    }
  };

  const isWaitingForIntent = paymentState === 'payment_intent_pending';
  const isPaymentReady = selectedMethod !== 'new_card' || Boolean(context);

  return (
    <div className="pl-4 pr-4">
      <div className="text-lg font-semibold">
        <p className="text-sm text-gray-500">{t('payment_amount')}</p>
        <p className="text-lg font-semibold">{amount_string}</p>
      </div>

      {errors && <Alert type="error">{errors}</Alert>}

      <div className="space-y-4">
        <RadioGroup value={selectedMethod} onChange={handleMethodChange}>
          <RadioGroup.Label className="sr-only">
            Payment Method
          </RadioGroup.Label>
          <div className="space-y-2">
            {tokens?.map((token: ClientGatewayToken) => (
              <RadioGroup.Option key={token.id} value={token.id}>
                {({ active, checked }) => (
                  <div
                    className={`${
                      active
                        ? 'ring-2 ring-primary ring-opacity-60 ring-offset-2'
                        : ''
                    }
                                        ${
                                          checked
                                            ? 'bg-gray-50 border-primary border-2'
                                            : 'bg-white border border-gray-200'
                                        }
                                        relative flex cursor-pointer rounded-lg px-5 py-4 shadow-sm focus:outline-none`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center">
                        <div className="text-sm">
                          <div className="flex items-center space-x-2">
                            <Icon element={MdCreditCard} size={16} />
                            <span
                              className={
                                checked
                                  ? 'text-primary font-medium'
                                  : 'text-gray-900'
                              }
                            >
                              {token.meta.brand} ending in {token.meta.last4}
                              {token.is_default && ' (Default)'}
                            </span>
                          </div>
                        </div>
                      </div>
                      {checked && (
                        <div className="shrink-0 text-primary">
                          <svg
                            className="h-6 w-6"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              cx={12}
                              cy={12}
                              r={12}
                              fill="currentColor"
                              fillOpacity="0.2"
                            />
                            <path
                              d="M7 13l3 3 7-7"
                              stroke="currentColor"
                              strokeWidth={1.5}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
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
                    active
                      ? 'ring-2 ring-primary ring-opacity-60 ring-offset-2'
                      : ''
                  }
                                    ${
                                      checked
                                        ? 'bg-gray-50 border-primary border-2'
                                        : 'bg-white border border-gray-200'
                                    }
                                    relative flex cursor-pointer rounded-lg px-5 py-4 shadow-sm focus:outline-none`}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <span
                          className={
                            checked
                              ? 'text-primary font-medium'
                              : 'text-gray-900'
                          }
                        >
                          {t('add_payment_method')}
                        </span>
                      </div>
                    </div>
                    {checked && (
                      <div className="shrink-0 text-primary">
                        <svg
                          className="h-6 w-6"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx={12}
                            cy={12}
                            r={12}
                            fill="currentColor"
                            fillOpacity="0.2"
                          />
                          <path
                            d="M7 13l3 3 7-7"
                            stroke="currentColor"
                            strokeWidth={1.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
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

      {selectedMethod === 'new_card' && (
        <div
          id="card-element"
          className="border p-4 rounded"
          style={{ backgroundColor: 'white', borderColor: '#e2e8f0' }}
        />
      )}

      <div className="flex justify-end gap-2 mt-2">
        <button
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('cancel')}
        </button>
        <Button
          type="primary"
          behavior="button"
          onClick={handleSubmit}
          disabled={isSubmitting || isWaitingForIntent || !isPaymentReady}
        >
          {isSubmitting || isWaitingForIntent ? (
            <div className="flex items-center space-x-2">
              <Spinner variant="dark" />
              <span>{t('processing')}</span>
            </div>
          ) : (
            t('pay_now')
          )}
        </Button>
      </div>
    </div>
  );
}
