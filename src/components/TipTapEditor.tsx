import { useCallback, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
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
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
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
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Extension } from '@tiptap/core';

import { InputLabel } from './forms';
import { Icon } from './icons/Icon';
import { useColorScheme } from '$app/common/colors';
import { useTranslation } from 'react-i18next';

interface ThemeProps {
  backgroundColor: string;
  toolbarBackground: string;
  textColor: string;
  borderColor: string;
  iconColor: string;
  placeholderColor: string;
  buttonBackgroundColor: string;
  lightBorderColor: string;
  dropdownHoverColor: string;
  dividerColor: string;
  labelColor: string;
  contentBackground: string;
  hoverColor: string;
  linkColor: string;
  isActive?: boolean;
  isOpen?: boolean;
  isDanger?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  minHeight?: string;
}

interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

interface TipTapEditorProps {
  value?: string;
  onValueChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  parentBoxClassName?: string;
  required?: boolean;
  placeholder?: string;
  minHeight?: string;
}

interface BubbleMenuProps {
  editor: Editor;
  children: React.ReactNode;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}

interface DropdownProps {
  label: string | React.ReactNode;
  icon?: React.ReactNode;
  items: DropdownItem[];
}

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  title?: string;
}

const ToolbarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const EditorContainer = styled.div<{ theme: ThemeProps }>`
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.borderColor};
  background: ${(props) => props.theme.backgroundColor};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const EditorLabel = styled.div<{ theme: ThemeProps }>`
  padding: 12px 16px;
  border-bottom: 1px solid ${(props) => props.theme.borderColor};
`;

const EditorToolbar = styled.div<{ theme: ThemeProps }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid ${(props) => props.theme.borderColor};
  background: ${(props) => props.theme.toolbarBackground};
  min-height: 52px;

  @media (max-width: 768px) {
    overflow-x: auto;
    flex-wrap: nowrap;
  }
`;

const ToolbarButton = styled.button<{ theme: ThemeProps }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: ${({ theme }) =>
    theme.isActive ? theme.hoverColor : 'transparent'};
  color: ${({ theme }) => (theme.isActive ? theme.textColor : theme.iconColor)};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;

  &:hover:not(:disabled) {
    background: ${(props) => props.theme.hoverColor};
    color: ${(props) => props.theme.textColor};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ToolbarDivider = styled.div<{ theme: ThemeProps }>`
  width: 1px;
  height: 20px;
  background: ${(props) => props.theme.dividerColor};
  margin: 0 2px;
`;

const DropdownWrapper = styled.div`
  position: relative;
`;

const DropdownTrigger = styled.button<{ theme: ThemeProps }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid
    ${({ theme }) =>
      theme.isOpen ? theme.buttonBackgroundColor : theme.borderColor};
  border-radius: 6px;
  background: ${({ theme }) =>
    theme.isOpen ? theme.hoverColor : 'transparent'};
  color: ${(props) => props.theme.textColor};
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  min-height: 32px;

  &:hover {
    border-color: ${(props) => props.theme.borderColor};
    background: ${(props) => props.theme.hoverColor};
  }
`;

const DropdownIcon = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 14px;
`;

const DropdownLabel = styled.span`
  font-size: 13px;
  font-weight: 500;
`;

const DropdownMenu = styled.div<{ theme: ThemeProps }>`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 160px;
  background: ${(props) => props.theme.backgroundColor};
  border: 1px solid ${(props) => props.theme.borderColor};
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  padding: 4px 0;
  animation: dropdownFade 0.2s ease;

  @keyframes dropdownFade {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const DropdownItem = styled.button<{ theme: ThemeProps }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: ${(props) => props.theme.textColor};
  cursor: pointer;
  font-size: 14px;
  text-align: left;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => props.theme.dropdownHoverColor};
  }
`;

const DropdownItemIcon = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  width: 16px;
`;

const ColorPickerWrapper = styled.div`
  position: relative;
  width: 32px;
  height: 32px;
`;

const ColorPickerInput = styled.input`
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
`;

const ColorPickerPreview = styled.div<{ theme: ThemeProps; color: string }>`
  width: 100%;
  height: 100%;
  border-radius: 6px;
  border: 1px solid ${(props) => props.theme.borderColor};
  background: ${(props) => props.color};
`;

const EditorWrapper = styled.div<{ theme: ThemeProps }>`
  position: relative;

  .ProseMirror {
    padding: 16px;
    outline: none;
    color: ${(props) => props.theme.textColor};
    line-height: 1.6;
    min-height: ${({ theme }) => theme.minHeight};

    &:focus {
      outline: none;
    }

    p {
      margin: 0 0 1em;
    }

    h1 {
      font-size: 2em;
      margin: 0.67em 0;
      font-weight: bold;
    }

    h2 {
      font-size: 1.5em;
      margin: 0.75em 0;
      font-weight: bold;
    }

    h3 {
      font-size: 1.17em;
      margin: 0.83em 0;
      font-weight: bold;
    }

    h4,
    h5,
    h6 {
      margin: 1em 0;
      font-weight: bold;
    }

    ul,
    ol {
      padding-left: 1.5em;
      margin: 1em 0;
    }

    blockquote {
      border-left: 3px solid ${(props) => props.theme.hoverColor};
      margin: 1em 0;
      padding-left: 1em;
      color: ${(props) => props.theme.placeholderColor};
    }

    pre {
      background: ${(props) => props.theme.toolbarBackground};
      border-radius: 6px;
      padding: 1em;
      margin: 1em 0;
      overflow-x: auto;
    }

    code {
      background: ${(props) => props.theme.toolbarBackground};
      padding: 2px 4px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }

    a {
      color: ${(props) => props.theme.linkColor};
      text-decoration: underline;
      cursor: pointer;
    }

    table {
      border-collapse: collapse;
      margin: 1em 0;
      width: 100%;

      td,
      th {
        border: 1px solid ${(props) => props.theme.dividerColor};
        padding: 8px 12px;
        text-align: left;
      }

      th {
        background: ${(props) => props.theme.toolbarBackground};
        font-weight: 600;
      }
    }

    ul[data-type='taskList'] {
      list-style: none;
      padding: 0;

      li {
        display: flex;
        align-items: flex-start;
        margin: 0.5em 0;

        > label {
          flex: 0 0 auto;
          margin-right: 0.5rem;
          user-select: none;
        }

        > div {
          flex: 1 1 auto;
        }
      }
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const LinkModal = styled.div<{ theme: ThemeProps }>`
  background: ${(props) => props.theme.backgroundColor};
  border-radius: 8px;
  padding: 20px;
  min-width: 400px;
  border: 1px solid ${(props) => props.theme.borderColor};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);

  h3 {
    margin: 0 0 16px;
    color: ${(props) => props.theme.textColor};
    font-size: 18px;
  }

  @media (max-width: 768px) {
    min-width: 90%;
    margin: 20px;
  }
`;

const LinkInput = styled.input<{ theme: ThemeProps }>`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${(props) => props.theme.borderColor};
  border-radius: 6px;
  background: ${(props) => props.theme.backgroundColor};
  color: ${(props) => props.theme.textColor};
  font-size: 14px;
  margin-bottom: 20px;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.buttonBackgroundColor};
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const Button = styled.button<{ theme: ThemeProps }>`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;

  ${({ theme }) => {
    if (theme.variant === 'primary') {
      return `
        background: ${theme.buttonBackgroundColor};
        color: ${theme.backgroundColor};
        
        &:hover {
          opacity: 0.9;
        }
      `;
    } else if (theme.variant === 'secondary') {
      return `
        background: transparent;
        color: ${theme.textColor};
        border: 1px solid ${theme.borderColor};
        
        &:hover {
          background: ${theme.hoverColor};
        }
      `;
    } else if (theme.variant === 'danger') {
      return `
        background: #ef4444;
        color: white;
        
        &:hover {
          opacity: 0.9;
        }
      `;
    }
  }}
`;

const BubbleMenuContainer = styled.div<{ theme: ThemeProps }>`
  display: flex;
  gap: 4px;
  padding: 6px;
  background: ${(props) => props.theme.backgroundColor};
  border: 1px solid ${(props) => props.theme.borderColor};
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: dropdownFade 0.2s ease;
`;

const BubbleButton = styled.button<{ theme: ThemeProps }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: ${({ theme }) => (theme.isDanger ? '#ef4444' : theme.textColor)};
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) =>
      theme.isDanger ? 'rgba(239, 68, 68, 0.1)' : theme.hoverColor};
  }
`;

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
            parseHTML: (element: HTMLElement) => element.style.fontSize,
            renderHTML: (attributes: { fontSize?: string }) => {
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
        ({ chain }: { chain: () => any }) => {
          return chain().setMark('textStyle', { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }: { chain: () => any }) => {
          return chain()
            .setMark('textStyle', { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});

function BubbleMenu({ editor, children }: BubbleMenuProps) {
  const colors = useColorScheme();
  const [visible, setVisible] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

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

  const theme: ThemeProps = {
    backgroundColor: colors.$1,
    toolbarBackground: colors.$2,
    textColor: colors.$3,
    borderColor: colors.$24,
    iconColor: colors.$16,
    placeholderColor: colors.$17,
    buttonBackgroundColor: colors.$18,
    lightBorderColor: colors.$19,
    dropdownHoverColor: colors.$20,
    dividerColor: colors.$21,
    labelColor: colors.$22,
    contentBackground: colors.$23,
    hoverColor: colors.$25,
    linkColor: colors.$18,
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%)',
      }}
    >
      <BubbleMenuContainer theme={theme}>{children}</BubbleMenuContainer>
    </div>
  );
}

function ToolbarButtonComponent({
  onClick,
  isActive,
  disabled,
  children,
  title,
}: ToolbarButtonProps) {
  const colors = useColorScheme();

  const theme: ThemeProps = {
    backgroundColor: colors.$1,
    toolbarBackground: colors.$2,
    textColor: colors.$3,
    borderColor: colors.$24,
    iconColor: colors.$16,
    placeholderColor: colors.$17,
    buttonBackgroundColor: colors.$18,
    lightBorderColor: colors.$19,
    dropdownHoverColor: colors.$20,
    dividerColor: colors.$21,
    labelColor: colors.$22,
    contentBackground: colors.$23,
    hoverColor: colors.$25,
    linkColor: colors.$18,
    isActive,
  };

  return (
    <ToolbarButton
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      theme={theme}
    >
      {children}
    </ToolbarButton>
  );
}

function ToolbarDividerComponent() {
  const colors = useColorScheme();

  const theme: ThemeProps = {
    backgroundColor: colors.$1,
    toolbarBackground: colors.$2,
    textColor: colors.$3,
    borderColor: colors.$24,
    iconColor: colors.$16,
    placeholderColor: colors.$17,
    buttonBackgroundColor: colors.$18,
    lightBorderColor: colors.$19,
    dropdownHoverColor: colors.$20,
    dividerColor: colors.$21,
    labelColor: colors.$22,
    contentBackground: colors.$23,
    hoverColor: colors.$25,
    linkColor: colors.$18,
  };

  return <ToolbarDivider theme={theme} />;
}

function DropdownComponent({ label, icon, items }: DropdownProps) {
  const colors = useColorScheme();
  const ref = useRef<HTMLDivElement | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const theme: ThemeProps = {
    backgroundColor: colors.$1,
    toolbarBackground: colors.$2,
    textColor: colors.$3,
    borderColor: colors.$24,
    iconColor: colors.$16,
    placeholderColor: colors.$17,
    buttonBackgroundColor: colors.$18,
    lightBorderColor: colors.$19,
    dropdownHoverColor: colors.$20,
    dividerColor: colors.$21,
    labelColor: colors.$22,
    contentBackground: colors.$23,
    hoverColor: colors.$25,
    linkColor: colors.$18,
    isOpen: dropdownOpen,
  };

  return (
    <DropdownWrapper ref={ref}>
      <DropdownTrigger
        type="button"
        theme={theme}
        onClick={() => setDropdownOpen((prev) => !prev)}
      >
        {icon && <DropdownIcon>{icon}</DropdownIcon>}
        <DropdownLabel>{label}</DropdownLabel>
        <Icon
          element={FaChevronDown}
          style={{ fontSize: '12px', color: colors.$16 }}
        />
      </DropdownTrigger>

      {dropdownOpen && (
        <DropdownMenu theme={theme}>
          {items.map((item, index) => (
            <DropdownItem
              key={index}
              theme={theme}
              onClick={(e) => {
                e.stopPropagation();
                item.onClick?.();
                setDropdownOpen(false);
              }}
            >
              {item.icon && <DropdownItemIcon>{item.icon}</DropdownItemIcon>}
              <span>{item.label}</span>
            </DropdownItem>
          ))}
        </DropdownMenu>
      )}
    </DropdownWrapper>
  );
}

function ColorPickerComponent({ color, onChange, title }: ColorPickerProps) {
  const colors = useColorScheme();

  const theme: ThemeProps = {
    backgroundColor: colors.$1,
    toolbarBackground: colors.$2,
    textColor: colors.$3,
    borderColor: colors.$24,
    iconColor: colors.$16,
    placeholderColor: colors.$17,
    buttonBackgroundColor: colors.$18,
    lightBorderColor: colors.$19,
    dropdownHoverColor: colors.$20,
    dividerColor: colors.$21,
    labelColor: colors.$22,
    contentBackground: colors.$23,
    hoverColor: colors.$25,
    linkColor: colors.$18,
  };

  return (
    <ColorPickerWrapper>
      <ColorPickerInput
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        title={title}
      />
      <ColorPickerPreview color={color} theme={theme} />
    </ColorPickerWrapper>
  );
}

export function TipTapEditor({
  value,
  onValueChange,
  label,
  disabled,
  parentBoxClassName,
  placeholder = 'Start typing...',
  minHeight = '12.5rem',
}: TipTapEditorProps) {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const [linkUrl, setLinkUrl] = useState<string>('');
  const [linkModal, setLinkModal] = useState<boolean>(false);
  const [textColor, setTextColor] = useState<string>('#000000');
  const [highlightColor, setHighlightColor] = useState<string>('#FFFF00');

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
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

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

  const setFontSize = useCallback(
    (size: string) => {
      if (!editor) return;

      const sizeNum = parseInt(size.replace(/[^\d]/g, ''));
      const unit = size.includes('pt') ? 'pt' : 'px';

      editor.chain().focus().setFontSize(`${sizeNum}${unit}`).run();
    },
    [editor]
  );

  const setFontFamily = useCallback(
    (font: string) => {
      if (!editor) return;
      editor.chain().focus().setFontFamily(font).run();
    },
    [editor]
  );

  if (!editor) return null;

  function getFormatLabel(): string {
    if (editor.isActive('heading', { level: 1 })) return 'Heading 1';
    if (editor.isActive('heading', { level: 2 })) return 'Heading 2';
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
    if (editor.isActive('heading', { level: 4 })) return 'Heading 4';
    if (editor.isActive('heading', { level: 5 })) return 'Heading 5';
    if (editor.isActive('heading', { level: 6 })) return 'Heading 6';
    if (editor.isActive('codeBlock')) return 'Preformatted';
    return 'Paragraph';
  }

  function getAlignmentLabel(): string {
    if (editor.isActive({ textAlign: 'left' })) return t('left');
    if (editor.isActive({ textAlign: 'center' })) return t('center');
    if (editor.isActive({ textAlign: 'right' })) return t('right');
    if (editor.isActive({ textAlign: 'justify' })) return t('justify');
    return t('align');
  }

  const theme: ThemeProps = {
    backgroundColor: colors.$1,
    toolbarBackground: colors.$2,
    textColor: colors.$3,
    borderColor: colors.$24,
    iconColor: colors.$16,
    placeholderColor: colors.$17,
    buttonBackgroundColor: colors.$18,
    lightBorderColor: colors.$19,
    dropdownHoverColor: colors.$20,
    dividerColor: colors.$21,
    labelColor: colors.$22,
    contentBackground: colors.$23,
    hoverColor: colors.$25,
    linkColor: colors.$18,
    minHeight,
  };

  const formatItems: DropdownItem[] = [
    {
      label: t('paragraph'),
      value: 'paragraph',
      onClick: () => editor.chain().focus().setParagraph().run(),
    },
    {
      label: t('heading1'),
      value: 'h1',
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: t('heading2'),
      value: 'h2',
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: t('heading3'),
      value: 'h3',
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: t('heading4'),
      value: 'h4',
      onClick: () => editor.chain().focus().toggleHeading({ level: 4 }).run(),
    },
    {
      label: t('heading5'),
      value: 'h5',
      onClick: () => editor.chain().focus().toggleHeading({ level: 5 }).run(),
    },
    {
      label: t('heading6'),
      value: 'h6',
      onClick: () => editor.chain().focus().toggleHeading({ level: 6 }).run(),
    },
    {
      label: t('preformatted'),
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
      label: t('bullet_list'),
      value: 'bullet',
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: t('numbered_list'),
      value: 'numbered',
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: t('check_list'),
      value: 'tasks',
      onClick: () => editor.chain().focus().toggleTaskList().run(),
    },
  ];

  const alignItems: DropdownItem[] = [
    {
      label: t('align_left'),
      value: 'left',
      icon: (
        <Icon element={FaAlignLeft} size={14} style={{ color: colors.$16 }} />
      ),
      onClick: () => editor.chain().focus().setTextAlign('left').run(),
    },
    {
      label: t('align_center'),
      value: 'center',
      icon: (
        <Icon element={FaAlignCenter} size={14} style={{ color: colors.$16 }} />
      ),
      onClick: () => editor.chain().focus().setTextAlign('center').run(),
    },
    {
      label: t('align_right'),
      value: 'right',
      icon: (
        <Icon element={FaAlignRight} size={14} style={{ color: colors.$16 }} />
      ),
      onClick: () => editor.chain().focus().setTextAlign('right').run(),
    },
    {
      label: t('justify'),
      value: 'justify',
      icon: (
        <Icon
          element={FaAlignJustify}
          size={14}
          style={{ color: colors.$16 }}
        />
      ),
      onClick: () => editor.chain().focus().setTextAlign('justify').run(),
    },
  ];

  return (
    <EditorContainer theme={theme} className={parentBoxClassName}>
      {label && (
        <EditorLabel theme={theme}>
          <InputLabel>{label}</InputLabel>
        </EditorLabel>
      )}

      <EditorToolbar className="rounded-t-lg" theme={theme}>
        <div className="flex items-center gap-2">
          <ToolbarButtonComponent
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Icon element={FaUndo} size={14} style={{ color: colors.$16 }} />
          </ToolbarButtonComponent>

          <ToolbarButtonComponent
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Icon element={FaRedo} size={14} style={{ color: colors.$16 }} />
          </ToolbarButtonComponent>

          <ToolbarDividerComponent />
        </div>

        <ToolbarSection>
          <DropdownComponent
            label={getFormatLabel()}
            icon={
              <Icon
                element={FaParagraph}
                size={14}
                style={{ color: colors.$16 }}
              />
            }
            items={formatItems}
          />

          <ToolbarDividerComponent />
        </ToolbarSection>

        <ToolbarSection>
          <DropdownComponent
            label="Font"
            icon={
              <Icon element={FaFont} size={14} style={{ color: colors.$16 }} />
            }
            items={fontFamilyItems}
          />

          <DropdownComponent
            label="14px"
            icon={
              <Icon
                element={FaTextHeight}
                size={14}
                style={{ color: colors.$16 }}
              />
            }
            items={fontSizeItems}
          />

          <ToolbarDividerComponent />
        </ToolbarSection>

        <ToolbarSection>
          <ToolbarButtonComponent
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
          >
            <Icon element={FaBold} size={14} style={{ color: colors.$16 }} />
          </ToolbarButtonComponent>

          <ToolbarButtonComponent
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
          >
            <Icon element={FaItalic} size={14} style={{ color: colors.$16 }} />
          </ToolbarButtonComponent>

          <ToolbarButtonComponent
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
          >
            <Icon
              element={FaUnderline}
              size={14}
              style={{ color: colors.$16 }}
            />
          </ToolbarButtonComponent>

          <ToolbarButtonComponent
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
          >
            <Icon
              element={FaStrikethrough}
              size={14}
              style={{ color: colors.$16 }}
            />
          </ToolbarButtonComponent>
          <ToolbarDividerComponent />
        </ToolbarSection>

        <ToolbarSection>
          <ToolbarButtonComponent
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            isActive={editor.isActive('subscript')}
          >
            <Icon
              element={FaSubscript}
              size={14}
              style={{ color: colors.$16 }}
            />
          </ToolbarButtonComponent>

          <ToolbarButtonComponent
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            isActive={editor.isActive('superscript')}
          >
            <Icon
              element={FaSuperscript}
              size={14}
              style={{ color: colors.$16 }}
            />
          </ToolbarButtonComponent>
          <ToolbarDividerComponent />
        </ToolbarSection>

        <div className="flex items-center gap-2">
          <ColorPickerComponent
            color={textColor}
            onChange={(color) => {
              setTextColor(color);
              editor.chain().focus().setColor(color).run();
            }}
          />

          <ColorPickerComponent
            color={highlightColor}
            onChange={(color) => {
              setHighlightColor(color);
              editor.chain().focus().toggleHighlight({ color }).run();
            }}
          />

          <ToolbarDividerComponent />
        </div>

        <ToolbarSection className="flex items-center gap-2">
          <DropdownComponent
            label={t('lists')}
            icon={
              <Icon
                element={MdFormatListBulleted}
                size={14}
                style={{ color: colors.$16 }}
              />
            }
            items={listItems}
          />
          <ToolbarDividerComponent />
        </ToolbarSection>

        <ToolbarSection>
          <ToolbarButtonComponent
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
          >
            <Icon
              element={FaQuoteRight}
              size={14}
              style={{ color: colors.$16 }}
            />
          </ToolbarButtonComponent>

          <ToolbarButtonComponent
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
          >
            <Icon element={FaCode} size={14} style={{ color: colors.$16 }} />
          </ToolbarButtonComponent>
          <ToolbarDividerComponent />
        </ToolbarSection>

        <ToolbarSection>
          <ToolbarButtonComponent
            onClick={() => {
              const url = editor.getAttributes('link').href;
              setLinkUrl(url || '');
              setLinkModal(true);
            }}
            isActive={editor.isActive('link')}
          >
            <Icon element={FaLink} size={14} style={{ color: colors.$16 }} />
          </ToolbarButtonComponent>
          {editor.isActive('link') && (
            <ToolbarButtonComponent
              onClick={() => editor.chain().focus().unsetLink().run()}
            >
              <Icon
                element={FaUnlink}
                size={14}
                style={{ color: colors.$16 }}
              />
            </ToolbarButtonComponent>
          )}
          <ToolbarDividerComponent />
        </ToolbarSection>

        <ToolbarSection>
          <DropdownComponent
            label={getAlignmentLabel()}
            icon={
              <Icon
                element={FaAlignLeft}
                size={14}
                style={{ color: colors.$16 }}
              />
            }
            items={alignItems}
          />
        </ToolbarSection>
      </EditorToolbar>

      <EditorWrapper theme={theme}>
        <EditorContent editor={editor} />
      </EditorWrapper>

      {linkModal && (
        <ModalOverlay>
          <LinkModal theme={theme}>
            <h3>{t('insert_link')}</h3>

            <LinkInput
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              theme={theme}
            />
            <ModalActions>
              <Button
                type="button"
                onClick={() => setLinkModal(false)}
                theme={{ ...theme, variant: 'secondary' }}
              >
                {t('cancel')}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetLink().run();
                  setLinkModal(false);
                }}
                theme={{ ...theme, variant: 'danger' }}
              >
                {t('remove')}
              </Button>
              <Button
                type="button"
                onClick={insertLink}
                theme={{ ...theme, variant: 'primary' }}
              >
                {t('apply')}
              </Button>
            </ModalActions>
          </LinkModal>
        </ModalOverlay>
      )}

      <BubbleMenu editor={editor}>
        <BubbleButton
          type="button"
          onClick={() => {
            const url = editor.getAttributes('link').href;
            setLinkUrl(url || '');
            setLinkModal(true);
          }}
          theme={theme}
        >
          <Icon element={FaLink} size={14} style={{ color: colors.$16 }} />{' '}
          {t('edit_link')}
        </BubbleButton>

        <BubbleButton
          type="button"
          onClick={() => editor.chain().focus().unsetLink().run()}
          theme={{ ...theme, isDanger: true }}
        >
          <Icon element={FaUnlink} size={14} style={{ color: '#ef4444' }} />{' '}
          {t('remove_link')}
        </BubbleButton>
      </BubbleMenu>
    </EditorContainer>
  );
}
