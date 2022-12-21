/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { BiPlusCircle } from 'react-icons/bi';
import {
  MdPictureAsPdf,
  MdArchive,
  MdDelete,
  MdDeleteForever,
} from 'react-icons/md';

interface Props {
  type: 'view' | 'new' | 'archive' | 'delete' | 'purge';
  fontSize?: number;
  color?: string;
}

export function Icon(props: Props) {
  const fontSize = props.fontSize ? props.fontSize : 18;

  switch (props.type) {
    case 'view':
      return (
        <MdPictureAsPdf
          fontSize={fontSize}
          color={props.color ? props.color : '#278ADF'}
        />
      );

    case 'archive':
      return (
        <MdArchive
          fontSize={fontSize}
          color={props.color ? props.color : '#DFA129'}
        />
      );

    case 'delete':
      return (
        <MdDelete
          fontSize={fontSize}
          color={props.color ? props.color : '#EF4444'}
        />
      );

    case 'purge':
      return (
        <MdDeleteForever
          fontSize={fontSize}
          color={props.color ? props.color : '#EF4444'}
        />
      );

    default:
      return (
        <BiPlusCircle
          fontSize={fontSize}
          color={props.color ? props.color : '#278ADF'}
        />
      );
  }
}
