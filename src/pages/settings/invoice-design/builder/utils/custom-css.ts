/**
 * The API design contract stores custom CSS as a complete style fragment,
 * while the editor works with the CSS body only.
 */
const STYLE_ELEMENT_PATTERN =
  /^\s*<style(?:\s[^>]*)?>([\s\S]*)<\/style\s*>\s*$/i;

const CSS_ESCAPE_PATTERN = /\\([0-9a-f]{1,6})\s?|\\([^\r\n\f])/gi;
const CSS_LINE_CONTINUATION_PATTERN = /\\(?:\r\n|[\n\r\f])/g;
const CSS_COMMENT_PATTERN = /\/\*[\s\S]*?\*\//g;

/**
 * CSS is inserted into both a live style element and generated preview HTML.
 * Keep custom declarations/selectors available, but reject capabilities that
 * can escape the style context, execute legacy script hooks, or initiate a
 * request from the browser/PDF preview.
 */
const UNSAFE_CSS_PATTERN =
  /[<>]|@import\b|(?:url|src|image-set|-webkit-image-set|expression)\s*\(|(?:behavior|-moz-binding)\s*:|(?:https?|file|ftp|javascript|data)\s*:|\/\//i;

function decodeCssEscapesForInspection(css: string): string {
  return css
    .replace(CSS_LINE_CONTINUATION_PATTERN, '')
    .replace(
      CSS_ESCAPE_PATTERN,
      (_match, hex: string | undefined, char: string) => {
        if (!hex) {
          return char;
        }

        const codePoint = Number.parseInt(hex, 16);

        if (
          !Number.isFinite(codePoint) ||
          codePoint === 0 ||
          codePoint > 0x10ffff
        ) {
          return '\uFFFD';
        }

        return String.fromCodePoint(codePoint);
      }
    );
}

function removeCssControlCharacters(css: string): string {
  return Array.from(css)
    .filter((character) => {
      const codePoint = character.codePointAt(0) ?? 0;

      return (
        codePoint === 9 ||
        codePoint === 10 ||
        codePoint === 13 ||
        (codePoint >= 32 && codePoint !== 127)
      );
    })
    .join('');
}

export function unwrapCustomCssFromApi(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  const match = value.match(STYLE_ELEMENT_PATTERN);

  return match ? match[1].trim() : value;
}

export function sanitizeCustomCss(value: unknown): string {
  const css = removeCssControlCharacters(unwrapCustomCssFromApi(value)).trim();

  if (!css) {
    return '';
  }

  const inspectionValue = decodeCssEscapesForInspection(css).replace(
    CSS_COMMENT_PATTERN,
    ''
  );

  return UNSAFE_CSS_PATTERN.test(inspectionValue) ? '' : css;
}

export function wrapCustomCssForApi(value: unknown): string {
  const css = sanitizeCustomCss(value);

  return css ? `<style>\n${css}\n</style>` : '';
}
