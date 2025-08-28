import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Document } from '$app/common/interfaces/docuninja/api';
import { Divider } from '$app/components/cards/Divider';
import { Button } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Modal } from '$app/components/Modal';
import collect from 'collect.js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdSend } from 'react-icons/md';
import { useIsSendable } from '../hooks/useIsSendable';
import { useColorScheme } from '$app/common/colors';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';

interface Props {
  document: Document;
  renderAsDropdownElement?: boolean;
}

export function SendInvitationsModal({
  document,
  renderAsDropdownElement = false,
}: Props) {
  const { t } = useTranslation();

  const colors = useColorScheme();

  const isSendable = useIsSendable();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleSend = () => {
    if (isFormBusy) return;

    if (!document) {
      toast.error('document_not_found');
      return;
    }

    setIsFormBusy(true);

    request(
      'POST',
      docuNinjaEndpoint(`/api/documents/${document.id}/send`),
      {
        invitations: document.invitations || [],
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
        },
      }
    )
      .then(() => {
        $refetch(['docuninja_documents']);
        toast.success('document_queued_for_sending');
        setIsModalOpen(false);
      })
      .finally(() => setIsFormBusy(false));
  };

  const pending = collect(document.invitations).filter(
    (i) => i.signed_date === null
  );
  const signed = collect(document.invitations).filter(
    (i) => i.signed_date !== null
  );

  return (
    <>
      {isSendable(document) && renderAsDropdownElement && (
        <DropdownElement
          icon={<Icon element={MdSend} />}
          disabled={isFormBusy}
          onClick={() => setIsModalOpen(true)}
        >
          {t('send')}
        </DropdownElement>
      )}

      {isSendable(document) && !renderAsDropdownElement && (
        <Button
          type="secondary"
          behavior="button"
          onClick={() => setIsModalOpen(true)}
          disabled={isFormBusy}
          disableWithoutIcon
        >
          <div>
            <Icon element={MdSend} />
          </div>

          <span style={{ color: colors.$3 }}>{t('send')}</span>
        </Button>
      )}

      <Modal
        title={t('send_invitations')}
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        {pending.count() > 0 ? (
          <>
            <span className="text-sm leading-none" style={{ color: colors.$3 }}>
              {t('send_invitations_to')}:
            </span>

            <ul className="text-sm font-medium leading-none space-y-2">
              {pending.map((invitation) => (
                <li
                  key={invitation.id}
                  className="flex items-center gap-1 truncate"
                  style={{ color: colors.$3 }}
                >
                  <span>-</span>
                  <span>
                    {invitation.entity === 'user' ? (
                      <span>
                        {invitation.user?.first_name}{' '}
                        {invitation.user?.last_name} &mdash;{' '}
                        {invitation.user?.email}
                      </span>
                    ) : (
                      invitation.contact?.email
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {pending.count() > 0 && signed.count() > 0 ? (
          <Divider className="py-2" />
        ) : null}

        {signed.count() > 0 ? (
          <>
            <span className="text-sm leading-none" style={{ color: colors.$3 }}>
              {t('users_already_signed')}:
            </span>

            <ul className="text-sm font-medium leading-none">
              {signed.map((invitation) => (
                <li
                  key={invitation.id}
                  className="flex items-center gap-1 truncate"
                  style={{ color: colors.$3 }}
                >
                  <span>-</span>

                  <span>
                    {invitation.entity === 'user' ? (
                      <span>
                        {invitation.user?.first_name}{' '}
                        {invitation.user?.last_name} &mdash;{' '}
                        {invitation.user?.email}
                      </span>
                    ) : (
                      invitation.contact?.email
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <div className="w-full pt-3">
          <Button
            className="w-full"
            behavior="button"
            disabled={isFormBusy}
            onClick={handleSend}
          >
            {isFormBusy ? t('sending') : t('send')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
