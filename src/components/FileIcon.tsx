/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { File, Jpg, Pdf, Png, Svg } from './icons';

interface Props {
  type: string;
  height?: number;
}
export function FileIcon(props: Props) {
  const supported = ['jpg', 'svg', 'png', 'pdf'];

  const { height } = props;

  return (
    <>
      {props.type === 'jpg' && <Jpg height={height || 26} />}
      {props.type === 'svg' && <Svg height={height || 26} />}
      {props.type === 'png' && <Png height={height || 26} />}
      {props.type === 'pdf' && <Pdf height={height || 26} />}

      {!supported.includes(props.type) && <File height={height || 26} />}
    </>
  );
}
