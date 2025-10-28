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

import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useAtomValue } from 'jotai';
import { docuNinjaAtom } from '$app/common/atoms/docuninja';
import { useCloneDocument } from '../../show/hooks/useCloneDocument';
import { useMakeTemplate } from '../../show/hooks/useMakeTemplate';
import { useVoidDocument } from '../../show/hooks/useVoidDocument';
import { DeleteDocumentAction } from '../../show/components/DeleteDocumentAction';
import { ArchiveDocumentAction } from '../../show/components/ArchiveDocumentAction';
import { RestoreDocumentAction } from '../../show/components/RestoreDocumentAction';
import { SendInvitationsModal } from '../../show/components/SendInvitationsModal';
import { useEntityPageIdentifier } from '$app/common/hooks/useEntityPageIdentifier';

interface Params {
  onSettingsClick?: (doc: Document) => void;
}

export function useActions(params?: Params) {
  const [t] = useTranslation();
  const { onSettingsClick } = params || {};

  const docuCompanyAccountDetails = useAtomValue(docuNinjaAtom);

  const downloadDocument = (doc: Document) => {
    if (!doc) return;

    toast.processing();

    request(
      'POST',
      docuNinjaEndpoint(`/api/documents/${doc.id}/download`),
      {},
      {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            'X-DOCU-NINJA-TOKEN'
          )}`,
        },
      }
    )
      .then((response) => {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        const contentDisposition = response.headers['content-disposition'];
        let filename = 'document.pdf';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(
            /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
          );
          if (filenameMatch?.[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '');
          }
        }

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.dismiss();
      })
      .catch((error) => {
        if (error.response?.status === 422) {
          toast.error(error.response.data.message || 'something_went_wrong');
        } else if (error.response?.status === 400) {
          toast.error('document_not_ready_for_download');
        } else {
          toast.error('something_went_wrong');
        }
      });
  };

  const downloadAuditLog = (doc: Document) => {
    if (!doc) return;

    toast.processing();

    request(
      'POST',
      docuNinjaEndpoint('/api/documents/:id/audit_log', {
        id: doc.id,
      }),
      {},
      {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            'X-DOCU-NINJA-TOKEN'
          )}`,
        },
      }
    )
      .then((response) => {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        const contentDisposition = response.headers['content-disposition'];
        let filename = 'audit-log.pdf';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(
            /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
          );
          if (filenameMatch?.[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '');
          }
        }

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.dismiss();
      })
      .catch((error) => {
        if (error.response?.status === 422) {
          toast.error(error.response.data.message || 'something_went_wrong');
        } else if (error.response?.status === 400) {
          toast.error('audit_log_not_ready_for_download');
        } else {
          toast.error('something_went_wrong');
        }
      });
  };

  const { makeTemplate, isFormBusy: isMakingTemplateBusy } =
    useMakeTemplate();

  const { cloneDocument, isFormBusy: isCloningDocumentBusy } =
    useCloneDocument();

  const { voidDocument, isFormBusy: isVoidingDocumentBusy } = useVoidDocument();

  const { isEditOrShowPage } = useEntityPageIdentifier({
    entity: 'blueprint',
  });

  const getUserInvitation = (doc: Document) => {
    return doc?.invitations?.find(
      (invitation) =>
        invitation.entity === 'user' &&
        invitation.user_id ===
          docuCompanyAccountDetails?.account?.users?.find(
            (user) => user.company_user?.is_owner
          )?.id
    );
  };

  const hasRectangles = (doc: Document) => {
    return (
      doc?.files?.some(
        (file) =>
          file.metadata?.rectangles &&
          Array.isArray(file.metadata.rectangles) &&
          file.metadata.rectangles.length > 0
      ) ?? false
    );
  };

  const actions: Action<Document>[] = [
    // (doc) =>
    //   Boolean(doc && !doc.is_deleted) && (
    //     <DropdownElement
    //       to={route('/documents/:id/builder', { id: doc.id })}
    //       icon={<Icon element={MdSettings} />}
    //     >
    //       {t('edit')}
    //     </DropdownElement>
    //   ),
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
      Boolean(doc && !doc.is_deleted) && (
        <SendInvitationsModal document={doc} renderAsDropdownElement />
      ),
    (doc) =>
      Boolean(doc && doc.status_id === DocumentStatus.Completed) && (
        <DropdownElement
          onClick={() => downloadAuditLog(doc)}
          icon={<Icon element={MdDownload} />}
        >
          {t('audit_log')}
        </DropdownElement>
      ),
    (doc) =>
      Boolean(doc && doc.status_id === DocumentStatus.Completed) && (
        <DropdownElement
          onClick={() => downloadDocument(doc)}
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
          onClick={() => makeTemplate(doc)}
          icon={<Icon element={MdPalette} />}
        >
          {t('create_template')}
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
          onClick={() => onSettingsClick ? onSettingsClick(doc) : console.log('Settings clicked for document:', doc.id)}
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

  return actions;
}
