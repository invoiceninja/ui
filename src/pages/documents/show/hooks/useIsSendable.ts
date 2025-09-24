/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Document, DocumentStatus } from '$app/common/interfaces/docuninja/api';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import {
  useAdmin,
  useHasPermission,
} from '$app/common/hooks/permissions/useHasPermission';

export function useIsSendable() {
  const user = useCurrentUser();
  const { isAdmin, isOwner } = useAdmin();
  const hasPermission = useHasPermission();

  return (document: Document) => {
    // === BASIC CHECKS ===
    const allowedStatuses = [
      DocumentStatus.Draft,
      DocumentStatus.PendingApproval,
      DocumentStatus.Approved,
      DocumentStatus.Sent,
    ];
    const isStatusAllowed = allowedStatuses.includes(document.status_id);
    const isApproved = document.status_id === DocumentStatus.Approved;

    // === USER CHECKS ===
    const isAdminOrOwner = isAdmin || isOwner;
    const isDocumentOwner = document.user_id === user?.id;

    // === PERMISSION CHECKS ===
    const requiresApproval = hasPermission('requires_approval');
    const canEdit = hasPermission('edit_documents');
    const canCreate = hasPermission('create_documents');

    // === COMBINED CONDITIONS ===
    const adminOrOwnerWithAllowedStatus = isStatusAllowed && isAdminOrOwner;
    const approvedWithApprovalPermission = isApproved && requiresApproval;
    const canEditWithoutApproval =
      isStatusAllowed && !requiresApproval && canEdit;
    const canCreateOwnWithoutApproval =
      isStatusAllowed && !requiresApproval && canCreate && isDocumentOwner;

    return (
      adminOrOwnerWithAllowedStatus ||
      approvedWithApprovalPermission ||
      canEditWithoutApproval ||
      canCreateOwnWithoutApproval
    );
  };
}
