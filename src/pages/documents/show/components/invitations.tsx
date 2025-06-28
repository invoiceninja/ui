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
import { Icon } from '$app/components/icons/Icon';
import { MdSend } from 'react-icons/md';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { date } from '$app/common/helpers';
import type {
  Document as DocumentType,
  DocumentInvitation,
} from '$app/common/interfaces/docuninja/api';
import { route } from '$app/common/helpers/route';
import { CopyToClipboardIconOnly } from '$app/components/CopyToClipBoardIconOnly';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { Tooltip } from '$app/components/Tooltip';
import styled from 'styled-components';
import { useColorScheme } from '$app/common/colors';
import { Plus } from '$app/components/icons/Plus';
import { useNavigate } from 'react-router-dom';

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
          navigate(route('/documents/:id/builder', { id: document.id }))
        }
      >
        <Plus size="2rem" color={colors.$3} />

        <span style={{ color: colors.$3 }}>{t('add_signatories')}</span>
      </Box>
    );
  }

  return (
    <div className="space-y-3">
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
  const { dateFormat } = useCurrentCompanyDateFormats();
  const [t] = useTranslation();

  const accentColor = useAccentColor();
  const [sendingInvitations, setSendingInvitations] = useState<
    DocumentInvitation[]
  >([]);

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
      label = t('signed_on') || 'Signed on';
    } else if (invitation.viewed_date) {
      dateString = invitation.viewed_date;
      label = t('viewed_on') || 'Viewed on';
    } else if (invitation.sent_date) {
      dateString = invitation.sent_date;
      label = t('sent_on') || 'Sent on';
    } else {
      dateString = invitation.created_at;
      label = t('created_on') || 'Created on';
    }

    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Calendar size={14} />
        <span>
          {label}: {date(dateString, dateFormat)}
        </span>
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
    const link = `${window.location.origin}/sign/${document.id}/${invitation.id}`;
    navigator.clipboard.writeText(link);
    toast.success(t('link_copied') || 'Link copied to clipboard');
  };

  const handleSendInvitation = () => {
    setSendingInvitations([invitation]);
    // TODO: Implement send invitation logic
    toast.success(t('invitation_sent') || 'Invitation sent successfully');
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
    <div className="border rounded-lg p-4 transition-colors bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center justify-between space-x-3 mb-2">
            <span className="text-sm font-medium text-gray-900">
              {getName(invitation)}
            </span>

            {getInvitationStatus(invitation)}
          </div>

          <div className="text-sm text-gray-600 mb-2">
            {invitation.entity === 'contact' ? t('client_contact') : t('user')}
            {invitation.contact?.email || invitation.user?.email ? (
              <span className="ml-2">
                ({invitation.contact?.email || invitation.user?.email})
              </span>
            ) : null}
          </div>

          <div className="flex items-center justify-between ">
            {getInvitationDate(invitation)}

            <div className="flex space-x-4">
              {getEntityLink() && (
                <Tooltip
                  width="auto"
                  placement="bottom"
                  message={t('copy_link') || 'Copy Link'}
                  withoutArrow
                >
                  <CopyToClipboardIconOnly text={getEntityLink()!} />
                </Tooltip>
              )}

              <Tooltip
                width="auto"
                placement="bottom"
                message={t('send_email') || 'Send Email'}
                withoutArrow
              >
                <div onClick={() => handleSendInvitation()}>
                  <Icon element={MdSend} />
                </div>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
