/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Layers, X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { useColorScheme } from '$app/common/colors';
import { Link } from './forms';
import { processMarkdownContent } from './help-widget/process-markdown-content';

interface Props {
  id: string;
  url: string;
}

export function HelpWidget({ id, url }: Props) {
  const { t } = useTranslation();

  const { data } = useQuery({
    queryKey: ['help-widget', id, url],
    queryFn: () =>
      fetch(url).then((response) =>
        response.text().then(processMarkdownContent)
      ),
    staleTime: Infinity,
  });

  const [, slug = ''] = url.split('v5-rework/docs');
  const docsHref = `https://invoiceninja.github.io/docs${slug.replace(/\.mdx?$/, '')}`;

  const colors = useColorScheme();
  const contentRef = useRef<HTMLDivElement>(null);
  const helpWidgetRef = useRef<HTMLDivElement>(null);
  const pendingHeadingRef = useRef<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const isDarkMode = colors.$0 === 'dark';

  const scrollToHeading = (headingText: string) => {
    if (!contentRef.current || !helpWidgetRef.current) {
      pendingHeadingRef.current = headingText;
      return;
    }

    const headings = contentRef.current.querySelectorAll(
      'h1, h2, h3, h4, h5, h6'
    );
    const headingElement = Array.from(headings).find(
      (heading) => heading.textContent?.trim() === headingText
    );

    if (headingElement instanceof HTMLElement) {
      pendingHeadingRef.current = null;
      helpWidgetRef.current.scrollTo({
        behavior: 'smooth',
        top: headingElement.offsetTop - 50,
      });
      return;
    }

    pendingHeadingRef.current = headingText;
  };

  const scrollToHeadingRef = useRef(scrollToHeading);
  scrollToHeadingRef.current = scrollToHeading;

  useLayoutEffect(() => {
    const controller = new AbortController();

    window.addEventListener(
      `help-widget-${id}`,
      (event) => {
        const options =
          'detail' in event && event.detail && typeof event.detail === 'object'
            ? (event.detail as HelpOptions)
            : {};

        if (options.open === true) {
          setIsOpen(true);
        } else if (options.open === false) {
          setIsOpen(false);
        } else {
          setIsOpen((open) => !open);
        }

        if (options.moveToHeading) {
          scrollToHeadingRef.current(options.moveToHeading);
        }
      },
      { signal: controller.signal }
    );

    return () => controller.abort();
  }, [id]);

  useLayoutEffect(() => {
    if (!data || !isOpen || !pendingHeadingRef.current) {
      return;
    }

    const headingText = pendingHeadingRef.current;
    const frame = requestAnimationFrame(() =>
      scrollToHeadingRef.current(headingText)
    );

    return () => cancelAnimationFrame(frame);
  }, [data, isOpen]);

  return createPortal(
    <div
      id={`help-widget-${id}`}
      className={classNames(
        'fixed top-0 right-0 w-full md:w-1/2 lg:w-1/3 xl:w-1/4 h-full shadow-xl border rounded-l-lg z-50 overflow-y-auto',
        { hidden: !isOpen }
      )}
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

      <div
        className={classNames('prose prose-sm max-w-none p-5', {
          'prose-invert': isDarkMode,
        })}
        ref={contentRef}
      >
        <Markdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            a: ({ node: _node, href, children, ...props }) => (
              <a href={href} target="_blank" rel="noreferrer" {...props}>
                {children}
              </a>
            ),
            img: ({ node: _node, src, alt, ...props }) => (
              <img
                src={src}
                alt={alt ?? ''}
                className="max-w-full rounded"
                {...props}
              />
            ),
            table: ({ node: _node, children, ...props }) => (
              <div className="my-4 overflow-x-auto">
                <table {...props}>{children}</table>
              </div>
            ),
          }}
        >
          {data}
        </Markdown>

        <div className="flex justify-center">
          <Link to={docsHref} external className="flex items-center space-x-2">
            <span>{t('view_docs')}</span>
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}

export interface HelpOptions {
  moveToHeading?: string;
  open?: boolean;
}

export function $help(id: string, options?: HelpOptions) {
  window.dispatchEvent(
    new CustomEvent(`help-widget-${id}`, {
      detail: options ?? {},
    })
  );
}
