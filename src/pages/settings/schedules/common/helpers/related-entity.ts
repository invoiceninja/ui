/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from '$app/common/helpers/route';
import { Schedule } from '$app/common/interfaces/schedule';
import { Template } from '../hooks/useDisplayTemplateField';

export const SCHEDULE_ENTITY_TYPES = [
  'invoice',
  'quote',
  'credit',
  'purchase_order',
] as const;

export type ScheduleEntityType = (typeof SCHEDULE_ENTITY_TYPES)[number];

export interface ScheduleRelatedEntity {
  entity: ScheduleEntityType;
  entityId: string;
}

const ENTITY_ROUTES: Record<ScheduleEntityType, string> = {
  invoice: '/invoices/:id/edit',
  quote: '/quotes/:id/edit',
  credit: '/credits/:id/edit',
  purchase_order: '/purchase_orders/:id/edit',
};

const isScheduleEntityType = (value: unknown): value is ScheduleEntityType =>
  SCHEDULE_ENTITY_TYPES.includes(value as ScheduleEntityType);

export const scheduleRelatedEntity = (
  schedule: Schedule | undefined | null
): ScheduleRelatedEntity | null => {
  const template = schedule?.template as Template | undefined;
  const parameters = schedule?.parameters;

  if (!parameters) {
    return null;
  }

  if (template === 'payment_schedule') {
    return parameters.invoice_id
      ? { entity: 'invoice', entityId: parameters.invoice_id }
      : null;
  }

  if (template === 'email_record') {
    return parameters.entity_id && isScheduleEntityType(parameters.entity)
      ? { entity: parameters.entity, entityId: parameters.entity_id }
      : null;
  }

  return null;
};

export const scheduleRelatedEntityRoute = (
  relatedEntity: ScheduleRelatedEntity
): string =>
  route(ENTITY_ROUTES[relatedEntity.entity], {
    id: relatedEntity.entityId,
  });
