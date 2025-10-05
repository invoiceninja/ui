import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes } from 'lexical';
import { useState } from 'react';
import { Modal } from '$app/components/Modal';
import { Button, InputField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { Icon } from '$app/components/icons/Icon';
import { BiCodeAlt } from 'react-icons/bi';
import classNames from 'classnames';

interface Props {
  disabled: boolean;
}

export default function HtmlCode({ disabled }: Props) {
  const [t] = useTranslation();

  const [editor] = useLexicalComposerContext();

  const [sourceCode, setSourceCode] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const openSourceCode = () => {
    editor.getEditorState().read(() => {
      const htmlString = $generateHtmlFromNodes(editor, null);
      setSourceCode(htmlString);
      setIsModalOpen(true);
    });
  };

  const handleSave = () => {
    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(sourceCode, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);

      // Clear existing content
      const root = $getRoot();
      root.clear();

      // Insert new nodes
      root.select();
      $insertNodes(nodes);
    });

    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className={classNames('toolbar-item', {
          'cursor-not-allowed': disabled,
        })}
        onClick={() => {
          if (disabled) return;
          openSourceCode();
        }}
      >
        <Icon element={BiCodeAlt} style={{ color: 'gray' }} />
      </button>

      <Modal
        title={t('source_code')}
        visible={isModalOpen}
        onClose={handleCancel}
        size="regular"
      >
        <div className="flex flex-col space-y-4">
          <InputField
            element="textarea"
            value={sourceCode}
            onValueChange={(value) => setSourceCode(value)}
            style={{
              width: '100%',
              minHeight: '400px',
              fontFamily: 'monospace',
            }}
          />

          <div className="flex w-full justify-end">
            <Button behavior="button" type="primary" onClick={handleSave}>
              {t('save')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
