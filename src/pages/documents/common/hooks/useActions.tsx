/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { EntityState } from '$app/common/enums/entity-state';
import { getEntityState } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { Document, DocumentStatus } from '$app/common/interfaces/docuninja/api';
import { Divider } from '$app/components/cards/Divider';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Action } from '$app/components/ResourceActions';
import { useTranslation } from 'react-i18next';
import {
  MdCancel,
  MdControlPointDuplicate,
  MdDownload,
  MdPalette,
  MdSettings,
} from 'react-icons/md';
import { FaFileSignature } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { docuNinjaAtom } from '$app/common/atoms/docuninja';
import { useDownloadDocument } from '../../show/hooks/useDownloadDocument';
import { useDownloadAuditLog } from '../../show/hooks/useDownloadAuditLog';
import { useCloneDocument } from '../../show/hooks/useCloneDocument';
import { useMakeBluePrint } from '../../show/hooks/useMakeBluePrint';
import { useVoidDocument } from '../../show/hooks/useVoidDocument';
import { DeleteDocumentAction } from '../../show/components/DeleteDocumentAction';
import { ArchiveDocumentAction } from '../../show/components/ArchiveDocumentAction';
import { RestoreDocumentAction } from '../../show/components/RestoreDocumentAction';
import { SendInvitationsModal } from '../../show/components/SendInvitationsModal';
import { DocumentSettingsModal } from '../../show/components/DocumentSettingsModal';
import { useState } from 'react';

interface Params {
  document?: Document;
  onSettingsClick?: (document: Document) => void;
}

export function useActions(params?: Params) {
  const [t] = useTranslation();
  const { document, onSettingsClick } = params || {};

  const docuCompanyAccountDetails = useAtomValue(docuNinjaAtom);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

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

  const location = useLocation();
  const isEditOrShowPage = location.pathname.includes('/documents/') && 
    location.pathname.split('/').length > 2 && 
    !location.pathname.includes('/builder') &&
    !location.pathname.includes('/create');

  const userInvitation = document?.invitations?.find(
    (invitation) =>
      invitation.entity === 'user' &&
      invitation.user_id ===
        docuCompanyAccountDetails?.account?.users?.find(
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

  const actions: Action<Document>[] = [
    (doc) =>
      Boolean(doc && !doc.is_deleted) && (
        <DropdownElement
          to={route('/documents/:id/builder', { id: doc.id })}
          icon={<Icon element={MdSettings} />}
        >
          {t('edit')}
        </DropdownElement>
      ),
    // (doc) =>
    //   Boolean(doc && !doc.is_deleted) && (
    //     <DropdownElement
    //       onClick={() =>
    //         window.open(
    //           route('/documents/sign/:document/:invitation', {
    //             document: doc.id,
    //             invitation: userInvitation?.id,
    //           }),
    //           '_blank'
    //         )
    //       }
    //       icon={<Icon element={FaFileSignature} />}
    //     >
    //       {t('sign')}
    //     </DropdownElement>
    //   ),
    (doc) =>
      Boolean(doc && doc.status_id === DocumentStatus.Completed) && (
        <DropdownElement
          onClick={() => downloadAuditLog()}
          icon={<Icon element={MdDownload} />}
        >
          {t('audit_log')}
        </DropdownElement>
      ),
    (doc) =>
      Boolean(doc && doc.status_id === DocumentStatus.Completed) && (
        <DropdownElement
          onClick={() => downloadDocument()}
          icon={<Icon element={MdDownload} />}
        >
          {t('download')}
        </DropdownElement>
      ),
    
    (doc) =>
      Boolean(doc && !doc.is_deleted) && (
        <DropdownElement
          onClick={() => cloneDocument(doc)}
          icon={<Icon element={MdControlPointDuplicate} />}
        >
          {t('clone')}
        </DropdownElement>
      ),
    (doc) =>
      Boolean(doc && !doc.is_deleted) && (
        <DropdownElement
          onClick={() => makeBluePrint(doc)}
          icon={<Icon element={MdPalette} />}
        >
          {t('make_blueprint')}
        </DropdownElement>
      ),
    (doc) =>
      Boolean(doc && !doc.is_deleted && doc.status_id === DocumentStatus.Sent) && (
        <DropdownElement
          onClick={() => voidDocument(doc)}
          icon={<Icon element={MdCancel} />}
        >
          {t('void')}
        </DropdownElement>
      ),
      (doc) =>
        Boolean(doc && !doc.is_deleted) && (
          <DropdownElement
            onClick={() => onSettingsClick ? onSettingsClick(doc) : setIsSettingsModalOpen(true)}
            icon={<Icon element={MdSettings} />}
          >
            {t('settings')}
          </DropdownElement>
        ),
    (doc) =>
      isEditOrShowPage && !doc.is_deleted && <Divider withoutPadding />,
    (doc) =>
      isEditOrShowPage &&
      getEntityState(doc) === EntityState.Active && (
        <ArchiveDocumentAction document={doc} />
      ),
    (doc) =>
      isEditOrShowPage &&
      (getEntityState(doc) === EntityState.Archived ||
        getEntityState(doc) === EntityState.Deleted) && (
        <RestoreDocumentAction document={doc} />
      ),
    (doc) =>
      isEditOrShowPage &&
      (getEntityState(doc) === EntityState.Active ||
        getEntityState(doc) === EntityState.Archived) && (
        <DeleteDocumentAction document={doc} />
      ),
  ];

  // If onSettingsClick is provided, we're in list view - only return actions
  if (onSettingsClick) {
    return actions;
  }

  // Otherwise, we're in show view - return actions and modals
  return {
    actions,
    modals: (
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
      </>
    ),
    isLoading:
      isDownloadingDoc ||
      isCloningDocumentBusy ||
      isMakingBluePrintBusy ||
      isVoidingDocumentBusy ||
      isDownloadingAuditLog,
  };
}
