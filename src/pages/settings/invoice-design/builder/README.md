# Invoice Design Builder

Visual drag-and-drop editor for custom invoice templates. The builder orchestrates three layers:

## Architecture

```
InvoiceBuilder.tsx          — page shell, save/preview, property panels
├── hooks/useGridStackCanvas — GridStack init, drag/resize sync, content-height fitting
├── utils/grid/*             — grid positions, collisions, saved-block normalization
├── utils/persistence.ts       — API merge + documentSettings → generator shape
├── block-renderers/         — shared block rendering (React canvas + HTML export)
│   ├── react/CanvasBlockContent.tsx
│   └── html/render-block-content.ts
└── components/BlockRenderer.tsx — thin memo wrapper around CanvasBlockContent
```

## Key modules

| Module | Role |
|--------|------|
| `constants/page-dimensions.ts` | Page size mm/px helpers for canvas and HTML generator |
| `utils/grid-converter.ts` | 12-column grid constants (`GRID_CONFIG`) |
| `utils/html-generator.ts` | Full-document HTML export (layout + sanitization) |
| `types.ts` | Discriminated `Block` union and `BuilderState` |

## Data flow

1. **Load** — `extractBlocksFromDesign` / template gallery → normalized `Block[]`
2. **Edit** — GridStack updates `gridPosition`; property panel updates `properties`
3. **Save** — `mergeDesignParts` writes blocks + generated HTML + `documentSettings` to the API

## Adding a block type

1. Extend `BlockType` and add a typed block interface in `types.ts`
2. Add canvas rendering in `block-renderers/react/CanvasBlockContent.tsx`
3. Add HTML rendering in `block-renderers/html/render-block-content.ts`
4. Register in `block-library.tsx` and add a properties panel component
