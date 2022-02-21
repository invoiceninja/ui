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
  [PaymentType.ACH]: 'ach',
  [PaymentType.ACSS]: 'acss',
  [PaymentType.ALIPAY]: 'alipay',
  [PaymentType.AMERICAN_EXPRESS]: 'american_express',
  [PaymentType.BANCONTACT]: 'bancontact',
  [PaymentType.BECS]: 'becs',
  [PaymentType.CARTE_BLANCHE]: 'carte_blanche',
  [PaymentType.CHECK]: 'check',
  [PaymentType.CREDIT]: 'credit',
  [PaymentType.CREDIT_CARD_OTHER]: 'credit_card_other',
  [PaymentType.CRYPTO]: 'crypto',
  [PaymentType.DINERS]: 'diners',
  [PaymentType.DIRECT_DEBIT]: 'direct_debit',
  [PaymentType.DISCOVER]: 'discover',
  [PaymentType.EPS]: 'eps',
  [PaymentType.EUROCARD]: 'eurocard',
  [PaymentType.FPX]: 'fpx',
  [PaymentType.GIROPAY]: 'giropay',
  [PaymentType.GOCARDLESS]: 'gocardless',
  [PaymentType.HOSTED_PAGE]: 'hosted_page',
  [PaymentType.IDEAL]: 'ideal',
  [PaymentType.INSTANT_BANK_PAY]: 'instant_bank_pay',
  [PaymentType.JCB]: 'jcb',
  [PaymentType.KBC]: 'kbc',
  [PaymentType.LASER]: 'laser',
  [PaymentType.MAESTRO]: 'maestro',
  [PaymentType.MASTERCARD]: 'mastercard',
  [PaymentType.MOLLIE_BANK_TRANSFER]: 'mollie_bank_transfer',
  [PaymentType.NOVA]: 'nova',
  [PaymentType.PAYPAL]: 'paypal',
  [PaymentType.PRZELEWY24]: 'przelewy24',
  [PaymentType.SEPA]: 'sepa',
  [PaymentType.SOFORT]: 'sofort',
  [PaymentType.SOLO]: 'solo',
  [PaymentType.SWITCH]: 'switch',
  [PaymentType.UNIONPAY]: 'unionpay',
  [PaymentType.VISA]: 'visa',
};
