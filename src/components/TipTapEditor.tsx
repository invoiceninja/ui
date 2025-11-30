import { useCallback, useState, useEffect } from 'react';

import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import classNames from 'classnames';

import '../../../resources/css/tiptap-editor.css';
import { InputLabel } from './forms';

interface Props {
  value?: string | undefined;
  onValueChange: (value: string) => unknown;
  label?: string;
  disabled?: boolean;
  parentBoxClassName?: string;
  required?: boolean;
  placeholder?: string;
}

export function TipTapEditor({
  value,
  onValueChange,
  label,
  disabled,
  parentBoxClassName,
}: Props) {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(16);
  const [textColor, setTextColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#ffff00');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Subscript,
      Superscript,
      TextStyle,
      Color,
      FontFamily,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onValueChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        spellcheck: 'false',
        style: 'min-height: 7.5rem',
      },
    },
  }) as Editor;

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  const openModal = useCallback(() => {
    if (!editor) return;

    setUrl(editor.getAttributes('link').href || '');

    setIsOpen(true);
  }, [editor]);

  const closeModal = useCallback(() => {
    setIsOpen(false);

    setUrl('');
  }, []);

  const saveLink = useCallback(() => {
    if (!editor) return;

    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url, target: '_blank' })
        .run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }

    closeModal();
  }, [editor, url, closeModal]);

  const removeLink = useCallback(() => {
    if (!editor) return;

    editor.chain().focus().extendMarkRange('link').unsetLink().run();

    closeModal();
  }, [editor, closeModal]);

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 1, 72));
  };

  const ToolbarButton = ({
    onClick,
    isActive,
    disabled: buttonDisabled,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={buttonDisabled}
      title={title}
      className={classNames('toolbar-button', {
        'is-active': isActive,
        'is-disabled': buttonDisabled,
      })}
    >
      {children}
    </button>
  );

  const ToolbarDivider = () => <div className="toolbar-divider" />;

  if (!editor) {
    return null;
  }

  return (
    <div
      className={classNames(
        'flex flex-col space-y-2 w-full',
        parentBoxClassName
      )}
    >
      {label && (
        <div className="flex items-center gap-x-1">
          <div className="flex items-center">
            <InputLabel>{label}</InputLabel>
          </div>
        </div>
      )}

      <div className="markdown-editor-wrapper">
        {/* Toolbar */}
        <div className="markdown-toolbar">
          {/* Undo/Redo */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 7h8c1.7 0 3 1.3 3 3s-1.3 3-3 3H8v-1.5h4c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5H4v2L1 8l3-3v2z" />
            </svg>
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M12 7H4C2.3 7 1 8.3 1 10s1.3 3 3 3h4v-1.5H4c-.8 0-1.5-.7-1.5-1.5S3.2 8.5 4 8.5h8v2l3-3-3-3v2z" />
            </svg>
          </ToolbarButton>

          <ToolbarDivider />

          {/* Block Type Dropdown */}
          {/* <DropdownMenu
            menu={{
              items: [
                {
                  key: 'paragraph',
                  label: 'Paragraph',
                  onClick: () => editor.chain().focus().setParagraph().run(),
                },
                {
                  key: 'h1',
                  label: 'Heading 1',
                  onClick: () =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run(),
                },
                {
                  key: 'h2',
                  label: 'Heading 2',
                  onClick: () =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run(),
                },
                {
                  key: 'h3',
                  label: 'Heading 3',
                  onClick: () =>
                    editor.chain().focus().toggleHeading({ level: 3 }).run(),
                },
              ],
            }}
          >
            <button type="button" className="toolbar-dropdown-trigger">
              {editor.isActive('heading', { level: 1 })
                ? 'H1'
                : editor.isActive('heading', { level: 2 })
                ? 'H2'
                : editor.isActive('heading', { level: 3 })
                ? 'H3'
                : 'Normal'}
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
              >
                <path d="M6 8L2 4h8L6 8z" />
              </svg>
            </button>
          </DropdownMenu> */}

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 2h5c1.7 0 3 1.3 3 3 0 1.1-.6 2-1.4 2.5.9.5 1.4 1.5 1.4 2.5 0 1.7-1.3 3-3 3H4V2zm2 4.5h3c.8 0 1.5-.7 1.5-1.5S9.8 3.5 9 3.5H6v3zm0 5h3.5c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5H6v3z" />
            </svg>
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2h4v1.5h-1.5L7 12.5H9V14H5v-1.5h1.5L10 2.5H8V2z" />
            </svg>
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 12c-2.2 0-4-1.8-4-4V2h1.5v6c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5V2H12v6c0 2.2-1.8 4-4 4zM3 14h10v1H3v-1z" />
            </svg>
          </ToolbarButton>

          <ToolbarDivider />

          {/* Text Color */}
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={textColor}
              onChange={(e) => {
                setTextColor(e.target.value);
                editor.chain().focus().setColor(e.target.value).run();
              }}
              className="color-picker"
              title="Text color"
            />
            <input
              type="color"
              value={bgColor}
              onChange={(e) => {
                setBgColor(e.target.value);
                editor
                  .chain()
                  .focus()
                  .toggleHighlight({ color: e.target.value })
                  .run();
              }}
              className="color-picker"
              title="Background color"
            />
          </div>

          <ToolbarDivider />

          {/* Text Transform & Effects Dropdown */}
          {/* <Dropdown
            menu={{
              items: [
                {
                  key: 'lowercase',
                  label: 'lowercase',
                  onClick: () => {
                    const { from, to } = editor.state.selection;
                    const text = editor.state.doc.textBetween(from, to, '');
                    editor
                      .chain()
                      .focus()
                      .deleteRange({ from, to })
                      .insertContent(text.toLowerCase())
                      .run();
                  },
                },
                {
                  key: 'uppercase',
                  label: 'UPPERCASE',
                  onClick: () => {
                    const { from, to } = editor.state.selection;
                    const text = editor.state.doc.textBetween(from, to, '');
                    editor
                      .chain()
                      .focus()
                      .deleteRange({ from, to })
                      .insertContent(text.toUpperCase())
                      .run();
                  },
                },
                {
                  key: 'capitalize',
                  label: 'Capitalize',
                  onClick: () => {
                    const { from, to } = editor.state.selection;
                    const text = editor.state.doc.textBetween(from, to, '');
                    const capitalized = text
                      .split(' ')
                      .map(
                        (word) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase()
                      )
                      .join(' ');
                    editor
                      .chain()
                      .focus()
                      .deleteRange({ from, to })
                      .insertContent(capitalized)
                      .run();
                  },
                },
                { type: 'divider', key: 'divider1' },
                {
                  key: 'strikethrough',
                  label: 'Strikethrough',
                  onClick: () => editor.chain().focus().toggleStrike().run(),
                },
                {
                  key: 'subscript',
                  label: 'Subscript',
                  onClick: () => editor.chain().focus().toggleSubscript().run(),
                },
                {
                  key: 'superscript',
                  label: 'Superscript',
                  onClick: () =>
                    editor.chain().focus().toggleSuperscript().run(),
                },
                {
                  key: 'highlight',
                  label: 'Highlight',
                  onClick: () => editor.chain().focus().toggleHighlight().run(),
                },
              ],
            }}
          >
            <button type="button" className="toolbar-dropdown-trigger">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M3 2h10v2H3V2zm0 4h10v2H3V6zm0 4h7v2H3v-2z" />
              </svg>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
              >
                <path d="M6 8L2 4h8L6 8z" />
              </svg>
            </button>
          </Dropdown> */}

          <ToolbarDivider />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet list"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="3" cy="3" r="1" />
              <circle cx="3" cy="8" r="1" />
              <circle cx="3" cy="13" r="1" />
              <path d="M6 2h8v2H6V2zm0 5h8v2H6V7zm0 5h8v2H6v-2z" />
            </svg>
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered list"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2h1v3H2V2zm0 5h2v1H2v1h2v1H2V8zm0 4h1.5v.5H2v.5h1.5V14H2v-1zm4-9h8v2H6V2zm0 5h8v2H6V7zm0 5h8v2H6v-2z" />
            </svg>
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            isActive={editor.isActive('taskList')}
            title="Check list"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 3h2v2H2V3zm3 0h9v2H5V3zM2 7h2v2H2V7zm3 0h9v2H5V7zm-3 4h2v2H2v-2zm3 0h9v2H5v-2z" />
              <path d="M3 3.5l.5.5L4 3.5 3.5 3 3 3.5z" fill="#fff" />
            </svg>
          </ToolbarButton>

          <ToolbarDivider />

          {/* Quote & Code */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Quote"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 3h2v2H2V3zm3 0h9v2H5V3zM2 7h2v2H2V7zm3 0h9v2H5V7zm-3 4h2v2H2v-2zm3 0h9v2H5v-2z" />
              <path d="M2 3v10l1.5-1.5V4.5h9L14 3H2z" />
            </svg>
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Code block"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5 5l-3 3 3 3v-2l-2-1 2-1V5zm6 0v2l2 1-2 1v2l3-3-3-3zm-4 8l2-10h1l-2 10H7z" />
            </svg>
          </ToolbarButton>

          <ToolbarButton
            onClick={openModal}
            isActive={editor.isActive('link')}
            title="Link"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8.5 4.5h3c1.4 0 2.5 1.1 2.5 2.5s-1.1 2.5-2.5 2.5h-3v-1.5h3c.8 0 1.5-.7 1.5-1.5S12.3 5 11.5 5h-3V4.5zm-4 2h3v1.5h-3c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5h3V12h-3C3.1 12 2 10.9 2 9.5S3.1 7 4.5 7z" />
              <path d="M5 9h6v1H5V9z" />
            </svg>
          </ToolbarButton>

          <ToolbarDivider />

          {/* Alignment Dropdown */}
          {/* <Dropdown
            menu={{
              items: [
                {
                  key: 'left',
                  label: 'Align Left',
                  onClick: () =>
                    editor.chain().focus().setTextAlign('left').run(),
                },
                {
                  key: 'center',
                  label: 'Align Center',
                  onClick: () =>
                    editor.chain().focus().setTextAlign('center').run(),
                },
                {
                  key: 'right',
                  label: 'Align Right',
                  onClick: () =>
                    editor.chain().focus().setTextAlign('right').run(),
                },
                {
                  key: 'justify',
                  label: 'Justify',
                  onClick: () =>
                    editor.chain().focus().setTextAlign('justify').run(),
                },
                { type: 'divider', key: 'divider2' },
                // {
                //   key: 'outdent',
                //   label: 'Outdent',
                //   onClick: () => editor.chain().focus().outdent().run(),
                // },
                // {
                //   key: 'indent',
                //   label: 'Indent',
                //   onClick: () => editor.chain().focus().indent().run(),
                // },
              ],
            }}
          >
            <button type="button" className="toolbar-dropdown-trigger">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M2 3h12v1H2V3zm0 3h12v1H2V6zm0 3h12v1H2V9zm0 3h12v1H2v-1z" />
              </svg>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
              >
                <path d="M6 8L2 4h8L6 8z" />
              </svg>
            </button>
          </Dropdown> */}
        </div>

        <div className="markdown-editor-content">
          <EditorContent editor={editor} />
        </div>

        {/* Bubble Menu for Links */}
        {/* <BubbleMenu
          className="link-bubble-menu"
          tippyOptions={{ duration: 150 }}
          editor={editor}
          shouldShow={({ editor, from, to }) => {
            return from === to && editor.isActive('link');
          }}
        >
          <button type="button" onClick={openModal} className="bubble-button">
            Edit
          </button>
          <button
            type="button"
            onClick={removeLink}
            className="bubble-button-remove"
          >
            Remove
          </button>
        </BubbleMenu> */}
      </div>
    </div>
  );
}
