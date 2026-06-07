/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export const TAG_ENTITY_TYPES = {
  task: 'task',
  project: 'project',
} as const;

export type TagEntityType =
  (typeof TAG_ENTITY_TYPES)[keyof typeof TAG_ENTITY_TYPES];

export interface Tag {
  id: string;
  entity_type: TagEntityType;
  name: string;
  color: string | null;
  is_deleted: boolean;
  archived_at: number;
  created_at: number;
  updated_at: number;
}
