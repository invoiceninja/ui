/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useRef, useState } from 'react';

interface Props {
  srcDoc: string;
}
export function NotesIframe(props: Props) {
  const { srcDoc } = props;

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [currentSrcDoc, setCurrentSrcDoc] = useState<string>('');

  const adjustIframeHeight = () => {
    if (iframeRef?.current) {
      const iframeDocument =
        iframeRef.current.contentDocument ||
        iframeRef.current.contentWindow?.document;

      if (iframeDocument) {
        const scrollHeight = iframeDocument.body?.scrollHeight + 'px';
        const scrollWidth = iframeDocument.body?.clientWidth + 'px';

        if (iframeDocument.body) {
          iframeDocument.body.style.margin = '0';
          iframeDocument.body.style.display = 'flex';
          iframeDocument.body.style.alignItems = 'center';

          const updatedHeight =
            iframeDocument.body.scrollHeight < 150 ? scrollHeight : '150px';

          iframeRef.current.height = updatedHeight;
          iframeRef.current.width = scrollWidth;
          iframeDocument.documentElement.style.height = updatedHeight;
          iframeDocument.documentElement.style.width = scrollWidth;
        }
      }
    }
  };

  useEffect(() => {
    if (iframeRef?.current) {
      iframeRef.current.addEventListener('load', adjustIframeHeight);
    }
  }, [iframeRef?.current]);

  useEffect(() => {
    setCurrentSrcDoc(srcDoc);
  }, [srcDoc]);

  return (
    <>
      {currentSrcDoc ? (
        <iframe ref={iframeRef} srcDoc={currentSrcDoc} width="100%" />
      ) : null}
    </>
  );
}
