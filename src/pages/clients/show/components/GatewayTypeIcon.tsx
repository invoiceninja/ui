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
import visaLogo from '/gateway-card-images/visa.png';
import authorizeLogo from '/gateway-card-images/authorize-net.png';
import americanExpressLogo from '/gateway-card-images/american-express.png';
import masterCardLogo from '/gateway-card-images/mastercard.png';
import paypalLogo from '/gateway-card-images/paypal.png';
import braintreeLogo from '/gateway-card-images/braintree.svg.png';
import checkoutcomLogo from '/gateway-card-images/checkout.jpg';
import goCardlessLogo from '/gateway-card-images/gocardless.png';
import mollieLogo from '/gateway-card-images/mollie.png';
import payfastLogo from '/gateway-card-images/payfast.png';
import paytraceLogo from '/gateway-card-images/paytrace.svg';
import razorpayLogo from '/gateway-card-images/razorpay.png';
import squareLogo from '/gateway-card-images/square.svg.png';
import stripeLogo from '/gateway-card-images/stripe.svg';
import ewayLogo from '/gateway-card-images/eway.png';
import forteLogo from '/gateway-card-images/forte.png';
import wepayLogo from '/gateway-card-images/wepay.svg';

interface Props {
  name: string;
  style?: CSSProperties;
}

export const availableGatewayLogos = [
  'paypal_ppcp',
  'visa',
  'american_express',
  'mastercard',
  'paypal',
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

export function GatewayTypeIcon(props: Props) {
  switch (props.name) {
    case 'visa':
      return (
        <img
          src={visaLogo}
          alt="Visa"
          style={props.style || { width: 30, height: 30 }}
        />
      );

    case 'american_express':
      return (
        <img
          src={americanExpressLogo}
          alt="American Express"
          style={props.style || { width: 30, height: 30 }}
        />
      );

    case 'mastercard':
      return (
        <img
          src={masterCardLogo}
          alt="Mastercard"
          style={props.style || { width: 30, height: 30 }}
        />
      );

    case 'paypal':
      return (
        <img
          src={paypalLogo}
          alt="PayPal"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'paypal_ppcp':
      return (
        <img
          src={paypalLogo}
          alt="PayPal"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'authorize':
      return (
        <img
          src={authorizeLogo}
          alt="AuthorizeNet"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'braintree':
      return (
        <img
          src={braintreeLogo}
          alt="Braintree"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'checkoutcom':
      return (
        <img
          src={checkoutcomLogo}
          alt="Checkoutcom"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'gocardless':
      return (
        <img
          src={goCardlessLogo}
          alt="GoCardless"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'mollie':
      return (
        <img
          src={mollieLogo}
          alt="Mollie"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'payfast':
      return (
        <img
          src={payfastLogo}
          alt="Payfast"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'paytrace':
      return (
        <img
          src={paytraceLogo}
          alt="Paytrace"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'razorpay':
      return (
        <img
          src={razorpayLogo}
          alt="Razorpay"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'square':
      return (
        <img
          src={squareLogo}
          alt="Square"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'stripe':
      return (
        <img
          src={stripeLogo}
          alt="Stripe"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'eway':
      return (
        <img
          src={ewayLogo}
          alt="Eway"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'forte':
      return (
        <img
          src={forteLogo}
          alt="Forte"
          style={props.style || { width: 40, height: 40 }}
        />
      );

    case 'wepay':
      return (
        <img
          src={wepayLogo}
          alt="Wepay"
          style={props.style || { width: 30, height: 30 }}
        />
      );

    default:
      return <></>;
  }
}
