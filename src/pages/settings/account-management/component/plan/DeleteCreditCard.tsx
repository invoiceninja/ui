/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { Button } from '$app/components/forms';
import { Modal } from '$app/components/Modal';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

interface DeleteCreditCardProps {
  gateway: CompanyGateway | null;
  visible: boolean;
  onClose: () => void;
}

export function DeleteCreditCard({
  gateway,
  visible,
  onClose,
}: DeleteCreditCardProps) {
  const { t } = useTranslation();
  const account = useCurrentAccount();
  const queryClient = useQueryClient();

  const form = useFormik({
    initialValues: {
      account_key: account.key,
    },
    onSubmit: (_, { setSubmitting }) => {
      if (!gateway) {
        return;
      }

      request(
        'DELETE',
        endpoint(`/api/client/account_management/methods/${gateway.id}`),
        {
          account_key: account.key,
        }
      )
        .then(() => {
          toast.success(t('payment_method_removed')!);

          queryClient.invalidateQueries({
            queryKey: ['/api/client/account_management/methods', account?.id],
          });

          onClose();
        })
        .finally(() => setSubmitting(false));
    },
  });

  return (
    <Modal visible={visible} onClose={onClose} disableClosing={form.isSubmitting}>
      <div className="px-5 text-center space-y-4 mb-4">
        <h4 className="font-semibold text-xl">
          Are you sure you want to delete the credit card?
        </h4>

        <p>You can add a card again at any time.</p>
      </div>

      <form className="flex justify-end gap-2" onSubmit={form.handleSubmit}>
        <Button type="primary" disabled={form.isSubmitting}>
          Delete
        </Button>
      </form>
    </Modal>
  );
}
