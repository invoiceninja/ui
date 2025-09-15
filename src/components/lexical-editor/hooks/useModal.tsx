/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { JSX } from 'react';

import { useCallback, useMemo, useState } from 'react';

import Modal from '../components/Modal';

export default function useModal(): [
  JSX.Element | null,
  (title: string, showModal: (onClose: () => void) => JSX.Element) => void
] {
  const [modalContent, setModalContent] = useState<null | {
    closeOnClickOutside: boolean;
    content: JSX.Element;
    title: string;
  }>(null);

  const onClose = useCallback(() => {
    setModalContent(null);
  }, []);

  const modal = useMemo(() => {
    if (modalContent === null) {
      return null;
    }
    const { title, content, closeOnClickOutside } = modalContent;
    return (
      <Modal
        onClose={onClose}
        title={title}
        closeOnClickOutside={closeOnClickOutside}
      >
        {content}
      </Modal>
    );
  }, [modalContent, onClose]);

  const showModal = useCallback(
    (
      title: string,

      getContent: (onClose: () => void) => JSX.Element,
      closeOnClickOutside = false
    ) => {
      setModalContent({
        closeOnClickOutside,
        content: getContent(onClose),
        title,
      });
    },
    [onClose]
  );

  return [modal, showModal];
}
