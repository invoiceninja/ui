/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { GatewayType } from '$app/common/enums/gateway-type';

export default {
  [GatewayType.CreditCard]: 'credit_card',
  [GatewayType.BankTransfer]: 'bank_transfer',
  [GatewayType.PayPal]: 'paypal',
  [GatewayType.Crypto]: 'crypto',
  [GatewayType.Custom]: 'custom',
  [GatewayType.Alipay]: 'alipay',
  [GatewayType.Sofort]: 'sofort',
  [GatewayType.ApplePay]: 'apple_pay',
  [GatewayType.SEPA]: 'sepa',
  [GatewayType.Credit]: 'credit',
  [GatewayType.KBC]: 'kbc',
  [GatewayType.Bancontact]: 'bancontact',
  [GatewayType.IDeal]: 'ideal',
  [GatewayType.Hosted]: 'hosted',
  [GatewayType.Giropay]: 'giropay',
  [GatewayType.Przelewy24]: 'przelewy24',
  [GatewayType.DirectDebit]: 'direct_debit',
  [GatewayType.EPS]: 'eps',
  [GatewayType.ACSS]: 'acss',
  [GatewayType.BECS]: 'becs',
  [GatewayType.InstantBankPay]: 'instant_bank_pay',
  [GatewayType.FPX]: 'fpx',
};
