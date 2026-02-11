/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Calendar } from 'react-feather';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '$app/common/helpers/toast/toast';
import { Badge } from '$app/components/Badge';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { date, docuNinjaEndpoint } from '$app/common/helpers';
import {
  type Document as DocumentType,
  type DocumentInvitation,
  DocumentStatus,
} from '$app/common/interfaces/docuninja/api';
import { route } from '$app/common/helpers/route';
import styled from 'styled-components';
import { useColorScheme } from '$app/common/colors';
import { Plus } from '$app/components/icons/Plus';
import { useNavigate } from 'react-router-dom';
import { Button } from '$app/components/forms';
import { MdSend } from 'react-icons/md';
import { Icon } from '$app/components/icons/Icon';
import { request } from '$app/common/helpers/request';
import { $refetch } from '$app/common/hooks/useRefetch';
import classNames from 'classnames';

type InvitationsProps = {
  document: DocumentType;
};

const Box = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

export function Invitations({ document }: InvitationsProps) {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const colors = useColorScheme();

  if (!document.invitations?.length) {
    return (
      <Box
        className="flex flex-col space-y-4 items-center justify-center border-dashed border p-6 rounded-md cursor-pointer h-48 min-w-64"
        theme={{
          backgroundColor: colors.$1,
          hoverBackgroundColor: colors.$20,
        }}
        style={{ borderColor: colors.$5 }}
        onClick={() =>
          navigate(route('/docuninja/:id/builder', { id: document.id }))
        }
      >
        <Plus size="2rem" color={colors.$3} />

        <span style={{ color: colors.$3 }}>{t('add_signatories')}</span>
      </Box>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {document.invitations?.map((invitation: DocumentInvitation) => (
        <Invitation
          key={invitation.id}
          invitation={invitation}
          document={document}
        />
      ))}
    </div>
  );
}

type InvitationProps = {
  invitation: DocumentInvitation;
  document: DocumentType;
};

function Invitation({ invitation, document }: InvitationProps) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const [isSendingInvitation, setIsSendingInvitation] =
    useState<boolean>(false);

  const getInvitationStatus = (invitation: DocumentInvitation) => {
    if (invitation.signed_date) {
      return <Badge variant="green">{t('signed')}</Badge>;
    }

    if (invitation.viewed_date) {
      return <Badge variant="yellow">{t('viewed')}</Badge>;
    }

    if (invitation.sent_date) {
      return <Badge variant="dark-blue">{t('sent')}</Badge>;
    }

    return <Badge variant="primary">{t('pending')}</Badge>;
  };

  const getInvitationDate = (invitation: DocumentInvitation) => {
    let dateString = '';
    let label = '';

    if (invitation.signed_date) {
      dateString = invitation.signed_date;
      label = t('signed');
    } else if (invitation.viewed_date) {
      dateString = invitation.viewed_date;
      label = t('viewed');
    } else if (invitation.sent_date) {
      dateString = invitation.sent_date;
      label = t('sent');
    } else {
      dateString = invitation.created_at;
      label = t('created');
    }

    return (
      <div className="flex items-center gap-x-4 text-sm">
        <div className="flex items-center gap-x-2">
          <div>
            <Icon className="w-5 h-5" element={Calendar} />
          </div>

          <span>{label}:</span>
        </div>

        <span>{date(dateString, dateFormat)}</span>
      </div>
    );
  };

  const getName = (invitation: DocumentInvitation) => {
    if (invitation.entity === 'contact') {
      return invitation.contact?.first_name && invitation.contact?.last_name
        ? `${invitation.contact.first_name} ${invitation.contact.last_name}`
        : invitation.contact?.email || 'Contact';
    } else {
      return invitation.user?.first_name && invitation.user?.last_name
        ? `${invitation.user.first_name} ${invitation.user.last_name}`
        : invitation.user?.email || 'User';
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/docuninja/sign/${document.id}/${invitation.id}`;
    navigator.clipboard.writeText(link);
    toast.success(t('link_copied') || 'Link copied to clipboard');
  };

  const handleSendInvitation = () => {
    if (!isSendingInvitation) {
      toast.processing();
      setIsSendingInvitation(true);

      request(
        'POST',
        docuNinjaEndpoint('/api/documents/:id/send', {
          id: document.id,
        }),
        {
          invitations: [invitation],
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      )
        .then(() => {
          $refetch(['docuninja_documents']);

          toast.success('document_queued_for_sending');
        })
        .finally(() => setIsSendingInvitation(false));
    }
  };

  const getEntityLink = () => {
    if (invitation.entity === 'contact' && invitation.client_id) {
      return route('/clients/:id', { id: invitation.client_id });
    } else if (invitation.entity === 'user' && invitation.user_id) {
      return route('/settings/users/:id', { id: invitation.user_id });
    }
    return null;
  };

  return (
    <div
      className="flex flex-col space-y-4 border border-dashed rounded-md px-4 pt-4 md:w-full md:max-w-[25rem]"
      style={{ backgroundColor: colors.$1, borderColor: colors.$24 }}
    >
      <div
        className={classNames('flex flex-col space-y-2.5 w-full', {
          'pb-4 px-1': Boolean(
            !(
              document?.status_id !== DocumentStatus.Completed &&
              document?.status_id !== DocumentStatus.Voided
            )
          ),
        })}
      >
        <div className="flex items-center justify-between md:space-x-4">
          <div
            className="text-sm font-medium truncate w-3/4"
            style={{ color: colors.$3 }}
          >
            {getName(invitation)}
          </div>

          <div>{getInvitationStatus(invitation)}</div>
        </div>

        <div className="flex space-x-2 text-sm" style={{ color: colors.$3 }}>
          <span>
            {invitation.entity === 'contact'
              ? `${t('client_contact')}:`
              : `${t('user')}:`}
          </span>

          {invitation.contact?.email || invitation.user?.email ? (
            <span className="truncate">
              {invitation.contact?.email || invitation.user?.email}
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between ">
          {getInvitationDate(invitation)}
        </div>
      </div>

      {Boolean(
        document?.status_id !== DocumentStatus.Completed &&
          document?.status_id !== DocumentStatus.Voided
      ) && (
        <div className="flex justify-between space-x-4 pb-4">
          {getEntityLink() && (
            <Button
              className="py-1"
              type="minimal"
              behavior="button"
              onClick={handleCopyLink}
              disabled={isSendingInvitation}
              disableWithoutIcon
            >
              {t('copy_link')}
            </Button>
          )}

          <Button
            type="minimal"
            behavior="button"
            onClick={handleSendInvitation}
            disabled={isSendingInvitation}
            disableWithoutIcon
          >
            <div className="flex items-center space-x-2">
              <div>
                <Icon element={MdSend} size={17} />
              </div>

              <span>{t('send_email')}</span>
            </div>
          </Button>
        </div>
      )}
    </div>
  );
}
