/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import {
  MailerResource,
  MailerResourceType,
} from 'pages/invoices/email/components/Mailer';

interface Props {
  resource: MailerResourceType;
  resourceType: MailerResourceType;
}

export function useGeneratePdfUrl(props: Props) {
  return (resource: MailerResource) => {
    if (resource.invitations.length === 0) {
      return;
    }

    if (
      resource.invitations.length > 0 &&
      props.resourceType === 'purchaseOrder'
    ) {
      return endpoint('/vendor/purchase_order/:invitation/download', {
        resource: props.resource,
        invitation: resource.invitations[0].key,
      });
    }

    if (resource.invitations.length > 0) {
      return endpoint('/client/:resource/:invitation/download_pdf', {
        resource: props.resource,
        invitation: resource.invitations[0].key,
      });
    }
  };
}
