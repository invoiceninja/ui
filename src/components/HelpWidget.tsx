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
import { Layers, X } from 'react-feather';
import Markdown from 'react-markdown';
import { useQuery } from 'react-query';
import rehypeRaw from 'rehype-raw';

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
  const { data } = useQuery({
    queryKey: ['help-widget', id, url],
    queryFn: () =>
      fetch(url).then((response) =>
        response.text().then(processMarkdownContent)
      ),
  });

  // const [, slug] = url.split('v5-rework/source');

  const colors = useColorScheme();

  return (
    <div
      id={`help-widget-${id}`}
      className="hidden fixed top-0 right-0 w-full md:w-1/2 lg:w-1/3 xl:w-1/4 h-full shadow-xl border rounded-l-lg z-50 overflow-y-auto"
      style={{
        backgroundColor: colors.$1,
        color: colors.$3,
        borderColor: colors.$4,
      }}
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

      <div className="prose-sm p-5">
        <Markdown rehypePlugins={[rehypeRaw]}>{data}</Markdown>

        {/* <Link
          to={`https://invoiceninja.github.io/${slug.replace('.md', '')}`}
          external
        >
          {t('view_docs')}
        </Link> */}
      </div>
    </div>
  );
}

export function $help(id: string) {
  const div = document.querySelector(
    `div#help-widget-${id}`
  ) as HTMLDivElement | null;

  if (div) {
    div.classList.toggle('hidden');
  }
}
