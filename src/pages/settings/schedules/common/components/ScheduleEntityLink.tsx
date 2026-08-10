/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { Schedule } from '$app/common/interfaces/schedule';
import { DynamicLink } from '$app/components/DynamicLink';
import { useTranslation } from 'react-i18next';
import {
  scheduleRelatedEntity,
  scheduleRelatedEntityRoute,
} from '../helpers/related-entity';
import { useEntityResource } from '../hooks/useEntityNumber';

interface Props {
  schedule: Schedule;
}

export function ScheduleEntityLink({ schedule }: Props) {
  const [t] = useTranslation();

  const disableNavigation = useDisableNavigation();

  const relatedEntity = scheduleRelatedEntity(schedule);

  const resource = useEntityResource({
    entity: relatedEntity?.entity,
    entityId: relatedEntity?.entityId,
    enabled: Boolean(relatedEntity),
  });

  if (!relatedEntity) {
    return <></>;
  }

  return (
    <DynamicLink
      to={scheduleRelatedEntityRoute(relatedEntity)}
      renderSpan={disableNavigation(relatedEntity.entity, resource)}
    >
      {resource?.number
        ? `${t(relatedEntity.entity)} #${resource.number}`
        : t(relatedEntity.entity)}
    </DynamicLink>
  );
}
