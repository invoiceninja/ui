/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { PaymentType } from 'common/enums/payment-type';

export default {
  [PaymentType.ACH]: 'payment_type_ACH',
  [PaymentType.ACSS]: 'acss',
  [PaymentType.ALIPAY]: 'payment_type_Alipay',
  [PaymentType.AMERICAN_EXPRESS]: 'payment_type_American Express',
  [PaymentType.BANCONTACT]: 'bancontact',
  [PaymentType.BECS]: 'becs',
  [PaymentType.CARTE_BLANCHE]: 'payment_type_Carte Blanche',
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
  [PaymentType.HOSTED_PAGE]: 'hosted_page',
  [PaymentType.IDEAL]: 'ideal',
  [PaymentType.INSTANT_BANK_PAY]: 'instant_bank_pay',
  [PaymentType.JCB]: 'payment_type_JCB',
  [PaymentType.KBC]: 'kbc_cbc',
  [PaymentType.LASER]: 'payment_type_Laser',
  [PaymentType.MAESTRO]: 'payment_type_Maestro',
  [PaymentType.MASTERCARD]: 'payment_type_MasterCard',
  [PaymentType.MOLLIE_BANK_TRANSFER]: 'mollie_bank_transfer',
  [PaymentType.NOVA]: 'payment_type_Nova',
  [PaymentType.PAYPAL]: 'payment_type_PayPal',
  [PaymentType.PRZELEWY24]: 'przelewy24',
  [PaymentType.SEPA]: 'payment_type_SEPA',
  [PaymentType.SOFORT]: 'payment_type_Sofort',
  [PaymentType.SOLO]: 'payment_type_Solo',
  [PaymentType.SWITCH]: 'payment_type_Switch',
  [PaymentType.UNIONPAY]: 'payment_type_UnionPay',
  [PaymentType.VISA]: 'payment_type_Visa Card',
};
