/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export const socketEvents = [
  'App\\Events\\Invoice\\InvoiceWasPaid',
  'App\\Events\\Invoice\\InvoiceWasViewed',
  'App\\Events\\Payment\\PaymentWasUpdated',
  'App\\Events\\Credit\\CreditWasCreated',
  'App\\Events\\Credit\\CreditWasUpdated',
  'App\\Events\\Socket\\RefetchEntity',
  'App\\Events\\Socket\\DownloadAvailable',
  'App\\Events\\Document\\DocumentWasSigned',
  'App\\Events\\DocumentFile\\DocumentFilePreviewGenerated',
  'App\\Events\\User\\UserWasVerified',
] as const;

export type SocketEvent = (typeof socketEvents)[number];

export type SocketEventCallbacks = Record<SocketEvent, (data: unknown) => unknown>;
