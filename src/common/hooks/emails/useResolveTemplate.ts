/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';

export interface EmailTemplate {
  subject: string;
  body: string;
  wrapper: string;
  raw_body: string;
  raw_subject: string;
  cc_email: string;
}

export function useResolveTemplate(
  body: string,
  entity: string,
  entityId: string,
  subject: string,
  templateId: string,
  ccEmail: string
) {
  const queryClient = useQueryClient();
  const [template, setTemplate] = useState<EmailTemplate>();

  useEffect(() => {
    queryClient.fetchQuery(['/api/v1/templates', templateId], () =>
      request('POST', endpoint('/api/v1/templates'), {
        body,
        entity,
        entity_id: entityId,
        subject,
        template: templateId,
        cc_email: ccEmail,
      }).then((response) => setTemplate(response.data))
    );
  }, [body, entity, entityId, subject, templateId, ccEmail]);

  return template;
}
