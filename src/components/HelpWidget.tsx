/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { X } from 'react-feather';
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

  return (
    <div
      id={`help-widget-${id}`}
      className="hidden fixed top-0 right-0 w-full md:w-1/2 lg:w-1/3 xl:w-1/4 h-full bg-white shadow-xl border rounded-l-lg z-50 p-5 overflow-y-auto"
    >
      <div className="flex justify-between items-center">
        <div></div>
        <button>
          <X size={20} onClick={() => $help(id)} />
        </button>
      </div>

      <div className="prose-sm">
        <Markdown rehypePlugins={[rehypeRaw]}>{data}</Markdown>
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
