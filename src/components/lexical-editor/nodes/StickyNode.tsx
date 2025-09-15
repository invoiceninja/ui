/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  LexicalUpdateJSON,
  NodeKey,
  SerializedEditor,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import type { JSX } from 'react';

import { $setSelection, createEditor, DecoratorNode } from 'lexical';
import StickyComponent from '../components/StickyComponent';
import { createPortal } from 'react-dom';

type StickyNoteColor = 'pink' | 'yellow';

export type SerializedStickyNode = Spread<
  {
    xOffset: number;
    yOffset: number;
    color: StickyNoteColor;
    caption: SerializedEditor;
  },
  SerializedLexicalNode
>;

export class StickyNode extends DecoratorNode<JSX.Element> {
  __x: number;
  __y: number;
  __color: StickyNoteColor;
  __caption: LexicalEditor;

  static getType(): string {
    return 'sticky';
  }

  static clone(node: StickyNode): StickyNode {
    return new StickyNode(
      node.__x,
      node.__y,
      node.__color,
      node.__caption,
      node.__key
    );
  }
  static importJSON(serializedNode: SerializedStickyNode): StickyNode {
    return new StickyNode(
      serializedNode.xOffset,
      serializedNode.yOffset,
      serializedNode.color
    ).updateFromJSON(serializedNode);
  }

  updateFromJSON(
    serializedNode: LexicalUpdateJSON<SerializedStickyNode>
  ): this {
    const stickyNode = super.updateFromJSON(serializedNode);
    const caption = serializedNode.caption;
    const nestedEditor = stickyNode.__caption;
    const editorState = nestedEditor.parseEditorState(caption.editorState);
    if (!editorState.isEmpty()) {
      nestedEditor.setEditorState(editorState);
    }
    return stickyNode;
  }

  constructor(
    x: number,
    y: number,
    color: 'pink' | 'yellow',
    caption?: LexicalEditor,
    key?: NodeKey
  ) {
    super(key);
    this.__x = x;
    this.__y = y;
    this.__caption = caption || createEditor();
    this.__color = color;
  }

  exportJSON(): SerializedStickyNode {
    return {
      ...super.exportJSON(),
      caption: this.__caption.toJSON(),
      color: this.__color,
      xOffset: this.__x,
      yOffset: this.__y,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.style.display = 'contents';
    return div;
  }

  updateDOM(): false {
    return false;
  }

  setPosition(x: number, y: number): void {
    const writable = this.getWritable();
    writable.__x = x;
    writable.__y = y;
    $setSelection(null);
  }

  toggleColor(): void {
    const writable = this.getWritable();
    writable.__color = writable.__color === 'pink' ? 'yellow' : 'pink';
  }

  decorate(editor: LexicalEditor, config: EditorConfig): JSX.Element {
    return createPortal(
      <StickyComponent
        color={this.__color}
        x={this.__x}
        y={this.__y}
        nodeKey={this.getKey()}
        caption={this.__caption}
      />,
      document.body
    );
  }

  isIsolated(): true {
    return true;
  }
}

export function $isStickyNode(
  node: LexicalNode | null | undefined
): node is StickyNode {
  return node instanceof StickyNode;
}

export function $createStickyNode(
  xOffset: number,
  yOffset: number
): StickyNode {
  return new StickyNode(xOffset, yOffset, 'yellow');
}
