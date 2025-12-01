import { useCallback, useState, useEffect, useRef } from 'react';
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaSubscript,
  FaSuperscript,
  FaLink,
  FaUnlink,
  FaQuoteRight,
  FaCode,
  FaAlignLeft,
  FaUndo,
  FaRedo,
  FaParagraph,
  FaFont,
  FaTextHeight,
  FaChevronDown,
} from 'react-icons/fa';
import { MdFormatListBulleted } from 'react-icons/md';

import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Strike from '@tiptap/extension-strike';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Extension } from '@tiptap/core';

import { InputLabel } from './forms';
import 'src/resources/css/tiptap-editor.css';
import { Icon } from './icons/Icon';

// Custom FontSize extension
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) => {
          return chain().setMark('textStyle', { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark('textStyle', { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});

// Simple BubbleMenu implementation
const BubbleMenu = ({ editor, className, children }: any) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!editor) return;

    const update = () => {
      const { from, to } = editor.state.selection;
      const shouldShow = from !== to && editor.isActive('link');

      if (shouldShow) {
        const { view } = editor;
        const { state } = view;
        const { selection } = state;
        const { $from, $to } = selection;
        const start = view.coordsAtPos($from.pos);
        const end = view.coordsAtPos($to.pos);

        setPosition({
          x: (start.left + end.left) / 2,
          y: start.top - 40,
        });
      }

      setVisible(shouldShow);
    };

    editor.on('selectionUpdate', update);
    return () => {
      editor.off('selectionUpdate', update);
    };
  }, [editor]);

  if (!visible || !editor) return null;

  return (
    <div
      className={`bubble-menu ${className}`}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%)',
      }}
    >
      {children}
    </div>
  );
};

interface Props {
  value?: string;
  onValueChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  parentBoxClassName?: string;
  required?: boolean;
  placeholder?: string;
  minHeight?: string;
}

interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export function TipTapEditor({
  value,
  onValueChange,
  label,
  disabled,
  parentBoxClassName,
  placeholder = 'Start typing...',
  minHeight = '300px',
}: Props) {
  const [linkModal, setLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#FFFF00');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Underline,
      Strike,
      Subscript,
      Superscript,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
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
        class: 'editor-content',
        style: `min-height: ${minHeight}`,
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.values(dropdownRefs.current).forEach((ref) => {
        if (ref && !ref.contains(event.target as Node)) {
          setDropdownOpen(null);
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (dropdown: string) => {
    setDropdownOpen(dropdownOpen === dropdown ? null : dropdown);
  };

  const insertLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run();
    }

    setLinkModal(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setLinkModal(false);
    setLinkUrl('');
  }, [editor]);

  const setFontSize = (size: string) => {
    if (!editor) return;

    const sizeNum = parseInt(size.replace(/[^\d]/g, ''));
    const unit = size.includes('pt') ? 'pt' : 'px';

    editor.chain().focus().setFontSize(`${sizeNum}${unit}`).run();
    setDropdownOpen(null);
  };

  const setFontFamily = (font: string) => {
    if (!editor) return;
    editor.chain().focus().setFontFamily(font).run();
    setDropdownOpen(null);
  };

  // Toolbar Components
  const ToolbarButton = ({
    onClick,
    isActive,
    disabled: btnDisabled,
    children,
    title,
    className = '',
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
    className?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={btnDisabled}
      title={title}
      className={`toolbar-btn ${isActive ? 'active' : ''} ${className}`}
    >
      {children}
    </button>
  );

  const ToolbarDivider = () => <div className="toolbar-divider" />;

  const Dropdown = ({
    id,
    label,
    icon,
    items,
    className = '',
  }: {
    id: string;
    label: string | React.ReactNode;
    icon?: React.ReactNode;
    items: DropdownItem[];
    className?: string;
  }) => (
    <div
      className={`dropdown-wrapper ${className}`}
      ref={(el) => (dropdownRefs.current[id] = el)}
    >
      <button
        type="button"
        className={`dropdown-trigger ${dropdownOpen === id ? 'open' : ''}`}
        onClick={() => toggleDropdown(id)}
      >
        {icon && <span className="dropdown-icon">{icon}</span>}
        <span className="dropdown-label">{label}</span>
        <Icon element={FaChevronDown} style={{ fontSize: '12px' }} />
      </button>
      {dropdownOpen === id && (
        <div className="dropdown-menu">
          {items.map((item, index) => (
            <button
              key={index}
              type="button"
              className="dropdown-item"
              onClick={item.onClick}
            >
              {item.icon && (
                <span className="dropdown-item-icon">{item.icon}</span>
              )}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const ColorPicker = ({
    color,
    onChange,
    title,
    className = '',
  }: {
    color: string;
    onChange: (color: string) => void;
    title: string;
    className?: string;
  }) => (
    <div className={`color-picker-wrapper ${className}`}>
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        title={title}
        className="color-picker-input"
      />
      <div
        className="color-picker-preview"
        style={{ backgroundColor: color }}
      />
    </div>
  );

  if (!editor) return null;

  // Helper function to get current format label
  const getFormatLabel = () => {
    if (editor.isActive('heading', { level: 1 })) return 'Heading 1';
    if (editor.isActive('heading', { level: 2 })) return 'Heading 2';
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
    if (editor.isActive('heading', { level: 4 })) return 'Heading 4';
    if (editor.isActive('heading', { level: 5 })) return 'Heading 5';
    if (editor.isActive('heading', { level: 6 })) return 'Heading 6';
    if (editor.isActive('codeBlock')) return 'Preformatted';
    return 'Paragraph';
  };

  // Helper function to get current alignment label
  const getAlignmentLabel = () => {
    if (editor.isActive({ textAlign: 'left' })) return 'Left';
    if (editor.isActive({ textAlign: 'center' })) return 'Center';
    if (editor.isActive({ textAlign: 'right' })) return 'Right';
    if (editor.isActive({ textAlign: 'justify' })) return 'Justify';
    return 'Align';
  };

  // Dropdown items configurations
  const formatItems: DropdownItem[] = [
    {
      label: 'Paragraph',
      value: 'paragraph',
      onClick: () => editor.chain().focus().setParagraph().run(),
    },
    {
      label: 'Heading 1',
      value: 'h1',
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: 'Heading 2',
      value: 'h2',
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: 'Heading 3',
      value: 'h3',
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: 'Heading 4',
      value: 'h4',
      onClick: () => editor.chain().focus().toggleHeading({ level: 4 }).run(),
    },
    {
      label: 'Heading 5',
      value: 'h5',
      onClick: () => editor.chain().focus().toggleHeading({ level: 5 }).run(),
    },
    {
      label: 'Heading 6',
      value: 'h6',
      onClick: () => editor.chain().focus().toggleHeading({ level: 6 }).run(),
    },
    {
      label: 'Preformatted',
      value: 'pre',
      onClick: () => editor.chain().focus().setCodeBlock().run(),
    },
  ];

  const fontFamilyItems: DropdownItem[] = [
    { label: 'Arial', value: 'Arial', onClick: () => setFontFamily('Arial') },
    {
      label: 'Courier New',
      value: 'Courier New',
      onClick: () => setFontFamily('"Courier New"'),
    },
    {
      label: 'Georgia',
      value: 'Georgia',
      onClick: () => setFontFamily('Georgia'),
    },
    {
      label: 'Helvetica',
      value: 'Helvetica',
      onClick: () => setFontFamily('Helvetica'),
    },
    {
      label: 'Times New Roman',
      value: 'Times New Roman',
      onClick: () => setFontFamily('"Times New Roman"'),
    },
    {
      label: 'Trebuchet MS',
      value: 'Trebuchet MS',
      onClick: () => setFontFamily('"Trebuchet MS"'),
    },
    {
      label: 'Verdana',
      value: 'Verdana',
      onClick: () => setFontFamily('Verdana'),
    },
  ];

  const fontSizeItems: DropdownItem[] = [
    { label: '8pt', value: '8pt', onClick: () => setFontSize('8pt') },
    { label: '10pt', value: '10pt', onClick: () => setFontSize('10pt') },
    { label: '12pt', value: '12pt', onClick: () => setFontSize('12pt') },
    { label: '14pt', value: '14pt', onClick: () => setFontSize('14pt') },
    { label: '16pt', value: '16pt', onClick: () => setFontSize('16pt') },
    { label: '18pt', value: '18pt', onClick: () => setFontSize('18pt') },
    { label: '24pt', value: '24pt', onClick: () => setFontSize('24pt') },
    { label: '36pt', value: '36pt', onClick: () => setFontSize('36pt') },
    { label: '48pt', value: '48pt', onClick: () => setFontSize('48pt') },
  ];

  const listItems: DropdownItem[] = [
    {
      label: 'Bullet list',
      value: 'bullet',
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: 'Numbered list',
      value: 'numbered',
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: 'Check list',
      value: 'tasks',
      onClick: () => editor.chain().focus().toggleTaskList().run(),
    },
  ];

  const alignItems: DropdownItem[] = [
    {
      label: 'Align Left',
      value: 'left',
      onClick: () => editor.chain().focus().setTextAlign('left').run(),
    },
    {
      label: 'Align Center',
      value: 'center',
      onClick: () => editor.chain().focus().setTextAlign('center').run(),
    },
    {
      label: 'Align Right',
      value: 'right',
      onClick: () => editor.chain().focus().setTextAlign('right').run(),
    },
    {
      label: 'Justify',
      value: 'justify',
      onClick: () => editor.chain().focus().setTextAlign('justify').run(),
    },
  ];

  return (
    <div className={`rich-text-editor ${parentBoxClassName || ''}`}>
      {label && (
        <div className="editor-label">
          <InputLabel>{label}</InputLabel>
        </div>
      )}

      {/* Main Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-section">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Icon element={FaUndo} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Icon element={FaRedo} />
          </ToolbarButton>
          <ToolbarDivider />
        </div>

        <div className="toolbar-section">
          <Dropdown
            id="format"
            label={getFormatLabel()}
            icon={<Icon element={FaParagraph} />}
            items={formatItems}
          />
          <ToolbarDivider />
        </div>

        <div className="toolbar-section">
          <Dropdown
            id="fontFamily"
            label="Font"
            icon={<Icon element={FaFont} />}
            items={fontFamilyItems}
          />
          <Dropdown
            id="fontSize"
            label="14px"
            icon={<Icon element={FaTextHeight} />}
            items={fontSizeItems}
          />
          <ToolbarDivider />
        </div>

        <div className="toolbar-section">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Icon element={FaBold} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Icon element={FaItalic} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline"
          >
            <Icon element={FaUnderline} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Icon element={FaStrikethrough} />
          </ToolbarButton>
          <ToolbarDivider />
        </div>

        <div className="toolbar-section">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            isActive={editor.isActive('subscript')}
            title="Subscript"
          >
            <Icon element={FaSubscript} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            isActive={editor.isActive('superscript')}
            title="Superscript"
          >
            <Icon element={FaSuperscript} />
          </ToolbarButton>
          <ToolbarDivider />
        </div>

        <div className="toolbar-section">
          <ColorPicker
            color={textColor}
            onChange={(color) => {
              setTextColor(color);
              editor.chain().focus().setColor(color).run();
            }}
            title="Text Color"
          />
          <ColorPicker
            color={highlightColor}
            onChange={(color) => {
              setHighlightColor(color);
              editor.chain().focus().toggleHighlight({ color }).run();
            }}
            title="Highlight Color"
            className="highlight-picker"
          />
          <ToolbarDivider />
        </div>

        <div className="toolbar-section">
          <Dropdown
            id="lists"
            label="Lists"
            icon={<Icon element={MdFormatListBulleted} />}
            items={listItems}
          />
          <ToolbarDivider />
        </div>

        <div className="toolbar-section">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Quote"
          >
            <Icon element={FaQuoteRight} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Code Block"
          >
            <Icon element={FaCode} />
          </ToolbarButton>
          <ToolbarDivider />
        </div>

        <div className="toolbar-section">
          <ToolbarButton
            onClick={() => {
              const url = editor.getAttributes('link').href;
              setLinkUrl(url || '');
              setLinkModal(true);
            }}
            isActive={editor.isActive('link')}
            title="Insert Link"
          >
            <Icon element={FaLink} />
          </ToolbarButton>
          {editor.isActive('link') && (
            <ToolbarButton
              onClick={() => editor.chain().focus().unsetLink().run()}
              title="Remove Link"
            >
              <Icon element={FaUnlink} />
            </ToolbarButton>
          )}
          <ToolbarDivider />
        </div>

        <div className="toolbar-section">
          <Dropdown
            id="alignment"
            label={getAlignmentLabel()}
            icon={<Icon element={FaAlignLeft} />}
            items={alignItems}
          />
        </div>
      </div>

      {/* Editor Content */}
      <div className="editor-wrapper">
        <EditorContent editor={editor} />
      </div>

      {/* Link Modal */}
      {linkModal && (
        <div className="modal-overlay">
          <div className="link-modal">
            <h3>Insert Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="link-input"
            />
            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setLinkModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetLink().run();
                  setLinkModal(false);
                }}
                className="btn-danger"
              >
                Remove
              </button>
              <button
                type="button"
                onClick={insertLink}
                className="btn-primary"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bubble Menu for Links */}
      {editor && (
        <BubbleMenu editor={editor} className="bubble-menu">
          <button
            type="button"
            onClick={() => {
              const url = editor.getAttributes('link').href;
              setLinkUrl(url || '');
              setLinkModal(true);
            }}
            className="bubble-btn"
          >
            <Icon element={FaLink} /> Edit Link
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="bubble-btn bubble-btn-danger"
          >
            <Icon element={FaUnlink} /> Remove
          </button>
        </BubbleMenu>
      )}
    </div>
  );
}
