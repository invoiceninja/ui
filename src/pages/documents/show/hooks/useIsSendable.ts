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

  /**
   * Checks permission in this order:
   * 1. If the user is an admin
   * 2. If the document is approved, and the user is restricted
   * 3. If the document is in draft, pending approval, or sent, the user can edit it
   * 4. If the document is in draft, pending approval, or sent, the user can create it if they are the owner of the document
   */

  return (document: Document) => {
    return Boolean(
      ([
        DocumentStatus.Draft,
        DocumentStatus.PendingApproval,
        DocumentStatus.Approved,
        DocumentStatus.Sent,
      ].includes(document.status_id) &&
        (isAdmin || isOwner)) ||
        (document.status_id === DocumentStatus.Approved &&
          hasPermission('requires_approval')) ||
        ([
          DocumentStatus.Draft,
          DocumentStatus.PendingApproval,
          DocumentStatus.Approved,
          DocumentStatus.Sent,
        ].includes(document.status_id) &&
          !hasPermission('requires_approval') &&
          hasPermission('edit_documents')) ||
        ([
          DocumentStatus.Draft,
          DocumentStatus.PendingApproval,
          DocumentStatus.Approved,
          DocumentStatus.Sent,
        ].includes(document.status_id) &&
          !hasPermission('requires_approval') &&
          hasPermission('create_documents') &&
          document.user_id === user?.id)
    );
  };
}
