/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AiFillAlipaySquare, AiOutlineCreditCard } from 'react-icons/ai';
import { BsCashStack } from 'react-icons/bs';
import { FaCcMastercard, FaCcPaypal, FaCcVisa } from 'react-icons/fa';
import { SiAmericanexpress, SiZelle } from 'react-icons/si';
import { CiBitcoin, CiMoneyCheck1 } from 'react-icons/ci';

interface Props {
  name: string;
}

export function GatewayTypeIcon(props: Props) {
  switch (props.name) {
    case 'visa':
      return <FaCcVisa fontSize={19} />;

    case 'american_express':
      return <SiAmericanexpress fontSize={19} />;

    case 'ali_pay':
      return <AiFillAlipaySquare fontSize={19} />;

    case 'cash':
      return <BsCashStack fontSize={19} />;

    case 'check':
      return <CiMoneyCheck1 fontSize={19} />;

    case 'crypto_currency':
      return <CiBitcoin fontSize={19} />;

    case 'mastercard':
      return <FaCcMastercard fontSize={19} />;

    case 'paypal':
      return <FaCcPaypal fontSize={19} />;

    case 'zelle':
      return <SiZelle fontSize={19} />;

    default:
      return <AiOutlineCreditCard fontSize={19} />;
  }
}
