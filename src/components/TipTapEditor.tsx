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
  FaImage,
  FaFileCode,
  FaTable,
} from 'react-icons/fa';
import { MdFormatListBulleted, MdFormatListNumbered } from 'react-icons/md';
import { PiPencilSimpleFill } from 'react-icons/pi';

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
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Extension } from '@tiptap/core';

import { InputLabel, InputField, Button } from './forms';
import { Icon } from './icons/Icon';
import { Modal } from './Modal';
import { useColorScheme } from '$app/common/colors';
import { useTranslation } from 'react-i18next';
import { useClickAway, useDebounce } from 'react-use';

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

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

interface DropdownProps {
  label: string | React.ReactNode;
  icon?: React.ReactNode;
  items: DropdownItem[];
}

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onApply: () => void;
  title?: string;
  type?: 'text' | 'background';
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
  max-height: 400px;
  overflow-y: auto;

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
  display: inline-flex;
  align-items: center;
  gap: 0;
`;

const ColorPickerButton = styled.button<{ theme: ThemeProps }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid ${(props) => props.theme.borderColor};
  border-radius: 6px 0 0 6px;
  border-right: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: ${(props) => props.theme.hoverColor};
  }
`;

const ColorPickerDropdownButton = styled.button<{ theme: ThemeProps }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 32px;
  padding: 0;
  border: 1px solid ${(props) => props.theme.borderColor};
  border-radius: 0 6px 6px 0;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => props.theme.hoverColor};
  }
`;

const ColorIconWrapper = styled.div<{ color: string }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  .icon-letter {
    font-weight: bold;
    font-size: 16px;
    line-height: 1;
  }

  .icon-underline {
    width: 16px;
    height: 3px;
    background: ${(props) => props.color};
    border-radius: 1px;
    margin-top: 1px;
  }
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

    h4 {
      font-size: 1em;
      margin: 1em 0;
      font-weight: bold;
    }

    ul,
    ol {
      padding-left: 1.5em;
      margin: 1em 0;

      li {
        color: ${(props) => props.theme.textColor};

        &::marker {
          color: ${(props) => props.theme.textColor};
        }
      }
    }

    ul {
      list-style-type: disc;
    }

    ol {
      list-style-type: decimal;
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
      background: rgba(175, 184, 193, 0.2);
      padding: 0.2em 0.4em;
      margin: 0;
      font-size: 85%;
      border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas,
        'Liberation Mono', monospace;
      color: ${(props) => props.theme.textColor};
    }

    a {
      color: ${(props) => props.theme.linkColor};
      text-decoration: underline;
      cursor: pointer;
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
      margin: 1em 0;
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
        min-width: 50px;
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

const HiddenFileInput = styled.input`
  display: none;
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

const BackgroundColor = Extension.create({
  name: 'backgroundColor',
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
          backgroundColor: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.backgroundColor,
            renderHTML: (attributes: { backgroundColor?: string }) => {
              if (!attributes.backgroundColor) {
                return {};
              }
              return {
                style: `background-color: ${attributes.backgroundColor}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setBackgroundColor:
        (backgroundColor: string) =>
        ({ chain }: { chain: () => any }) => {
          return chain().setMark('textStyle', { backgroundColor }).run();
        },
      unsetBackgroundColor:
        () =>
        ({ chain }: { chain: () => any }) => {
          return chain()
            .setMark('textStyle', { backgroundColor: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});

function ToolbarButtonComponent({
  onClick,
  isActive,
  disabled,
  children,
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
        {label && <DropdownLabel>{label}</DropdownLabel>}
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

function ColorPickerComponent({
  color,
  onChange,
  onApply,
  title,
  type = 'text',
}: ColorPickerProps) {
  const colors = useColorScheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerWrapperRef = useRef<HTMLDivElement>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useClickAway(pickerWrapperRef, (event) => {
    if (
      buttonRef.current?.contains(event.target as Node) ||
      dropdownButtonRef.current?.contains(event.target as Node)
    ) {
      return;
    }
    setIsPickerOpen(false);
  });

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isPickerOpen) {
      setIsPickerOpen(true);
      setTimeout(() => {
        inputRef.current?.click();
      }, 10);
    } else {
      setIsPickerOpen(false);
    }
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onApply();
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

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
    <ColorPickerWrapper style={{ position: 'relative' }}>
      <ColorPickerButton
        ref={buttonRef}
        theme={theme}
        title={title}
        onClick={handleApplyClick}
        type="button"
      >
        {type === 'text' ? (
          <ColorIconWrapper color={color}>
            <span className="icon-letter">A</span>
            <div className="icon-underline" />
          </ColorIconWrapper>
        ) : (
          <ColorIconWrapper color={color}>
            <Icon
              element={PiPencilSimpleFill}
              size={16}
              style={{ color: colors.$3 }}
            />
            <div className="icon-underline" />
          </ColorIconWrapper>
        )}
      </ColorPickerButton>

      <ColorPickerDropdownButton
        ref={dropdownButtonRef}
        theme={theme}
        onClick={handleDropdownClick}
        type="button"
      >
        <Icon element={FaChevronDown} size={10} style={{ color: colors.$3 }} />
      </ColorPickerDropdownButton>

      {isPickerOpen && (
        <div
          ref={pickerWrapperRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 1000,
            padding: '1px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            ref={inputRef}
            type="color"
            value={color}
            onChange={handleColorChange}
            style={{
              width: '1px',
              height: '1px',
              border: 'none',
              padding: 0,
              opacity: 0,
              position: 'absolute',
            }}
          />
        </div>
      )}
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentValue, setCurrentValue] = useState<string | undefined>();
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [htmlModal, setHtmlModal] = useState<boolean>(false);
  const [linkModal, setLinkModal] = useState<boolean>(false);
  const [textColor, setTextColor] = useState<string>('#000000');
  const [backgroundColor, setBackgroundColor] = useState<string>('#FFFF00');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
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
        validate: (href) => /^https?:\/\//.test(href),
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
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
      BackgroundColor,
      FontFamily,
      FontSize,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: currentValue,
    editable: !disabled,
    onUpdate: ({ editor }) => setCurrentValue(editor.getHTML()),
  });

  useDebounce(
    () => {
      if (typeof currentValue === 'string') {
        onValueChange(currentValue);
      }
    },
    500,
    [currentValue]
  );

  useEffect(() => {
    if (typeof value === 'string' && typeof currentValue === 'undefined') {
      editor?.commands.setContent(value);
    }
  }, [value]);

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  const openLinkModal = useCallback(() => {
    if (!editor) return;
    const url = editor.getAttributes('link').href;
    setLinkUrl(url || '');
    setLinkModal(true);
  }, [editor]);

  const insertLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl) {
      let finalUrl = linkUrl.trim();

      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = `https://${finalUrl}`;
      }

      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: finalUrl })
        .run();
    }

    setLinkModal(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
    setLinkModal(false);
    setLinkUrl('');
  }, [editor]);

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!editor) return;

      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        if (src) {
          editor.chain().focus().setImage({ src }).run();
        }
      };
      reader.readAsDataURL(file);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [editor]
  );

  const openHtmlEditor = useCallback(() => {
    if (!editor) return;
    setHtmlCode(editor.getHTML());
    setHtmlModal(true);
  }, [editor]);

  const applyHtmlCode = useCallback(() => {
    if (!editor) return;
    editor.commands.setContent(htmlCode);
    onValueChange(htmlCode);
    setHtmlModal(false);
  }, [editor, htmlCode, onValueChange]);

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

  const getCurrentFontSize = useCallback((): string => {
    if (!editor) return '14px';

    const { $from } = editor.state.selection;
    const marks = $from.marks();
    const textStyleMark = marks.find((mark) => mark.type.name === 'textStyle');

    if (textStyleMark && textStyleMark.attrs.fontSize) {
      return textStyleMark.attrs.fontSize;
    }

    return '14px';
  }, [editor]);

  if (!editor) return null;

  function getFormatLabel(): string {
    if (editor.isActive('heading', { level: 1 })) return 'Heading 1';
    if (editor.isActive('heading', { level: 2 })) return 'Heading 2';
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
    if (editor.isActive('heading', { level: 4 })) return 'Heading 4';
    if (editor.isActive('codeBlock')) return 'Preformatted';
    return 'Paragraph';
  }

  const theme: ThemeProps = {
    backgroundColor: colors.$1,
    toolbarBackground: colors.$1,
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

  const tableItems: DropdownItem[] = [
    {
      label: 'Insert table',
      value: 'insert',
      onClick: () =>
        editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run(),
    },
    {
      label: 'Add column before',
      value: 'addColumnBefore',
      onClick: () => editor.chain().focus().addColumnBefore().run(),
    },
    {
      label: 'Add column after',
      value: 'addColumnAfter',
      onClick: () => editor.chain().focus().addColumnAfter().run(),
    },
    {
      label: 'Delete column',
      value: 'deleteColumn',
      onClick: () => editor.chain().focus().deleteColumn().run(),
    },
    {
      label: 'Add row before',
      value: 'addRowBefore',
      onClick: () => editor.chain().focus().addRowBefore().run(),
    },
    {
      label: 'Add row after',
      value: 'addRowAfter',
      onClick: () => editor.chain().focus().addRowAfter().run(),
    },
    {
      label: 'Delete row',
      value: 'deleteRow',
      onClick: () => editor.chain().focus().deleteRow().run(),
    },
    {
      label: 'Delete table',
      value: 'deleteTable',
      onClick: () => editor.chain().focus().deleteTable().run(),
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
            <Icon element={FaUndo} size={13.5} style={{ color: colors.$3 }} />
          </ToolbarButtonComponent>

          <ToolbarButtonComponent
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Icon element={FaRedo} size={13.5} style={{ color: colors.$3 }} />
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
                style={{ color: colors.$3 }}
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
              <Icon element={FaFont} size={14} style={{ color: colors.$3 }} />
            }
            items={fontFamilyItems}
          />

          <DropdownComponent
            label={getCurrentFontSize()}
            icon={
              <Icon
                element={FaTextHeight}
                size={14}
                style={{ color: colors.$3 }}
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
            <Icon element={FaBold} size={14} style={{ color: colors.$3 }} />
          </ToolbarButtonComponent>

          <ToolbarButtonComponent
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
          >
            <Icon element={FaItalic} size={14} style={{ color: colors.$3 }} />
          </ToolbarButtonComponent>

          <ToolbarButtonComponent
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
          >
            <Icon
              element={FaUnderline}
              size={14}
              style={{ color: colors.$3 }}
            />
          </ToolbarButtonComponent>

          <ToolbarButtonComponent
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
          >
            <Icon
              element={FaStrikethrough}
              size={14}
              style={{ color: colors.$3 }}
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
              style={{ color: colors.$3 }}
            />
          </ToolbarButtonComponent>

          <ToolbarButtonComponent
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            isActive={editor.isActive('superscript')}
          >
            <Icon
              element={FaSuperscript}
              size={14}
              style={{ color: colors.$3 }}
            />
          </ToolbarButtonComponent>
          <ToolbarDividerComponent />
        </ToolbarSection>

        <div className="flex items-center gap-2">
          <ColorPickerComponent
            color={textColor}
            onChange={(color) => setTextColor(color)}
            onApply={() => editor.chain().focus().setColor(textColor).run()}
            type="text"
          />

          <ColorPickerComponent
            color={backgroundColor}
            onChange={(color) => setBackgroundColor(color)}
            onApply={() =>
              editor.chain().focus().setBackgroundColor(backgroundColor).run()
            }
            type="background"
          />

          <ToolbarDividerComponent />
        </div>

        <ToolbarSection>
          <ToolbarButtonComponent
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
          >
            <Icon
              element={MdFormatListBulleted}
              size={18}
              style={{ color: colors.$3 }}
            />
          </ToolbarButtonComponent>

          <ToolbarButtonComponent
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
          >
            <Icon
              element={MdFormatListNumbered}
              size={18}
              style={{ color: colors.$3 }}
            />
          </ToolbarButtonComponent>

          <ToolbarDividerComponent />
        </ToolbarSection>

        <ToolbarSection>
          <ToolbarButtonComponent
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
          >
            <Icon
              element={FaAlignLeft}
              size={14}
              style={{ color: colors.$3 }}
            />
          </ToolbarButtonComponent>

          <ToolbarButtonComponent
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
          >
            <Icon
              element={FaAlignCenter}
              size={14}
              style={{ color: colors.$3 }}
            />
          </ToolbarButtonComponent>

          <ToolbarButtonComponent
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
          >
            <Icon
              element={FaAlignRight}
              size={14}
              style={{ color: colors.$3 }}
            />
          </ToolbarButtonComponent>

          <ToolbarButtonComponent
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
          >
            <Icon
              element={FaAlignJustify}
              size={14}
              style={{ color: colors.$3 }}
            />
          </ToolbarButtonComponent>

          <ToolbarDividerComponent />
        </ToolbarSection>

        <ToolbarSection>
          <ToolbarButtonComponent
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
          >
            <Icon
              element={FaQuoteRight}
              size={13.5}
              style={{ color: colors.$3 }}
            />
          </ToolbarButtonComponent>

          <ToolbarButtonComponent
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
          >
            <Icon element={FaCode} size={14} style={{ color: colors.$3 }} />
          </ToolbarButtonComponent>

          <ToolbarDividerComponent />
        </ToolbarSection>

        <ToolbarSection>
          <ToolbarButtonComponent
            onClick={openLinkModal}
            isActive={editor.isActive('link')}
          >
            <Icon element={FaLink} size={14} style={{ color: colors.$3 }} />
          </ToolbarButtonComponent>

          {editor.isActive('link') && (
            <ToolbarButtonComponent onClick={removeLink}>
              <Icon element={FaUnlink} size={14} style={{ color: colors.$3 }} />
            </ToolbarButtonComponent>
          )}
          <ToolbarDividerComponent />
        </ToolbarSection>

        <ToolbarSection>
          <HiddenFileInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <ToolbarButtonComponent onClick={() => fileInputRef.current?.click()}>
            <Icon element={FaImage} size={16} style={{ color: colors.$3 }} />
          </ToolbarButtonComponent>
          <ToolbarDividerComponent />
        </ToolbarSection>

        <ToolbarSection>
          <DropdownComponent
            label=""
            icon={
              <Icon element={FaTable} size={14} style={{ color: colors.$3 }} />
            }
            items={tableItems}
          />
          <ToolbarDividerComponent />
        </ToolbarSection>

        <ToolbarSection>
          <ToolbarButtonComponent onClick={openHtmlEditor}>
            <Icon
              element={FaFileCode}
              size={15.5}
              style={{ color: colors.$3 }}
            />
          </ToolbarButtonComponent>
        </ToolbarSection>
      </EditorToolbar>

      <EditorWrapper theme={theme}>
        <EditorContent editor={editor} />
      </EditorWrapper>

      <Modal
        title={t('insert_link')}
        visible={linkModal}
        onClose={() => setLinkModal(false)}
      >
        <InputField
          label={t('url')}
          value={linkUrl}
          onValueChange={(value) => setLinkUrl(value)}
          placeholder="https://example.com"
        />

        <div className="flex gap-2 justify-end mt-4">
          <Button type="minimal" onClick={() => setLinkModal(false)}>
            {t('cancel')}
          </Button>

          {editor.isActive('link') && (
            <Button
              type="minimal"
              onClick={removeLink}
              style={{ color: '#ef4444' }}
            >
              {t('remove')}
            </Button>
          )}

          <Button onClick={insertLink}>{t('apply')}</Button>
        </div>
      </Modal>

      <Modal
        title={t('source_code')}
        visible={htmlModal}
        onClose={() => setHtmlModal(false)}
        size="regular"
      >
        <InputField
          element="textarea"
          value={htmlCode}
          onValueChange={(value) => setHtmlCode(value)}
          style={{ minHeight: '25rem' }}
        />

        <div className="flex gap-2 justify-end mt-4">
          <Button type="minimal" onClick={() => setHtmlModal(false)}>
            {t('cancel')}
          </Button>

          <Button onClick={applyHtmlCode}>{t('apply')}</Button>
        </div>
      </Modal>
    </EditorContainer>
  );
}
