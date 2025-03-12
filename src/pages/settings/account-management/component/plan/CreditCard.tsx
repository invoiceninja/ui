/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from "$app/common/colors";
import { endpoint } from "$app/common/helpers";
import { request } from "$app/common/helpers/request";
import { toast } from "$app/common/helpers/toast/toast";
import { useAccentColor } from "$app/common/hooks/useAccentColor";
import { useCurrentAccount } from "$app/common/hooks/useCurrentAccount";
import { CompanyGateway } from "$app/common/interfaces/company-gateway";
import { Badge } from "$app/components/Badge";
import { Button } from "$app/components/forms";
import { Modal } from "$app/components/Modal";
import { useFormik } from "formik";
import { useState } from "react";
import { Check, Trash2 } from "react-feather";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import visa from '/gateway-card-images/visa.png?url';
import mc from '/gateway-card-images/mastercard.png?url';

interface CreditCardProps {
  gateway: CompanyGateway;
  onDelete: () => void;
}

export function CreditCard({ gateway, onDelete }: CreditCardProps) {
  const accentColor = useAccentColor();
  const colors = useColorScheme();
  const account = useCurrentAccount();
  const queryClient = useQueryClient();

  const image = () => {
    if (gateway.meta.brand === 'visa') {
      return visa;
    }

    if (gateway.meta.brand === 'mastercard') {
      return mc;
    }
  };

  const { t } = useTranslation();

  const [defaultPopupVisible, setDefaultPopupVisible] = useState(false);

  const form = useFormik({
    initialValues: {},
    onSubmit: (_, { setSubmitting }) => {
      toast.processing();

      request(
        'POST',
        endpoint(`/api/client/account_management/methods/${gateway.id}/default`),
        {
          account_key: account.key,
        }
      )
        .then(() => {
          toast.success();

          queryClient.invalidateQueries({
            queryKey: ['/api/client/account_management/methods', account?.id],
          });

          setDefaultPopupVisible(false);
        })
        .finally(() => setSubmitting(false));
    },
  });

  return (
    <>
      <Modal
        title={t('default_payment_method_label')}
        visible={defaultPopupVisible}
        onClose={() => setDefaultPopupVisible(false)}
      >
        <p>{t('default_payment_method')}</p>

        <div className="flex justify-end gap-2">
          <Button
            type="secondary"
            behavior="button"
            onClick={() => setDefaultPopupVisible(false)}
          >
            {t('cancel')}
          </Button>

          <form onSubmit={form.handleSubmit}>
            <Button type="primary">{t('continue')}</Button>
          </form>
        </div>
      </Modal>

      <div
        className="flex flex-col w-full lg:w-72 p-4 rounded border"
        style={{ borderColor: gateway.is_default ? accentColor : colors.$11 }}
      >
        <div className="flex justify-between items-center">
          <img src={image()} alt={gateway.meta.brand} className="h-10" />

          <div className="flex items-center gap-2">
            {gateway.is_default ? (
              <Badge variant="primary">Default</Badge>
            ) : (
              <button
                type="button"
                className="bg-white p-1 rounded-full cursor-pointer"
                onClick={() => setDefaultPopupVisible(true)}
              >
                <Check size={18} />
              </button>
            )}

            <button
              type="button"
              className="bg-white p-1 rounded-full cursor-pointer"
              onClick={onDelete}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="space-x-1 flex items-center my-4 font-bold">
          <span>****</span>
          <span>****</span>
          <span>****</span>
          <span>{gateway.meta.last4}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <p>Valid through</p>
          <p>
            {gateway.meta.exp_month}/{gateway.meta.exp_year}
          </p>
        </div>
      </div>
    </>
  );
}
