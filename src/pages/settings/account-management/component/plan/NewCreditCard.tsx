/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { wait } from '$app/common/helpers/wait';
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Alert } from '$app/components/Alert';
import { Button } from '$app/components/forms';
import { Modal } from '$app/components/Modal';
import { loadStripe } from '@stripe/stripe-js/pure';
import { Stripe, StripeCardElement, StripeElements } from '@stripe/stripe-js';
import { AxiosResponse } from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

export interface PopupProps {
  visible: boolean;
  onClose: () => void;
}

export interface Intent {
  id: string;
  client_secret: string;
}

export interface NewCardProps {
  visible: boolean;
  onClose: () => void;
}

export function NewCreditCard({ visible, onClose }: NewCardProps) {
  const colors = useColorScheme();
  const company = useCurrentCompany();
  const queryClient = useQueryClient();
  const account = useCurrentAccount();

  const { t } = useTranslation();

  const [errors, setErrors] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [intent, setIntent] = useState<{
    intent: string;
    secret: string;
  } | null>(null);

  const [context, setContext] = useState<{
    stripe: Stripe;
    elements: StripeElements;
    card: StripeCardElement;
  } | null>(null);

  useEffect(() => {
    if (visible) {
      wait('#card-element').then(() => {
        loadStripe(import.meta.env.VITE_HOSTED_STRIPE_PK).then((stripe) => {
          if (!stripe) {
            return;
          }

          request(
            'POST',
            endpoint('/api/client/account_management/methods/intent'),
            {
              account_key: account.key,
            }
          )
            .then((response: AxiosResponse<Intent>) => {
              setIntent({
                intent: response.data.id,
                secret: response.data.client_secret,
              });

              const elements = stripe.elements();
              const card = elements.create('card');

              card.mount('#card-element');

              setContext({ stripe, elements, card });
            })
            .catch(() => null);
        });
      });
    }

    if (!visible) {
      queryClient.removeQueries({
        queryKey: ['account_management', 'intent', company?.id],
      });

      queryClient.invalidateQueries({
        queryKey: ['/api/client/account_management/methods'],
      });
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!context || !intent) {
      return;
    }

    setErrors(null);
    setIsSubmitting(true);

    context.stripe
      .confirmCardSetup(intent.secret, {
        payment_method: {
          card: context.card,
        },
      })
      .then((result) => {
        if (result.error && result.error.message) {
          setErrors(result.error.message);
          setIsSubmitting(false);

          return;
        }

        if (result.setupIntent && result.setupIntent.status === 'succeeded') {
          request(
            'POST',
            endpoint('/api/client/account_management/methods/confirm'),
            {
              account_key: account.key,
              gateway_response: result.setupIntent,
            }
          ).then(() => {
            toast.success(t('payment_method_added')!);

            setIsSubmitting(false);
            onClose();
          });
        }
      })
      .catch(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={t('add_payment_method')}
      disableClosing={isSubmitting}
    >
      {errors && <Alert type="danger">{errors}</Alert>}

      <div
        id="card-element"
        className="border p-4 rounded my-5"
        style={{ backgroundColor: colors.$1, borderColor: colors.$5 }}
      ></div>

      <div className="flex justify-end gap-2">
        <Button
          type="primary"
          behavior="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {t('continue')}
        </Button>
      </div>
    </Modal>
  );
}
