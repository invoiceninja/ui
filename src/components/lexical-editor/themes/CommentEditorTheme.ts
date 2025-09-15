/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { EditorThemeClasses } from 'lexical';

import '../css/CommentEditorTheme.css';

import baseTheme from './PlaygroundEditorTheme';

const theme: EditorThemeClasses = {
  ...baseTheme,
  paragraph: 'CommentEditorTheme__paragraph',
};

export default theme;
