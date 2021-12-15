/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { File, Jpg, Pdf, Png, Svg } from './icons';

export function FileIcon(props: { type: string }) {
  const supported = ['jpg', 'svg', 'png', 'pdf'];

  return (
    <>
      {props.type === 'jpg' && <Jpg height={26} />}
      {props.type === 'svg' && <Svg height={26} />}
      {props.type === 'png' && <Png height={26} />}
      {props.type === 'pdf' && <Pdf height={26} />}
      
      {!supported.includes(props.type) && <File height={26} />}
    </>
  );
}
