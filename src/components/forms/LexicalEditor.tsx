/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

// import { LexicalComposer } from '@lexical/react/LexicalComposer';
// import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
// import { ContentEditable } from '@lexical/react/LexicalContentEditable';
// import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
// import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
// import { HeadingNode, QuoteNode } from '@lexical/rich-text';
// import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
// import { ListItemNode, ListNode } from '@lexical/list';
// import { CodeHighlightNode, CodeNode } from '@lexical/code';
// import { AutoLinkNode, LinkNode } from '@lexical/link';
// import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
// import { ListPlugin } from '@lexical/react/LexicalListPlugin';
// import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
// import { TRANSFORMERS } from '@lexical/markdown';
// import ToolbarPlugin from './ToolbarPlugin';
// import TreeViewPlugin from './TreeViewPlugin';
// import CodeHighlightPlugin from './CodeHighlightPlugin';
// import ListMaxIndentLevelPlugin from './ListMaxIndentLevelPlugin';
// import AutoLinkPlugin from './AutoLinkPlugin';

// interface Props {
//   value: string | undefined;
//   onChange: (value: string) => void;
// }

// function Placeholder() {
//   return <div className="editor-placeholder">Enter some rich text...</div>;
// }

// export function LexicalEditor({ value, onChange }: Props) {
//   const theme = {
//     ltr: 'ltr',
//     rtl: 'rtl',
//     placeholder: 'editor-placeholder',
//     paragraph: 'editor-paragraph',
//     quote: 'editor-quote',
//     heading: {
//       h1: 'editor-heading-h1',
//       h2: 'editor-heading-h2',
//       h3: 'editor-heading-h3',
//       h4: 'editor-heading-h4',
//       h5: 'editor-heading-h5',
//     },
//     list: {
//       nested: {
//         listitem: 'editor-nested-listitem',
//       },
//       ol: 'editor-list-ol',
//       ul: 'editor-list-ul',
//       listitem: 'editor-listitem',
//     },
//     image: 'editor-image',
//     link: 'editor-link',
//     text: {
//       bold: 'editor-text-bold',
//       italic: 'editor-text-italic',
//       overflowed: 'editor-text-overflowed',
//       hashtag: 'editor-text-hashtag',
//       underline: 'editor-text-underline',
//       strikethrough: 'editor-text-strikethrough',
//       underlineStrikethrough: 'editor-text-underlineStrikethrough',
//       code: 'editor-text-code',
//     },
//     code: 'editor-code',
//     codeHighlight: {
//       atrule: 'editor-tokenAttr',
//       attr: 'editor-tokenAttr',
//       boolean: 'editor-tokenProperty',
//       builtin: 'editor-tokenSelector',
//       cdata: 'editor-tokenComment',
//       char: 'editor-tokenSelector',
//       class: 'editor-tokenFunction',
//       'class-name': 'editor-tokenFunction',
//       comment: 'editor-tokenComment',
//       constant: 'editor-tokenProperty',
//       deleted: 'editor-tokenProperty',
//       doctype: 'editor-tokenComment',
//       entity: 'editor-tokenOperator',
//       function: 'editor-tokenFunction',
//       important: 'editor-tokenVariable',
//       inserted: 'editor-tokenSelector',
//       keyword: 'editor-tokenAttr',
//       namespace: 'editor-tokenVariable',
//       number: 'editor-tokenProperty',
//       operator: 'editor-tokenOperator',
//       prolog: 'editor-tokenComment',
//       property: 'editor-tokenProperty',
//       punctuation: 'editor-tokenPunctuation',
//       regex: 'editor-tokenVariable',
//       selector: 'editor-tokenSelector',
//       string: 'editor-tokenSelector',
//       symbol: 'editor-tokenProperty',
//       tag: 'editor-tokenProperty',
//       url: 'editor-tokenOperator',
//       variable: 'editor-tokenVariable',
//     },
//   };
//   const editorConfig = {
//     // The editor theme
//     theme,
//     // Handling of errors during update
//     onError(error: Error) {
//       throw error;
//     },
//     // Any custom nodes go here
//     nodes: [
//       HeadingNode,
//       ListNode,
//       ListItemNode,
//       QuoteNode,
//       CodeNode,
//       CodeHighlightNode,
//       TableNode,
//       TableCellNode,
//       TableRowNode,
//       AutoLinkNode,
//       LinkNode,
//     ],
//   };

//   return (
//     <LexicalComposer initialConfig={editorConfig}>
//       <div className="editor-container">
//         <ToolbarPlugin />
//         <div className="editor-inner">
//           <RichTextPlugin
//             contentEditable={<ContentEditable className="editor-input" />}
//             placeholder={<Placeholder />}
//             ErrorBoundary={() => <div></div>}
//           />
//           <HistoryPlugin />
//           <TreeViewPlugin />
//           <AutoFocusPlugin />
//           <CodeHighlightPlugin />
//           <ListPlugin />
//           <LinkPlugin />
//           <AutoLinkPlugin />
//           <ListMaxIndentLevelPlugin maxDepth={7} />
//           <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
//         </div>
//       </div>
//     </LexicalComposer>
//   );
// }

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import {
  $isTextNode,
  DOMConversionMap,
  DOMExportOutput,
  DOMExportOutputMap,
  isHTMLElement,
  Klass,
  LexicalEditor,
  LexicalNode,
  ParagraphNode,
  TextNode,
} from 'lexical';

import ToolbarPlugin from './ToolbarPlugin';

const MIN_ALLOWED_FONT_SIZE = 8;
const MAX_ALLOWED_FONT_SIZE = 72;

export const parseAllowedFontSize = (input: string): string => {
  const match = input.match(/^(\d+(?:\.\d+)?)px$/);
  if (match) {
    const n = Number(match[1]);
    if (n >= MIN_ALLOWED_FONT_SIZE && n <= MAX_ALLOWED_FONT_SIZE) {
      return input;
    }
  }
  return '';
};

export function parseAllowedColor(input: string) {
  return /^rgb\(\d+, \d+, \d+\)$/.test(input) ? input : '';
}

const placeholder = 'Enter some rich text...';

const removeStylesExportDOM = (
  editor: LexicalEditor,
  target: LexicalNode
): DOMExportOutput => {
  const output = target.exportDOM(editor);
  if (output && isHTMLElement(output.element)) {
    // Remove all inline styles and classes if the element is an HTMLElement
    // Children are checked as well since TextNode can be nested
    // in i, b, and strong tags.
    for (const el of [
      output.element,
      ...output.element.querySelectorAll('[style],[class]'),
    ]) {
      el.removeAttribute('class');
      el.removeAttribute('style');
    }
  }
  return output;
};

const exportMap: DOMExportOutputMap = new Map<
  Klass<LexicalNode>,
  (editor: LexicalEditor, target: LexicalNode) => DOMExportOutput
>([
  [ParagraphNode, removeStylesExportDOM],
  [TextNode, removeStylesExportDOM],
]);

const getExtraStyles = (element: HTMLElement): string => {
  // Parse styles from pasted input, but only if they match exactly the
  // sort of styles that would be produced by exportDOM
  let extraStyles = '';
  const fontSize = parseAllowedFontSize(element.style.fontSize);
  const backgroundColor = parseAllowedColor(element.style.backgroundColor);
  const color = parseAllowedColor(element.style.color);
  if (fontSize !== '' && fontSize !== '15px') {
    extraStyles += `font-size: ${fontSize};`;
  }
  if (backgroundColor !== '' && backgroundColor !== 'rgb(255, 255, 255)') {
    extraStyles += `background-color: ${backgroundColor};`;
  }
  if (color !== '' && color !== 'rgb(0, 0, 0)') {
    extraStyles += `color: ${color};`;
  }
  return extraStyles;
};

const constructImportMap = (): DOMConversionMap => {
  const importMap: DOMConversionMap = {};

  // Wrap all TextNode importers with a function that also imports
  // the custom styles implemented by the playground
  for (const [tag, fn] of Object.entries(TextNode.importDOM() || {})) {
    importMap[tag] = (importNode) => {
      const importer = fn(importNode);
      if (!importer) {
        return null;
      }
      return {
        ...importer,
        conversion: (element) => {
          const output = importer.conversion(element);
          if (
            output === null ||
            output.forChild === undefined ||
            output.after !== undefined ||
            output.node !== null
          ) {
            return output;
          }
          const extraStyles = getExtraStyles(element);
          if (extraStyles) {
            const { forChild } = output;
            return {
              ...output,
              forChild: (child, parent) => {
                const textNode = forChild(child, parent);
                if ($isTextNode(textNode)) {
                  textNode.setStyle(textNode.getStyle() + extraStyles);
                }
                return textNode;
              },
            };
          }
          return output;
        },
      };
    };
  }

  return importMap;
};

const editorConfig = {
  html: {
    export: exportMap,
    import: constructImportMap(),
  },
  namespace: 'React.js Demo',
  nodes: [ParagraphNode, TextNode],
  onError(error: Error) {
    throw error;
  },
  theme: {
    code: 'editor-code',
    heading: {
      h1: 'editor-heading-h1',
      h2: 'editor-heading-h2',
      h3: 'editor-heading-h3',
      h4: 'editor-heading-h4',
      h5: 'editor-heading-h5',
    },
    image: 'editor-image',
    link: 'editor-link',
    list: {
      listitem: 'editor-listitem',
      nested: {
        listitem: 'editor-nested-listitem',
      },
      ol: 'editor-list-ol',
      ul: 'editor-list-ul',
    },
    paragraph: 'editor-paragraph',
    placeholder: 'editor-placeholder',
    quote: 'editor-quote',
    text: {
      bold: 'editor-text-bold',
      code: 'editor-text-code',
      hashtag: 'editor-text-hashtag',
      italic: 'editor-text-italic',
      overflowed: 'editor-text-overflowed',
      strikethrough: 'editor-text-strikethrough',
      underline: 'editor-text-underline',
      underlineStrikethrough: 'editor-text-underlineStrikethrough',
    },
  },
};

export function LexicalEditorComponent() {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        <ToolbarPlugin />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="editor-input"
                aria-placeholder={placeholder}
                placeholder={
                  <div className="editor-placeholder">{placeholder}</div>
                }
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
        </div>
      </div>
    </LexicalComposer>
  );
}
