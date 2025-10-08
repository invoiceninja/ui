/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MdCancel,
  MdControlPointDuplicate,
  MdDownload,
  MdPalette,
  MdSettings,
} from 'react-icons/md';
import { SendInvitationsModal } from '../components/SendInvitationsModal';
import { Document, DocumentStatus } from '$app/common/interfaces/docuninja/api';
import { Icon } from '$app/components/icons/Icon';
import { useDownloadDocument } from './useDownloadDocument';
import { DocumentSettingsModal } from '../components/DocumentSettingsModal';
import { useCloneDocument } from './useCloneDocument';
import { useMakeBluePrint } from './useMakeBluePrint';
import { useVoidDocument } from './useVoidDocument';
import { DeleteDocumentAction } from '../components/DeleteDocumentAction';
import { Divider } from '$app/components/cards/Divider';
import { ArchiveDocumentAction } from '../components/ArchiveDocumentAction';
import { RestoreDocumentAction } from '../components/RestoreDocumentAction';
import { useNavigate } from 'react-router-dom';
import { route } from '$app/common/helpers/route';
import { FaFileSignature } from 'react-icons/fa';
import { useAtom } from 'jotai';
import { docuNinjaAtom } from '$app/common/atoms/docuninja';
import { useDownloadAuditLog } from './useDownloadAuditLog';

interface DocumentAction {
  label: string;
  icon: ReactElement;
  onClick: () => void;
  visible?: boolean;
}

interface Params {
  document: Document | undefined;
}

export function useDocumentActions({ document }: Params) {
  const [t] = useTranslation();

  const navigate = useNavigate();

  // Get DocuNinja data from unified atoms (NO QUERY!)
  const [docuData] = useAtom(docuNinjaAtom);

  const [isSettingsModalOpen, setIsSettingsModalOpen] =
    useState<boolean>(false);

  const { downloadDocument, isFormBusy: isDownloadingDoc } =
    useDownloadDocument({
      doc: document,
    });

  const { downloadAuditLog, isFormBusy: isDownloadingAuditLog } =
    useDownloadAuditLog({
      doc: document,
    });

  const { makeBluePrint, isFormBusy: isMakingBluePrintBusy } =
    useMakeBluePrint();

  const { cloneDocument, isFormBusy: isCloningDocumentBusy } =
    useCloneDocument();

  const { voidDocument, isFormBusy: isVoidingDocumentBusy } = useVoidDocument();

  const userInvitation = document?.invitations?.find(
    (invitation) =>
      invitation.entity === 'user' &&
      invitation.user_id ===
        docuData?.users?.find(
          (user) => user.company_user?.is_owner
        )?.id
  );

  const hasRectangles = () => {
    return (
      document?.files?.some(
        (file) =>
          file.metadata?.rectangles &&
          Array.isArray(file.metadata.rectangles) &&
          file.metadata.rectangles.length > 0
      ) ?? false
    );
  };

  const actions: DocumentAction[] = [
    {
      label: t('sign'),
      icon: <Icon element={FaFileSignature} />,
      onClick: () =>
        window.open(
          route('/documents/sign/:document/:invitation', {
            document: document?.id,
            invitation: userInvitation?.id,
          }),
          '_blank'
        ),
      visible:
        (document?.status_id ?? 0) <= 2 && userInvitation && hasRectangles(),
    },
    {
      label: t('audit_log'),
      icon: <Icon element={MdDownload} />,
      onClick: () => downloadAuditLog(),
      visible: document?.status_id === DocumentStatus.Completed,
    },
    {
      label: t('download'),
      icon: <Icon element={MdDownload} />,
      onClick: () => downloadDocument(),
      visible: document?.status_id === DocumentStatus.Completed,
    },
    {
      label: t('settings'),
      icon: <Icon element={MdSettings} />,
      onClick: () => setIsSettingsModalOpen(true),
      visible: true,
    },
    {
      label: t('clone'),
      icon: <Icon element={MdControlPointDuplicate} />,
      onClick: () => cloneDocument(document!),
      visible: true,
    },
    {
      label: t('make_blueprint'),
      icon: <Icon element={MdPalette} />,
      onClick: () => makeBluePrint(document!),
      visible: true,
    },
    {
      label: t('void'),
      icon: <Icon element={MdCancel} />,
      onClick: () => voidDocument(document!),
      visible: true,
    },
  ];

  return (
    <>
      {Boolean(document) && (
        <SendInvitationsModal document={document!} renderAsDropdownElement />
      )}

      {Boolean(document) && (
        <DocumentSettingsModal
          document={document!}
          visible={isSettingsModalOpen}
          setVisible={setIsSettingsModalOpen}
        />
      )}

      {actions
        .filter((option) => option.visible)
        .map((option, index) => (
          <DropdownElement
            key={index}
            icon={option.icon}
            disabled={
              isDownloadingDoc ||
              isCloningDocumentBusy ||
              isMakingBluePrintBusy ||
              isVoidingDocumentBusy ||
              isDownloadingAuditLog
            }
            onClick={option.onClick}
          >
            {option.label}
          </DropdownElement>
        ))}

      <Divider withoutPadding />

      {Boolean(document && !document.archived_at) && (
        <ArchiveDocumentAction document={document!} />
      )}

      {Boolean(document && (document.archived_at || document.is_deleted)) && (
        <RestoreDocumentAction document={document!} />
      )}

      {Boolean(document && !document.is_deleted) && (
        <DeleteDocumentAction document={document!} />
      )}
    </>
  );
}
