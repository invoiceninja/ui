/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { CSSProperties } from 'react';

interface Props {
  name: string;
  style?: CSSProperties;
}

export const availableGatewayLogos = [
  'visa',
  'american_express',
  'mastercard',
  'paypal',
  'paypal_express',
  'authorize',
  'braintree',
  'checkoutcom',
  'gocardless',
  'mollie',
  'payfast',
  'paytrace',
  'razorpay',
  'square',
  'stripe',
  'wepay',
  'eway',
  'forte',
];

const imageStyle: CSSProperties = { width: 30, height: 30 };

export function GatewayTypeIcon(props: Props) {
  switch (props.name) {
    case 'visa':
      return (
        <img
          src="/gateway-card-images/visa.png"
          alt="Visa"
          style={imageStyle}
        />
      );

    case 'american_express':
      return (
        <img
          src="/gateway-card-images/american-express.png"
          alt="American Express"
          style={imageStyle}
        />
      );

    case 'mastercard':
      return (
        <img
          src="/gateway-card-images/mastercard.png"
          alt="Mastercard"
          style={imageStyle}
        />
      );

    case 'paypal':
      return (
        <img
          src="/gateway-card-images/paypal.png"
          alt="Paypal"
          style={{ width: 40, height: 40 }}
        />
      );

    case 'paypal_express':
      return (
        <img
          src="/gateway-card-images/paypal.png"
          alt="Paypal"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'authorize':
      return (
        <img
          src="/gateway-card-images/authorize-net.png"
          alt="AuthorizeNet"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'braintree':
      return (
        <img
          src="/gateway-card-images/braintree.svg.png"
          alt="Braintree"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'checkoutcom':
      return (
        <img
          src="/gateway-card-images/checkout.jpg"
          alt="Checkoutcom"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'gocardless':
      return (
        <img
          src="/gateway-card-images/gocardless.png"
          alt="GoCardless"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'mollie':
      return (
        <img
          src="/gateway-card-images/mollie.png"
          alt="Mollie"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'payfast':
      return (
        <img
          src="/gateway-card-images/payfast.png"
          alt="Payfast"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'paytrace':
      return (
        <img
          src="/gateway-card-images/paytrace.svg"
          alt="Paytrace"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'razorpay':
      return (
        <img
          src="/gateway-card-images/razorpay.png"
          alt="Razorpay"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'square':
      return (
        <img
          src="/gateway-card-images/square.svg.png"
          alt="Square"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'stripe':
      return (
        <img
          src="/gateway-card-images/stripe.svg"
          alt="Stripe"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'eway':
      return (
        <img
          src="/gateway-card-images/eway.png"
          alt="Eway"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'forte':
      return (
        <img
          src="/gateway-card-images/forte.png"
          alt="Forte"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'wepay':
      return (
        <img
          src="/gateway-card-images/wepay.svg"
          alt="Wepay"
          style={imageStyle}
        />
      );

    default:
      return <></>;
  }
}
