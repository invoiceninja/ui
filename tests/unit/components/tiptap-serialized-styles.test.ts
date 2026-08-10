import { Editor, type JSONContent } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TaskList from '@tiptap/extension-task-list';
import StarterKit from '@tiptap/starter-kit';
import { afterAll, describe, expect, it } from 'vitest';
import {
  LIST_PARAGRAPH_ATTRIBUTE,
  SERIALIZED_STYLE_TYPES,
  SerializedStyles,
  StyledTaskItem,
  TASK_ITEM_CONTENT_STYLE,
  TASK_ITEM_LABEL_STYLE,
  getSerializedStyle,
} from '../../../src/components/tiptap/serializedStyles';

const styledTypes = [
  'paragraph',
  'heading',
  'bulletList',
  'orderedList',
  'blockquote',
  'codeBlock',
  'code',
  'link',
  'image',
  'table',
  'tableCell',
  'tableHeader',
  'taskList',
  'taskItem',
  'horizontalRule',
];

describe('TipTap serialized styles', () => {
  const editor = new Editor({
    element: null,
    extensions: [
      StarterKit,
      SerializedStyles,
      Image.configure({ inline: true }),
      Table,
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      StyledTaskItem.configure({ nested: true }),
    ],
    content: {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    },
  });

  function renderNode(
    type: string,
    attributes: Record<string, unknown> = {},
    content?: JSONContent[]
  ) {
    const node = editor.schema.nodeFromJSON({
      type,
      attrs: attributes,
      content,
    });
    const output = node.type.spec.toDOM?.(node);

    if (!Array.isArray(output)) {
      throw new Error(`Expected ${type} to render a DOM output spec`);
    }

    return output;
  }

  afterAll(() => editor.destroy());

  it('covers every styled editor node and preserves styles on structural nodes', () => {
    expect(SERIALIZED_STYLE_TYPES).toEqual(
      expect.arrayContaining([
        ...styledTypes,
        'listItem',
        'tableRow',
        'hardBreak',
      ])
    );

    styledTypes.forEach((type) => {
      expect(getSerializedStyle(type)).toBeTruthy();
    });
  });

  it('applies the matching style for each supported heading level', () => {
    expect(getSerializedStyle('heading', { level: 1 })).toContain(
      'font-size: 2em'
    );
    expect(getSerializedStyle('heading', { level: 2 })).toContain(
      'font-size: 1.5em'
    );
    expect(getSerializedStyle('heading', { level: 3 })).toContain(
      'font-size: 1.17em'
    );
    expect(getSerializedStyle('heading', { level: 4 })).toContain(
      'font-size: 1em'
    );
    expect(getSerializedStyle('heading', { level: 4 })).toContain(
      'line-height: 1.6'
    );
  });

  it('lets imported inline styles override defaults without losing other defaults', () => {
    expect(
      getSerializedStyle('paragraph', {
        style: 'margin: 2em; text-align: center',
      })
    ).toBe('margin: 2em; line-height: 1.6; text-align: center');
  });

  it('removes paragraph margins inside list items', () => {
    expect(
      getSerializedStyle('paragraph', {
        [LIST_PARAGRAPH_ATTRIBUTE]: true,
      })
    ).toBe('margin: 0; line-height: normal');

    expect(
      getSerializedStyle('paragraph', {
        [LIST_PARAGRAPH_ATTRIBUTE]: true,
        style: 'margin: 0 0 1em; color: red',
      })
    ).toBe('margin: 0; line-height: normal; color: red');

    expect(getSerializedStyle('bulletList')).toContain('margin: 0 0 1em');
    expect(getSerializedStyle('orderedList')).toContain('margin: 0 0 1em');
  });

  it('keeps presentation tables and their cells borderless', () => {
    expect(getSerializedStyle('table', { role: 'presentation' })).toBe(
      'border-collapse: collapse; margin: 0'
    );
    expect(getSerializedStyle('tableCell', { presentationTable: true })).toBe(
      'border: none; padding: 0; min-width: 0'
    );
    expect(
      getSerializedStyle('tableHeader', { presentationTable: true })
    ).toContain('background-color: transparent');
  });

  it('styles regular tables while retaining custom cell declarations', () => {
    expect(getSerializedStyle('table')).toContain('width: 100%');
    expect(
      getSerializedStyle('tableCell', {
        style: 'padding: 4px; vertical-align: top',
      })
    ).toContain('padding: 4px');
    expect(
      getSerializedStyle('tableCell', {
        style: 'padding: 4px; vertical-align: top',
      })
    ).toContain('vertical-align: top');
  });

  it('preserves explicit styles on nodes without visual defaults', () => {
    expect(getSerializedStyle('hardBreak', { style: 'display: block' })).toBe(
      'display: block'
    );
    expect(getSerializedStyle('hardBreak')).toBeUndefined();
  });

  it('injects defaults through the TipTap schema renderers', () => {
    const paragraph = renderNode('paragraph');
    const heading = renderNode('heading', { level: 2 });
    const bulletList = renderNode('bulletList', {}, [
      {
        type: 'listItem',
        content: [{ type: 'paragraph' }],
      },
    ]);
    const blockquote = renderNode('blockquote', {}, [{ type: 'paragraph' }]);
    const codeBlock = renderNode('codeBlock');
    const image = renderNode('image', { src: 'data:image/png;base64,abc' });
    const horizontalRule = renderNode('horizontalRule');

    expect(paragraph[1]).toEqual({
      style: 'margin: 0 0 1em; line-height: 1.6',
    });
    expect(heading[0]).toBe('h2');
    expect(heading[1]).toEqual(
      expect.objectContaining({ style: expect.stringContaining('1.5em') })
    );
    expect(bulletList[1]).toEqual(
      expect.objectContaining({
        style: expect.stringContaining('list-style-type: disc'),
      })
    );
    expect(blockquote[1]).toEqual(
      expect.objectContaining({
        style: expect.stringContaining('border-left: 3px solid'),
      })
    );
    expect(codeBlock[1]).toEqual(
      expect.objectContaining({
        style: expect.stringContaining('line-height: 1.6'),
      })
    );
    expect(image[1]).toEqual(
      expect.objectContaining({
        style: expect.stringContaining('max-width: 100%'),
      })
    );
    expect(horizontalRule[1]).toEqual(
      expect.objectContaining({
        style: expect.stringContaining('border-top: 1px solid'),
      })
    );
  });

  it('serializes table and task-list layout into their generated tags', () => {
    const table = renderNode('table', {}, [
      {
        type: 'tableRow',
        content: [
          {
            type: 'tableCell',
            content: [{ type: 'paragraph' }],
          },
        ],
      },
    ]);
    const tableCell = renderNode('tableCell', {}, [{ type: 'paragraph' }]);
    const tableHeader = renderNode('tableHeader', {}, [{ type: 'paragraph' }]);
    const taskList = renderNode('taskList', {}, [
      {
        type: 'taskItem',
        attrs: { checked: true },
        content: [{ type: 'paragraph' }],
      },
    ]);
    const taskItem = renderNode('taskItem', { checked: true }, [
      { type: 'paragraph' },
    ]);

    expect(table[1]).toEqual(
      expect.objectContaining({
        style: expect.stringContaining('width: 100%'),
      })
    );
    expect(tableCell[1]).toEqual(
      expect.objectContaining({
        style: expect.stringContaining('padding: 8px 12px'),
      })
    );
    expect(tableHeader[1]).toEqual(
      expect.objectContaining({
        style: expect.stringContaining('font-weight: 600'),
      })
    );
    expect(taskList[1]).toEqual(
      expect.objectContaining({
        style: 'list-style: none; padding: 0; margin: 0 0 1em',
      })
    );
    expect(taskItem[1]).toEqual(
      expect.objectContaining({
        style: 'display: flex; align-items: flex-start; margin: 0.5em 0',
      })
    );
    expect(taskItem[2]).toEqual(
      expect.arrayContaining(['label', { style: TASK_ITEM_LABEL_STYLE }])
    );
    expect(taskItem[3]).toEqual(['div', { style: TASK_ITEM_CONTENT_STYLE }, 0]);
  });

  it('synchronizes paragraph spacing when content enters or leaves a list', () => {
    editor.view.updateState(
      editor.state.reconfigure({
        plugins: editor.extensionManager.plugins,
      })
    );
    editor.commands.setContent({
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph' }],
            },
          ],
        },
      ],
    });

    const listParagraph = editor.state.doc.firstChild?.firstChild?.firstChild;

    expect(listParagraph?.attrs[LIST_PARAGRAPH_ATTRIBUTE]).toBe(true);
    expect(renderNode('paragraph', { ...listParagraph?.attrs })[1]).toEqual({
      style: 'margin: 0; line-height: normal',
    });

    editor.commands.setContent({
      type: 'doc',
      content: [{ type: 'paragraph' }],
    });

    const paragraph = editor.state.doc.firstChild;

    expect(paragraph?.attrs[LIST_PARAGRAPH_ATTRIBUTE]).toBe(false);
    expect(renderNode('paragraph', { ...paragraph?.attrs })[1]).toEqual({
      style: 'margin: 0 0 1em; line-height: 1.6',
    });
  });
});
