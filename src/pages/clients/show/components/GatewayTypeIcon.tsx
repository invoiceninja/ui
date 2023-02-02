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
}

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
