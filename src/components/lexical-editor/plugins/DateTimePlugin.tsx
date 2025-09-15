/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { JSX } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $wrapNodeInElement, mergeRegister } from '@lexical/utils';
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand,
} from 'lexical';
import { useEffect } from 'react';

import { $createDateTimeNode, DateTimeNode } from '../nodes/DateTimeNode';

type CommandPayload = {
  dateTime: Date;
};

export const INSERT_DATETIME_COMMAND: LexicalCommand<CommandPayload> =
  createCommand('INSERT_DATETIME_COMMAND');

export default function DateTimePlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([DateTimeNode])) {
      throw new Error('DateTimePlugin: DateTimeNode not registered on editor');
    }

    return mergeRegister(
      editor.registerCommand<CommandPayload>(
        INSERT_DATETIME_COMMAND,
        (payload) => {
          const { dateTime } = payload;
          const dateTimeNode = $createDateTimeNode(dateTime);

          $insertNodes([dateTimeNode]);
          if ($isRootOrShadowRoot(dateTimeNode.getParentOrThrow())) {
            $wrapNodeInElement(dateTimeNode, $createParagraphNode).selectEnd();
          }

          return true;
        },
        COMMAND_PRIORITY_EDITOR
      )
    );
  }, [editor]);

  return null;
}
