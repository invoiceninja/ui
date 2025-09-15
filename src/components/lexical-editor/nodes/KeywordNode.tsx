/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { EditorConfig, LexicalNode, SerializedTextNode } from 'lexical';

import { $applyNodeReplacement, TextNode } from 'lexical';

export type SerializedKeywordNode = SerializedTextNode;

export class KeywordNode extends TextNode {
  static getType(): string {
    return 'keyword';
  }

  static clone(node: KeywordNode): KeywordNode {
    return new KeywordNode(node.__text, node.__key);
  }

  static importJSON(serializedNode: SerializedKeywordNode): KeywordNode {
    return $createKeywordNode().updateFromJSON(serializedNode);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.style.cursor = 'default';
    dom.className = 'keyword';
    return dom;
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }

  isTextEntity(): true {
    return true;
  }
}

export function $createKeywordNode(keyword: string = ''): KeywordNode {
  return $applyNodeReplacement(new KeywordNode(keyword));
}

export function $isKeywordNode(node: LexicalNode | null | undefined): boolean {
  return node instanceof KeywordNode;
}
