/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { ExternalLink, Layers, X } from 'react-feather';
import Markdown from 'react-markdown';
import { useQuery } from 'react-query';
import rehypeRaw from 'rehype-raw';
import { Link } from './forms';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  id: string;
  url: string;
}

function processMarkdownContent(content: string) {
  return content
    .replace(/^<x-next.*$/gm, '')

    .replace(/---[\s\S]*?---/g, '')
    .replace(/!\[.*?\]\((\/[^)]+)\)/g, (match, p1) => {
      const alt = match.match(/!\[(.*?)\]/);
      const altText = alt ? alt[1] : 'An image';

      return `![${altText}](https://raw.githubusercontent.com/invoiceninja/invoiceninja.github.io/refs/heads/v5-rework/source${p1})`;
    })
    .trim();
}

export function HelpWidget({ id, url }: Props) {
  const { t } = useTranslation();

  const { data } = useQuery({
    queryKey: ['help-widget', id, url],
    queryFn: () =>
      fetch(url).then((response) =>
        response.text().then(processMarkdownContent)
      ),
  });

  const [, slug] = url.split('v5-rework/source');

  const colors = useColorScheme();
  const contentRef = useRef<HTMLDivElement>(null);
  const helpWidgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    window.addEventListener(
      `help-widget-${id}:moveToHeading`,
      (event) => {
        if ('detail' in event && contentRef.current && helpWidgetRef.current) {
          const heading = contentRef.current?.querySelectorAll('h3');

          if (heading) {
            const headingIndex = Array.from(heading).findIndex(
              (h) => h.innerText === event.detail
            );

            if (headingIndex > -1) {
              const headingElement = heading[headingIndex];

              if (headingElement) {
                helpWidgetRef.current.scrollTo({
                  behavior: 'smooth',
                  top: headingElement.offsetTop - 50,
                });
              }
            }
          }
        }
      },
      { signal: controller.signal }
    );

    return () => controller.abort();
  }, []);

  return createPortal(
    <div
      id={`help-widget-${id}`}
      className="hidden fixed top-0 right-0 w-full md:w-1/2 lg:w-1/3 xl:w-1/4 h-full shadow-xl border rounded-l-lg z-50 overflow-y-auto"
      style={{
        backgroundColor: colors.$1,
        color: colors.$3,
        borderColor: colors.$4,
      }}
      ref={helpWidgetRef}
    >
      <div
        className="flex justify-between items-center sticky px-5 py-3 top-0"
        style={{ backgroundColor: colors.$1 }}
      >
        <div></div>

        <div className="flex items-center space-x-2">
          <button
            className="hidden md:block"
            type="button"
            onClick={() => {
              const e = document.getElementById(`help-widget-${id}`);

              if (e) {
                e.classList.toggle('right-0');
                e.classList.toggle('left-0');
              }
            }}
          >
            <Layers size={18} />
          </button>

          <button>
            <X size={20} onClick={() => $help(id)} />
          </button>
        </div>
      </div>

      <div className="prose-sm p-5" ref={contentRef}>
        <Markdown rehypePlugins={[rehypeRaw]}>{data}</Markdown>

        <div className="flex justify-center">
          <Link
            to={`https://invoiceninja.github.io/${slug.replace('.md', '')}`}
            external
            className="flex items-center space-x-2"
          >
            <span>{t('view_docs')}</span> <ExternalLink size={16} />
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}

export interface HelpOptions {
  moveToHeading: string;
}

export function $help(id: string, options?: HelpOptions) {
  const div = document.querySelector(
    `div#help-widget-${id}`
  ) as HTMLDivElement | null;

  console.log(div);

  if (div) {
    div.classList.toggle('hidden');

    if (options?.moveToHeading) {
      window.dispatchEvent(
        new CustomEvent(`help-widget-${id}:moveToHeading`, {
          detail: options.moveToHeading,
        })
      );
    }
  }
}
