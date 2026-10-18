/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { atom } from 'jotai';
import { Settings } from '$app/common/interfaces/company.interface';

interface UpdatingRecord {
  design_id: string;
  entity: string;
}

export const updatingRecordsAtom = atom<UpdatingRecord[]>([]);

export type LivePreviewEntityType =
  | 'invoice'
  | 'quote'
  | 'credit'
  | 'purchase_order'
  | 'statement'
  | 'payment_receipt'
  | 'payment_refund'
  | 'delivery_note';

export type DesignSettingKey = Extract<
  keyof Settings,
  | 'invoice_design_id'
  | 'quote_design_id'
  | 'credit_design_id'
  | 'purchase_order_design_id'
  | 'statement_design_id'
  | 'delivery_note_design_id'
  | 'payment_receipt_design_id'
  | 'payment_refund_design_id'
>;

export const DESIGN_SETTING_ENTITY_MAP: Record<
  DesignSettingKey,
  LivePreviewEntityType
> = {
  invoice_design_id: 'invoice',
  quote_design_id: 'quote',
  credit_design_id: 'credit',
  purchase_order_design_id: 'purchase_order',
  statement_design_id: 'statement',
  delivery_note_design_id: 'delivery_note',
  payment_receipt_design_id: 'payment_receipt',
  payment_refund_design_id: 'payment_refund',
};

export const OPTIONAL_DESIGN_SETTING_KEYS = [
  'statement_design_id',
  'delivery_note_design_id',
  'payment_receipt_design_id',
  'payment_refund_design_id',
] as const satisfies readonly DesignSettingKey[];

export type OptionalDesignSettingKey =
  (typeof OPTIONAL_DESIGN_SETTING_KEYS)[number];

export const ENTITY_TYPE_DESIGN_SETTING_MAP: Record<
  LivePreviewEntityType,
  DesignSettingKey
> = {
  invoice: 'invoice_design_id',
  quote: 'quote_design_id',
  credit: 'credit_design_id',
  purchase_order: 'purchase_order_design_id',
  statement: 'statement_design_id',
  delivery_note: 'delivery_note_design_id',
  payment_receipt: 'payment_receipt_design_id',
  payment_refund: 'payment_refund_design_id',
};

export function isOptionalDesignSetting(
  setting: DesignSettingKey
): setting is OptionalDesignSettingKey {
  return (OPTIONAL_DESIGN_SETTING_KEYS as readonly DesignSettingKey[]).includes(
    setting
  );
}

export function getDesignChangeEntityType(
  setting: DesignSettingKey,
  value: string
): LivePreviewEntityType | null {
  if (!value && isOptionalDesignSetting(setting)) {
    return null;
  }

  return DESIGN_SETTING_ENTITY_MAP[setting];
}

export function buildLiveDesignPayload(
  entityType: LivePreviewEntityType,
  settings: Settings | null
) {
  return {
    client_id: '-1',
    entity_type: entityType,
    group_id: '-1',
    settings,
    settings_type: 'company' as const,
  };
}

export function shouldPreviewLiveDesign(
  entityType: LivePreviewEntityType,
  settings: Settings | null
): boolean {
  if (!settings) {
    return false;
  }

  const settingKey = ENTITY_TYPE_DESIGN_SETTING_MAP[entityType];

  if (!isOptionalDesignSetting(settingKey)) {
    return true;
  }

  return Boolean(settings[settingKey]);
}

export function isLiveDesignPreviewEnabled(
  entityType: LivePreviewEntityType,
  settings: Settings | null
): boolean {
  return shouldPreviewLiveDesign(entityType, settings);
}

export function serializeLiveDesignPreviewKey(
  payload: ReturnType<typeof buildLiveDesignPayload>
): string {
  return JSON.stringify({
    client_id: payload.client_id,
    entity_type: payload.entity_type,
    group_id: payload.group_id,
    settings: payload.settings,
    settings_type: payload.settings_type,
  });
}

const ROUTE_ENTITY_TYPE_MAP: Record<string, LivePreviewEntityType> = {
  invoice_details: 'invoice',
  quote_details: 'quote',
  credit_details: 'credit',
  purchase_order_details: 'purchase_order',
};

export function getLivePreviewEntityTypeFromPath(
  pathname: string
): LivePreviewEntityType | null {
  const segment = pathname.split('/').pop() ?? '';

  return ROUTE_ENTITY_TYPE_MAP[segment] ?? null;
}

export function resolveLivePreviewEntityType(
  pathname: string
): LivePreviewEntityType {
  return getLivePreviewEntityTypeFromPath(pathname) ?? 'invoice';
}

export function resolveEffectiveLivePreviewEntityType(
  pathname: string,
  designEntityType: LivePreviewEntityType
): LivePreviewEntityType {
  return getLivePreviewEntityTypeFromPath(pathname) ?? designEntityType;
}

export const livePreviewEntityTypeAtom =
  atom<LivePreviewEntityType>('invoice');
