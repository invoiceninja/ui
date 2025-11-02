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
import { MdDownload, MdSettings, MdTimer } from 'react-icons/md';

import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useAtomValue } from 'jotai';
import { docuNinjaAtom } from '$app/common/atoms/docuninja';
import { DeleteDocumentAction } from '../../show/components/DeleteDocumentAction';
import { ArchiveDocumentAction } from '../../show/components/ArchiveDocumentAction';
import { RestoreDocumentAction } from '../../show/components/RestoreDocumentAction';
import { SendInvitationsModal } from '../../show/components/SendInvitationsModal';
import { useEntityPageIdentifier } from '$app/common/hooks/useEntityPageIdentifier';
import { route } from '$app/common/helpers/route';
import { useNavigate } from 'react-router-dom';
import { VoidAction } from '../components/VoidAction';
import { CloneAction } from '../components/CloneAction';
import { MakeTemplateAction } from '../components/MakeTemplateAction';

interface Params {
  onSettingsClick?: (doc: Document) => void;
}

export function useActions(params?: Params) {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const { isEditOrShowPage } = useEntityPageIdentifier({
    entity: 'document',
  });

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
          Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
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
          Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
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
    (doc) =>
      Boolean(doc && !doc.is_deleted) && (
        <DropdownElement
          onClick={() => navigate(route('/documents/:id', { id: doc.id }))}
          icon={<Icon element={MdTimer} />}
        >
          {t('timeline')}
        </DropdownElement>
      ),
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

    (doc) => <CloneAction document={doc} />,
    (doc) => <MakeTemplateAction document={doc} />,
    (doc) => <VoidAction document={doc} />,
    (doc) =>
      Boolean(doc && !doc.is_deleted) && (
        <DropdownElement
          onClick={() => onSettingsClick?.(doc)}
          icon={<Icon element={MdSettings} />}
        >
          {t('options')}
        </DropdownElement>
      ),
    (doc) => isEditOrShowPage && !doc.is_deleted && <Divider withoutPadding />,
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
