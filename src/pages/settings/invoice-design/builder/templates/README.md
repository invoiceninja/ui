# Invoice templates

Add a file under `definitions/` named `<name>.template.ts`. Nested folders are
supported. Its default export is a factory that receives the translation function `t` and must satisfy `TemplateFactory`:

```ts
import type { TemplateFactory } from '../registry';

export default ((t) => ({
  id: 'my-template',
  name: 'My Template',
  description: 'A description for the gallery',
  category: 'modern',
  tags: ['Clean'],
  order: 40,
  layout: {
    cols: 12,
    rowHeight: 20,
    margin: [10, 10],
    containerPadding: [20, 20],
  },
  blocks: [], // Table columns can use header: '$product.description_label', etc.
})) satisfies TemplateFactory;
```

Copy an existing definition for a complete layout. Keep template IDs unique and
stable: builder URLs and saved designs refer to them. Block IDs must be unique
within a template. The `blank` ID is reserved for the gallery's Blank Canvas card.
Categories use the existing `InvoiceTemplate` category union; adding a new category
also requires updating that type and the gallery's category filters.

`templates.ts` discovers definitions automatically using Vite's eager glob import;
there is no import list to maintain. New definitions become available in the next
build (or through the development server), not as runtime uploads. `registry.ts`
collates them, rejects duplicate IDs, and provides ID and category lookups. Lower
`order` values appear first (default: 100); ties sort by ID.

Run `npm test -- tests/unit/templates.test.ts tests/unit/template-registry.test.ts`
to check discovery, registration, block positions, and variable tokens.

React consumers call `createTemplates(t)` with `t` from `useTranslation()`, memoized
with `[t]`. Use `t` only for gallery metadata. Invoice headers and default text must
retain backend-supported label tokens: previews resolve them in the user's locale,
while the backend resolves them using the client's locale and label overrides.
Literal custom text is preserved. Factories should return fresh objects so designs
do not share mutable blocks. `$bill_to_label` requires the corresponding HtmlEngine
mapping in the backend.
