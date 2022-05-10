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
import { request } from 'common/helpers/request';
import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';

export interface EmailTemplate {
  subject: string;
  body: string;
  wrapper: string;
  raw_body: string;
  raw_subject: string;
}

export function useResolveTemplate(
  body: string,
  entity: string,
  entityId: string,
  subject: string,
  templateId: string
) {
  const queryClient = useQueryClient();
  const [template, setTemplate] = useState<EmailTemplate>();

  useEffect(() => {
    queryClient.fetchQuery(templateId, () =>
      request('POST', endpoint('/api/v1/templates'), {
        body,
        entity,
        entity_id: entityId,
        subject,
        template: templateId,
      })
        .then((response) => setTemplate(response.data))
        .catch((error) => console.error(error))
    );
  }, [body, entity, entityId, subject, templateId]);

  return template;
}
