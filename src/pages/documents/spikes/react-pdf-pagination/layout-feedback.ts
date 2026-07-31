export interface ReactPdfLayoutNode {
  type?: string;
  props?: {
    id?: string;
  };
  box?: {
    top?: number;
    height?: number;
  };
  lines?: Array<{
    string?: string;
  }>;
  children?: ReactPdfLayoutNode[];
}

export interface BlockPlacement {
  blockId: string;
  pageNumber: number;
  top: number;
  height: number;
  isContinuation: boolean;
  fragmentText?: string;
}

export interface PaginationFeedback {
  pageCount: number;
  placements: BlockPlacement[];
  splitBlockIds: string[];
}

export function extractPaginationFeedback(
  layout: ReactPdfLayoutNode | undefined
): PaginationFeedback {
  const pages = layout?.children ?? [];
  const placements: BlockPlacement[] = [];
  const seen = new Set<string>();
  const split = new Set<string>();

  pages.forEach((page, pageIndex) => {
    for (const node of page.children ?? []) {
      const blockId = node.props?.id;

      if (!blockId?.startsWith('block-')) {
        continue;
      }

      const isContinuation = seen.has(blockId);

      if (isContinuation) {
        split.add(blockId);
      }

      seen.add(blockId);
      const textNode = findTextNode(node);
      const fragmentText = textNode?.lines
        ?.map((line) => line.string ?? '')
        .join('\n');

      placements.push({
        blockId,
        pageNumber: pageIndex + 1,
        top: node.box?.top ?? 0,
        height: node.box?.height ?? 0,
        isContinuation,
        ...(fragmentText ? { fragmentText } : {}),
      });
    }
  });

  return {
    pageCount: pages.length,
    placements,
    splitBlockIds: [...split],
  };
}

function findTextNode(
  node: ReactPdfLayoutNode
): ReactPdfLayoutNode | undefined {
  return findContentTextNode(node) ?? findAnyTextNode(node);
}

function findContentTextNode(
  node: ReactPdfLayoutNode
): ReactPdfLayoutNode | undefined {
  if (
    node.type === 'TEXT' &&
    node.lines?.length &&
    node.props?.id?.endsWith('-content')
  ) {
    return node;
  }

  for (const child of node.children ?? []) {
    const result = findContentTextNode(child);

    if (result) {
      return result;
    }
  }

  return undefined;
}

function findAnyTextNode(
  node: ReactPdfLayoutNode
): ReactPdfLayoutNode | undefined {
  if (node.type === 'TEXT' && node.lines?.length) {
    return node;
  }

  for (const child of node.children ?? []) {
    const result = findAnyTextNode(child);

    if (result) {
      return result;
    }
  }

  return undefined;
}
