/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  FOCUS_COMMAND,
} from 'lexical';
import { useEffect } from 'react';

const TAB_TO_FOCUS_INTERVAL = 100;

let lastTabKeyDownTimestamp = 0;
let hasRegisteredKeyDownListener = false;

function registerKeyTimeStampTracker() {
  window.addEventListener(
    'keydown',
    (event: KeyboardEvent) => {
      // Tab
      if (event.key === 'Tab') {
        lastTabKeyDownTimestamp = event.timeStamp;
      }
    },
    true
  );
}

export default function TabFocusPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!hasRegisteredKeyDownListener) {
      registerKeyTimeStampTracker();
      hasRegisteredKeyDownListener = true;
    }

    return editor.registerCommand(
      FOCUS_COMMAND,
      (event: FocusEvent) => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          if (
            lastTabKeyDownTimestamp + TAB_TO_FOCUS_INTERVAL >
            event.timeStamp
          ) {
            $setSelection(selection.clone());
          }
        }
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  return null;
}
