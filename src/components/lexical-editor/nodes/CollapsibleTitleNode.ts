/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { IS_CHROME } from '@lexical/utils';
import {
  $createParagraphNode,
  $isElementNode,
  buildImportMap,
  DOMConversionOutput,
  EditorConfig,
  ElementNode,
  LexicalEditor,
  LexicalNode,
  RangeSelection,
} from 'lexical';

import { $isCollapsibleContainerNode } from './CollapsibleContainerNode';
import { $isCollapsibleContentNode } from './CollapsibleContentNode';

export function $convertSummaryElement(
  domNode: HTMLElement
): DOMConversionOutput | null {
  const node = $createCollapsibleTitleNode();
  return {
    node,
  };
}

/** @noInheritDoc */
export class CollapsibleTitleNode extends ElementNode {
  /** @internal */
  $config() {
    return this.config('collapsible-title', {
      $transform(node: CollapsibleTitleNode) {
        if (node.isEmpty()) {
          node.remove();
        }
      },
      extends: ElementNode,
      importDOM: buildImportMap({
        summary: () => ({
          conversion: $convertSummaryElement,
          priority: 1,
        }),
      }),
    });
  }

  createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
    const dom = document.createElement('summary');
    dom.classList.add('Collapsible__title');
    if (IS_CHROME) {
      dom.addEventListener('click', () => {
        editor.update(() => {
          const collapsibleContainer = this.getLatest().getParentOrThrow();
          if (!$isCollapsibleContainerNode(collapsibleContainer)) {
            throw new Error(
              'Expected parent node to be a CollapsibleContainerNode'
            );
          }
          collapsibleContainer.toggleOpen();
        });
      });
    }
    return dom;
  }

  updateDOM(prevNode: this, dom: HTMLElement): boolean {
    return false;
  }

  insertNewAfter(_: RangeSelection, restoreSelection = true): ElementNode {
    const containerNode = this.getParentOrThrow();

    if (!$isCollapsibleContainerNode(containerNode)) {
      throw new Error(
        'CollapsibleTitleNode expects to be child of CollapsibleContainerNode'
      );
    }

    if (containerNode.getOpen()) {
      const contentNode = this.getNextSibling();
      if (!$isCollapsibleContentNode(contentNode)) {
        throw new Error(
          'CollapsibleTitleNode expects to have CollapsibleContentNode sibling'
        );
      }

      const firstChild = contentNode.getFirstChild();
      if ($isElementNode(firstChild)) {
        return firstChild;
      } else {
        const paragraph = $createParagraphNode();
        contentNode.append(paragraph);
        return paragraph;
      }
    } else {
      const paragraph = $createParagraphNode();
      containerNode.insertAfter(paragraph, restoreSelection);
      return paragraph;
    }
  }
}

export function $createCollapsibleTitleNode(): CollapsibleTitleNode {
  return new CollapsibleTitleNode();
}

export function $isCollapsibleTitleNode(
  node: LexicalNode | null | undefined
): node is CollapsibleTitleNode {
  return node instanceof CollapsibleTitleNode;
}
