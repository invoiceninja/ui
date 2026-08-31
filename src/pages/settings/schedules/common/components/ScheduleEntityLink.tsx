/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Schedule } from '$app/common/interfaces/schedule';
import { DynamicLink } from '$app/components/DynamicLink';
import { useTranslation } from 'react-i18next';
import {
  scheduleRelatedEntity,
  scheduleRelatedEntityRoute,
} from '../helpers/related-entity';
import { useEntityNumber } from '../hooks/useEntityNumber';
import { useDefaultTabUrl } from '$app/common/hooks/useDefaultTab';

interface Props {
  schedule: Schedule;
}

export function ScheduleEntityLink({ schedule }: Props) {
  const [t] = useTranslation();

  const defaultTabUrl = useDefaultTabUrl();

  const relatedEntity = scheduleRelatedEntity(schedule);

  const entityNumber = useEntityNumber({
    entity: relatedEntity?.entity,
    entityId: relatedEntity?.entityId,
    enabled: Boolean(relatedEntity),
  });

  if (!relatedEntity) {
    return <></>;
  }

  return (
    <DynamicLink to={defaultTabUrl(scheduleRelatedEntityRoute(relatedEntity))}>
      {entityNumber
        ? `${t(relatedEntity.entity)} #${entityNumber}`
        : t(relatedEntity.entity)}
    </DynamicLink>
  );
}
