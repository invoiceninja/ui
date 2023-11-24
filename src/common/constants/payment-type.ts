/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { PaymentType } from '$app/common/enums/payment-type';

export default {
  [PaymentType.ACH]: 'payment_type_ACH',
  [PaymentType.ACSS]: 'payment_type_ACSS',
  [PaymentType.ALIPAY]: 'payment_type_Alipay',
  [PaymentType.AMERICAN_EXPRESS]: 'payment_type_American Express',
  [PaymentType.BANCONTACT]: 'bancontact',
  [PaymentType.BACS]: 'payment_type_BACS',
  [PaymentType.BECS]: 'becs',
  [PaymentType.BANK_TRANSFER]: 'payment_type_Bank Transfer',
  [PaymentType.CARTE_BLANCHE]: 'payment_type_Carte Blanche',
  [PaymentType.CASH]: 'payment_type_Cash',
  [PaymentType.CASH_APP]: 'payment_type_Cash App',
  [PaymentType.CHECK]: 'payment_type_Check',
  [PaymentType.CREDIT]: 'payment_type_Credit',
  [PaymentType.CREDIT_CARD_OTHER]: 'payment_type_Credit Card Other',
  [PaymentType.CRYPTO]: 'payment_type_Crypto',
  [PaymentType.DINERS]: 'payment_type_Diners Card',
  [PaymentType.DIRECT_DEBIT]: 'payment_type_direct_debit',
  [PaymentType.DISCOVER]: 'payment_type_Discover Card',
  [PaymentType.EPS]: 'eps',
  [PaymentType.EUROCARD]: 'payment_type_EuroCard',
  [PaymentType.FPX]: 'fpx',
  [PaymentType.GIROPAY]: 'giropay',
  [PaymentType.GOCARDLESS]: 'payment_type_GoCardless',
  [PaymentType.HOSTED_PAGE]: 'payment_type_Hosted Page',
  [PaymentType.IDEAL]: 'ideal',
  [PaymentType.INSTANT_BANK_PAY]: 'instant_bank_pay',
  [PaymentType.INTERAC]: 'payment_type_Interac E-Transfer',
  [PaymentType.JCB]: 'payment_type_JCB',
  [PaymentType.KBC]: 'kbc_cbc',
  [PaymentType.KLARNA]: 'payment_type_Klarna',
  [PaymentType.LASER]: 'payment_type_Laser',
  [PaymentType.MAESTRO]: 'payment_type_Maestro',
  [PaymentType.MASTERCARD]: 'payment_type_MasterCard',
  [PaymentType.MOLLIE_BANK_TRANSFER]: 'payment_type_Bank Transfer',
  [PaymentType.NOVA]: 'payment_type_Nova',
  [PaymentType.PAYPAL]: 'payment_type_PayPal',
  [PaymentType.PRZELEWY24]: 'przelewy24',
  [PaymentType.SEPA]: 'payment_type_SEPA',
  [PaymentType.SOFORT]: 'payment_type_Sofort',
  [PaymentType.SOLO]: 'payment_type_Solo',
  [PaymentType.SWITCH]: 'payment_type_Switch',
  [PaymentType.UNIONPAY]: 'payment_type_UnionPay',
  [PaymentType.VENMO]: 'payment_type_Venmo',
  [PaymentType.VISA]: 'payment_type_Visa Card',
  [PaymentType.ZELLE]: 'payment_type_Zelle',
};
