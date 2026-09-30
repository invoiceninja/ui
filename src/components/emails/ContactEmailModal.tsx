/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { route } from '$app/common/helpers/route';
import { Button } from '$app/components/forms';
import { Modal } from '$app/components/Modal';

interface Props {
  visible: boolean;
  onClose: () => void;
  relation: 'client' | 'vendor';
  relationId: string | undefined;
}

export function ContactEmailModal({
  visible,
  onClose,
  relation,
  relationId,
}: Props) {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const isVendor = relation === 'vendor';

  return (
    <Modal title={t('contact_email')} visible={visible} onClose={onClose}>
      <div className="flex flex-col items-center space-y-4">
        <span className="text-base font-medium">
          {isVendor ? t('vendor_email_not_set') : t('client_email_not_set')}.
        </span>

        <Button
          className="self-end"
          onClick={() => {
            navigate(
              route(isVendor ? '/vendors/:id/edit' : '/clients/:id/edit', {
                id: relationId,
              })
            );
            onClose();
          }}
        >
          {isVendor ? t('edit_vendor') : t('edit_client')}
        </Button>
      </div>
    </Modal>
  );
}
