# PDF Hub — Phase-wise Source-Level Work Instruction

Grounded against the updated source tree in `/mnt/data/updated_pdf_hub`.

## Goal

Evolve the current app from a PDF-native reader/reviewer/editor into a **PDF workbench with writer-like capabilities**, while keeping current page operations, annotations, search, and macros stable.

The target is **not** “Word inside a PDF viewer.” The target is:

1. strong PDF-native operations on existing files,
2. strong review/annotation workflows,
3. semantic authoring for new content,
4. server-side compilation for future “create PDF from scratch”.

---

## Hard architectural rules

### Rule 1 — Keep two separate lanes
Do **not** force future writer features into the current PDF mutation lane.

- **Lane A — PDF-native lane**
  - existing file open/save/export
  - rotate/reorder/insert/replace/delete/merge
  - annotation overlays and flattening
  - search and overlay replace
  - macros over existing PDFs
  - current files: `frontend/src/adapters/pdf-edit/*`, `frontend/src/core/commands/*`, `frontend/src/core/session/*`

- **Lane B — semantic authoring lane**
  - paragraphs, headings, lists, tables, images, templates, styles, TOC, outline, references
  - new files to add under `frontend/src/core/authoring/*`, `frontend/src/core/styles/*`, `frontend/src/core/layout/*`, `frontend/src/core/tables/*`

### Rule 2 — PDF bytes are not the future authoring model
Current session state stores `originalBytes` and `workingBytes` in `frontend/src/core/session/types.ts`. That must stay for PDF-native flows, but new document creation must use a semantic document model.

### Rule 3 — Do not store writer content in annotation payloads
Do not overload `PdfAnnotation.data` with rich text, tables, or page templates.

### Rule 4 — Do not let macros become the authoring engine
Macros should automate both lanes, but they must not become the storage model for documents.

### Rule 5 — Compilation belongs to a dedicated compile path
For future “create PDF from scratch”, use a compiler stage:
- semantic model → paginated layout → PDF output
- preview can render a draft view
- final compile should be server-owned

---

## Current source anchors you should build on

### Existing shell and UI state
- `frontend/src/core/editor/types.ts`
- `frontend/src/core/editor/store.ts`
- `frontend/src/components/shell/LeftRail.tsx`
- `frontend/src/components/shell/ToolbarBand.tsx`
- `frontend/src/components/sidebar/SidebarPanel.tsx`
- `frontend/src/components/inspector/InspectorPanel.tsx`

### Existing document command and PDF-native mutation flow
- `frontend/src/core/commands/types.ts`
- `frontend/src/core/commands/dispatch.ts`
- `frontend/src/adapters/pdf-edit/PdfEditAdapter.ts`

### Existing search primitives worth extending
- `frontend/src/core/search/types.ts`
- `frontend/src/core/search/store.ts`
- `frontend/src/core/search/indexer.ts`
- `frontend/src/core/search/overlayReplace.ts`
- `frontend/src/components/sidebar/SearchPanel.tsx`

### Existing thumbnail / organize foundation
- `frontend/src/components/sidebar/panels/ThumbnailSidebar.tsx`
- `frontend/src/components/sidebar/thumbnails/*`
- `frontend/src/components/toolbar/ToolbarOrganize.tsx`
- `frontend/src/core/session/store.ts`

### Existing review / annotation foundation
- `frontend/src/core/annotations/*`
- `frontend/src/components/toolbar/ToolbarComment.tsx`
- `frontend/src/components/inspector/InspectorPanel.tsx`
- `frontend/src/components/workspace/DocumentWorkspace.tsx`

---

# Phase 0 — Contract freeze and shell expansion

## Objective
Add the UI and state contracts for writer-like features **without** yet implementing semantic editing. This prevents future work from being forced into annotations or PDF byte mutations.

## Files to modify

### 1) Expand shell enums in `frontend/src/core/editor/types.ts`

#### Change `SidebarTab`
Current:
- `thumbnails | bookmarks | comments | search | macros`

Replace with:
- `thumbnails | bookmarks | comments | search | outline | styles | assets | templates | forms | macros`

#### Change `RibbonTab`
Current:
- `file | organize | annotate | macro | view`

Replace with:
- `file | organize | insert | layout | annotate | forms | macro | view | author`

#### Add workspace surface mode
Add:
```ts
export type WorkspaceSurface = 'pdf' | 'author';
```

#### Extend `EditorState`
Add:
- `workspaceSurface: WorkspaceSurface`
- `authorInspectorTab: 'document' | 'selection' | 'style' | 'layout'`
- `showGuides: boolean`
- `showRulers: boolean`
- `showGrid: boolean`
- `snapToGrid: boolean`
- `snapToGuides: boolean`

### 2) Extend store in `frontend/src/core/editor/store.ts`
Add setters for every new field. Keep the current Zustand pattern.

### 3) Update left rail in `frontend/src/components/shell/LeftRail.tsx`
Add icons and tabs for:
- Outline
- Styles
- Assets
- Templates
- Forms

Do **not** remove current tabs.

### 4) Update ribbon in `frontend/src/components/shell/ToolbarBand.tsx`
Add placeholder tabs for:
- Insert
- Layout
- Forms
- Author

New toolbar components to create as placeholders:
- `frontend/src/components/toolbar/ToolbarInsert.tsx`
- `frontend/src/components/toolbar/ToolbarLayout.tsx`
- `frontend/src/components/toolbar/ToolbarForms.tsx`
- `frontend/src/components/toolbar/ToolbarAuthor.tsx`

### 5) Update sidebar panel switching in `frontend/src/components/sidebar/SidebarPanel.tsx`
Create placeholder panels:
- `frontend/src/components/sidebar/panels/OutlineSidebar.tsx`
- `frontend/src/components/sidebar/panels/StylesSidebar.tsx`
- `frontend/src/components/sidebar/panels/AssetsSidebar.tsx`
- `frontend/src/components/sidebar/panels/TemplatesSidebar.tsx`
- `frontend/src/components/sidebar/panels/FormsSidebar.tsx`

### 6) Update inspector panel in `frontend/src/components/inspector/InspectorPanel.tsx`
Add one additional high-level mode switch at the top:
- PDF selection inspector
- Author selection inspector

Do not intermix both in the same form.

## Files to add
- `frontend/src/core/authoring/types.ts`
- `frontend/src/core/styles/types.ts`
- `frontend/src/core/assets/types.ts`
- `frontend/src/core/layout/types.ts`
- `frontend/src/core/tables/types.ts`
- `frontend/src/core/forms/types.ts`
- `frontend/src/core/outline/types.ts`

These files should contain **types only** in Phase 0.

## Minimal type contracts to add

### `frontend/src/core/authoring/types.ts`
```ts
export type DocNode =
  | ParagraphNode
  | HeadingNode
  | BulletListNode
  | NumberedListNode
  | ImageNode
  | TableNode
  | TocNode
  | PageBreakNode
  | TextFrameNode;

export interface AuthorDocument {
  id: string;
  title: string;
  pageSize: 'A4' | 'A3' | 'Letter' | 'Legal' | { width: number; height: number };
  sections: AuthorSection[];
  styles: string[];
  assets: string[];
  createdAt: number;
  updatedAt: number;
}
```

### `frontend/src/core/styles/types.ts`
Add:
- `ParagraphStyle`
- `CharacterStyle`
- `TableStyle`
- `DocumentTheme`

### `frontend/src/core/layout/types.ts`
Add:
- `SectionLayout`
- `HeaderFooterSpec`
- `PageTemplate`
- `GuideLine`
- `MarginBox`

### `frontend/src/core/tables/types.ts`
Add:
- `TableNode`
- `TableRow`
- `TableCell`
- `CellBorderSpec`

### `frontend/src/core/forms/types.ts`
Add:
- `FormFieldSchema`
- `FormFieldType`
- `FormValidationRule`

## Acceptance tests
Create or update:
- `frontend/src/components/shell/ToolbarBand.test.tsx`
- `frontend/src/components/shell/LeftRail.test.tsx`
- `frontend/src/components/sidebar/SidebarPanel.test.tsx`
- `frontend/src/core/editor/store.test.ts`

### Pass criteria
- ribbon contains `Insert`, `Layout`, `Forms`, `Author`
- left rail contains `Outline`, `Styles`, `Assets`, `Templates`, `Forms`
- switching those tabs does not throw
- store preserves new editor flags and defaults
- no existing page/annotation/search/macros regressions

---

# Phase 1 — Semantic authoring core and store

## Objective
Introduce a real authoring document model and store, but keep it isolated from the PDF-native session state.

## Files to add
- `frontend/src/core/authoring/store.ts`
- `frontend/src/core/authoring/history.ts`
- `frontend/src/core/authoring/selectors.ts`
- `frontend/src/core/authoring/defaults.ts`
- `frontend/src/core/styles/store.ts`
- `frontend/src/core/assets/store.ts`
- `frontend/src/core/layout/store.ts`
- `frontend/src/core/tables/store.ts`
- `frontend/src/core/forms/store.ts`
- `frontend/src/core/outline/store.ts`

## Files to modify

### 1) `frontend/src/core/commands/types.ts`
Do **not** keep expanding `DocumentCommand` for authoring features.

Add a second command union:
```ts
export type AuthoringCommand =
  | { type: 'AUTHOR_CREATE_DOCUMENT'; title: string; pageSize?: 'A4' | 'Letter' }
  | { type: 'AUTHOR_INSERT_PARAGRAPH'; sectionId: string; afterNodeId?: string; node: ParagraphNode }
  | { type: 'AUTHOR_INSERT_HEADING'; sectionId: string; afterNodeId?: string; node: HeadingNode }
  | { type: 'AUTHOR_INSERT_TEXT_FRAME'; pageId: string; node: TextFrameNode }
  | { type: 'AUTHOR_INSERT_IMAGE'; pageId: string; node: ImageNode }
  | { type: 'AUTHOR_INSERT_TABLE'; pageId: string; node: TableNode }
  | { type: 'AUTHOR_APPLY_PARAGRAPH_STYLE'; nodeIds: string[]; styleId: string }
  | { type: 'AUTHOR_SET_HEADER_FOOTER'; sectionId: string; header?: HeaderFooterSpec; footer?: HeaderFooterSpec }
  | { type: 'AUTHOR_GENERATE_OUTLINE' }
  | { type: 'AUTHOR_GENERATE_TOC'; targetSectionId: string };
```

### 2) Add authoring dispatcher
Create:
- `frontend/src/core/authoring/dispatch.ts`

Do **not** put semantic command execution into `frontend/src/core/commands/dispatch.ts`.

### 3) Extend `frontend/src/pages/WorkspacePage.tsx`
Add a workspace switch:
- PDF workspace → current `DocumentWorkspace`
- Author workspace → new placeholder `AuthorWorkspace`

## Files to add for workspace
- `frontend/src/components/workspace/AuthorWorkspace.tsx`
- `frontend/src/components/workspace/author/AuthorCanvas.tsx`
- `frontend/src/components/workspace/author/AuthorSelectionOverlay.tsx`

Phase 1 `AuthorWorkspace` can be simple:
- empty page canvas
- selection border
- basic drop zone for new nodes

## Store requirements

### `frontend/src/core/authoring/store.ts`
Must include:
- current `AuthorDocument | null`
- selected node ids
- active section id
- active page id
- dirty flag
- last compile timestamp

### `frontend/src/core/styles/store.ts`
Must include default seeded styles:
- `Heading 1`
- `Heading 2`
- `Body`
- `Bullet`
- `Caption`
- `Table Default`

### `frontend/src/core/assets/store.ts`
Must track:
- asset id
- asset type (`image`, `logo`, `signature`, `stamp`, `snippet`)
- source
- width/height metadata

## Do not do in Phase 1
- no rich text editor yet
- no actual PDF export from author document yet
- no pagination engine yet
- no forms designer yet

## Acceptance tests
Create:
- `frontend/src/core/authoring/store.test.ts`
- `frontend/src/core/styles/store.test.ts`
- `frontend/src/pages/WorkspacePage.author.test.tsx`

### Pass criteria
- author workspace can be toggled on/off without affecting current PDF session
- creating a new author document produces a valid default structure
- inserting paragraph/image/table nodes updates the store deterministically
- outline generation from headings works in-memory

---

# Phase 2 — Insert and layout tools on the authoring lane

## Objective
Expose the first real writer-like tools: rich text frame, image insertion, bullets, headers/footers, page templates, and manual tables.

## Files to add
- `frontend/src/components/toolbar/ToolbarInsert.tsx`
- `frontend/src/components/toolbar/ToolbarLayout.tsx`
- `frontend/src/components/dialogs/InsertImageDialog.tsx`
- `frontend/src/components/dialogs/HeaderFooterDialog.tsx`
- `frontend/src/components/dialogs/PageTemplateDialog.tsx`
- `frontend/src/components/dialogs/InsertTableDialog.tsx`
- `frontend/src/components/workspace/author/TextFrameNodeView.tsx`
- `frontend/src/components/workspace/author/ImageFrameNodeView.tsx`
- `frontend/src/components/workspace/author/TableNodeView.tsx`
- `frontend/src/components/sidebar/panels/PageTemplatesSidebar.tsx`

## Files to modify

### 1) `frontend/src/components/shell/ToolbarBand.tsx`
Wire real components for `insert` and `layout`.

### 2) `frontend/src/components/workspace/AuthorWorkspace.tsx`
Render author nodes by type.

### 3) `frontend/src/core/layout/store.ts`
Add actions for:
- create template
- apply template to section
- duplicate template
- assign running header source
- change margins / guides

### 4) `frontend/src/core/authoring/dispatch.ts`
Implement:
- insert text frame
- insert image
- insert table
- set section header/footer
- apply page template

## Source-level behaviors to implement

### Text frame
- absolute-position frame on a page
- editable plain/rich text surface inside the frame
- alignment: left, center, right
- padding, fill, border

### Image frame
- insert local image
- fit modes: contain, cover, original
- preserve aspect toggle
- caption child node allowed

### Manual table
- rows, columns
- resize columns
- cell text entry
- merged cells can wait until Phase 3

### Header/footer
Use current `ADD_HEADER_FOOTER_TEXT` capability only for PDF-native lane.
For author lane, store section-level header/footer spec in semantic state.

### Page templates
Support:
- page size
- margins
- guide lines
- optional background/logo region
- header/footer placeholders

## Important constraint
Do not call `PdfEditAdapter` when editing the author document. That adapter is for Lane A only.

## Acceptance tests
Create:
- `frontend/src/components/workspace/author/AuthorWorkspace.test.tsx`
- `frontend/src/core/layout/store.test.ts`
- `frontend/src/components/dialogs/HeaderFooterDialog.test.tsx`

### Quantitative pass criteria
- creating 20 text frames on one page should complete in under 100 ms in jsdom reducer tests
- selecting, moving, and resizing an author node should not mutate unrelated nodes
- applying a page template to a section should update every page in that section deterministically
- no `PdfEditAdapter` imports inside `frontend/src/core/authoring/*`

---

# Phase 3 — Writer-grade content model: styles, stories, lists, tables, TOC, forms

## Objective
Move from positioned objects to real document composition.

## Files to add
- `frontend/src/components/workspace/author/StoryEditor.tsx`
- `frontend/src/components/sidebar/panels/OutlineSidebar.tsx` (real implementation)
- `frontend/src/components/sidebar/panels/StylesSidebar.tsx` (real implementation)
- `frontend/src/components/sidebar/panels/FormsSidebar.tsx` (real implementation)
- `frontend/src/components/inspector/author/AuthorStyleInspector.tsx`
- `frontend/src/components/inspector/author/AuthorLayoutInspector.tsx`
- `frontend/src/core/outline/generator.ts`
- `frontend/src/core/tables/clipboard.ts`
- `frontend/src/core/forms/designer.ts`
- `frontend/src/core/forms/export.ts`

## Files to modify

### 1) `frontend/src/core/styles/store.ts`
Add:
- style inheritance
- rename style
- duplicate style
- remove style with fallback
- default style lock protection

### 2) `frontend/src/core/tables/store.ts`
Add:
- merged cell model
- header row support
- cell vertical/horizontal align
- table style application
- row repeat rules

### 3) `frontend/src/core/outline/store.ts`
Add outline tree nodes generated from heading nodes.

### 4) `frontend/src/components/sidebar/SearchPanel.tsx`
Extend search scopes:
- PDF page text
- author document nodes
- form fields
- comments/review notes

### 5) `frontend/src/core/search/types.ts`
Add:
- `searchScope`
- `deepLinkTarget`
- `SearchDocumentKind = 'pdf' | 'author' | 'review' | 'form'`

## Required features

### Lists and paragraphs
- bullet lists
- numbered lists
- increase/decrease indent
- paragraph spacing before/after
- hanging indent for bullets

### Styles
- paragraph and character styles
- apply style to selection
- update style from selection
- show “mixed” style state for multi-select

### TOC and outline
- build outline from heading nodes
- generate TOC node from heading levels
- update TOC on command, not continuously

### Tables
- clipboard TSV/CSV paste into table
- copy selected cells back to clipboard as TSV
- insert row/column
- delete row/column

### Forms designer
- add text field, checkbox, signature placeholder, date field
- set name, required, default value, validation rules
- export semantic form schema

## Do not do in Phase 3
- no final server PDF compile yet
- no full WYSIWYG pagination perfection yet
- no OCR integration with author lane yet

## Acceptance tests
Create:
- `frontend/src/core/outline/generator.test.ts`
- `frontend/src/core/tables/clipboard.test.ts`
- `frontend/src/core/styles/store.test.ts`
- `frontend/src/core/forms/designer.test.ts`
- `frontend/src/components/sidebar/SearchPanel.author-search.test.tsx`

### Quantitative pass criteria
- generate outline from 200 heading nodes in under 50 ms
- paste 50x10 clipboard table into empty table in under 120 ms reducer time
- TOC generation for 500 headings produces deterministic node order
- style updates on 100 selected nodes complete in under 100 ms

---

# Phase 4 — Compile pipeline, PDF creation from scratch, publish profiles

## Objective
Make the authoring lane capable of producing PDFs from scratch.

## New top-level directories to add
Because the extracted update does not yet contain a real backend, add:
- `backend/`
- `backend/app/`
- `backend/compiler/`
- `backend/compiler/layout/`
- `backend/compiler/pdf/`
- `backend/compiler/forms/`
- `backend/tests/`

## Files to add (backend)
- `backend/app/main.py`
- `backend/app/routes_compile.py`
- `backend/app/schemas.py`
- `backend/compiler/types.py`
- `backend/compiler/layout/paginate.py`
- `backend/compiler/pdf/render_pdf.py`
- `backend/compiler/forms/render_forms.py`
- `backend/tests/test_compile_basic.py`
- `backend/tests/test_compile_headers_footers.py`
- `backend/tests/test_compile_tables.py`

## Files to add (frontend)
- `frontend/src/core/authoring/compileClient.ts`
- `frontend/src/core/authoring/compileStore.ts`
- `frontend/src/components/toolbar/ToolbarPublish.tsx`
- `frontend/src/components/dialogs/PublishProfileDialog.tsx`

## Files to modify

### 1) `frontend/src/App.tsx`
If server routes are added, ensure API base configuration exists and preview mode fails gracefully.

### 2) `frontend/src/core/authoring/store.ts`
Add compile snapshot export:
- serialize semantic document
- serialize styles
- serialize assets manifest
- serialize templates

### 3) `frontend/src/components/shell/ToolbarBand.tsx`
Add publish/compile entry under `author` or `file` tab.

## Compile pipeline requirements

### Input
- semantic author document JSON
- styles map
- asset manifest
- template map
- publish profile

### Output
At minimum:
- compiled PDF bytes
- compile diagnostics JSON
- outline/bookmark JSON
- optional form schema JSON

### Publish profiles
Add support for:
- `review-pdf`
- `print-pdf`
- `flattened-pdf`
- `interactive-form-pdf`

## Constraints
- preview mode may render a draft author canvas only
- final compile may be disabled in preview mode
- compile must never mutate PDF-native session bytes directly

## Acceptance tests
- semantic document with 10 pages compiles to a PDF successfully
- headers/footers appear on every expected page
- page numbers respect section rules
- table content remains aligned after pagination
- publish profile changes output options deterministically

### Quantitative pass criteria
- compile of 10-page semantic document in dev environment < 3 s
- compile diagnostics always emitted on success and failure
- repeated compile of same input produces byte-identical or layout-identical output depending on metadata timestamp policy

---

# Phase 5 — Integrate search, review, macros, and thumbnail UX across both lanes

## Objective
Make the product coherent rather than “two apps beside each other”.

## Files to modify
- `frontend/src/components/sidebar/SearchPanel.tsx`
- `frontend/src/core/search/indexer.ts`
- `frontend/src/core/search/store.ts`
- `frontend/src/core/search/types.ts`
- `frontend/src/components/sidebar/panels/ThumbnailSidebar.tsx`
- `frontend/src/components/inspector/InspectorPanel.tsx`
- `frontend/src/core/macro/types.ts`
- `frontend/src/core/macro/executor.ts`
- `frontend/src/core/macro/batchRunner.ts`

## Required integration work

### Search deep links
Search results must navigate to:
- PDF page hit
- author document node id
- outline node
- form field id
- comment/review thread id

### Review integration
Allow review comments to target:
- PDF annotation ids
- author node ids
- form field ids

### Macro integration
Split macro opcodes into two namespaces:
- `pdf.*`
- `author.*`

Examples:
- `pdf.rotate_pages`
- `pdf.merge_documents`
- `author.insert_template`
- `author.generate_toc`
- `author.apply_style`

### Thumbnail / page rail integration
For author documents, the page rail must show:
- page templates applied
- section boundaries
- header/footer presence
- unresolved review markers
- search hit markers

## Acceptance tests
- cross-lane search returns scoped results without collisions
- macro validation rejects `author.*` commands in a PDF-only context and vice versa
- page rail shows section breaks and template badges in author mode
- review comment deep links open correct target type

---

## File ownership and merge strategy

### Wave 1 — contracts and shell
Single-owner files:
- `frontend/src/core/editor/types.ts`
- `frontend/src/core/editor/store.ts`
- `frontend/src/components/shell/ToolbarBand.tsx`
- `frontend/src/components/shell/LeftRail.tsx`

### Wave 2 — authoring core
Single-owner files:
- `frontend/src/core/authoring/*`
- `frontend/src/core/styles/*`
- `frontend/src/core/layout/*`
- `frontend/src/core/tables/*`
- `frontend/src/core/forms/*`

### Wave 3 — workspace and inspectors
Single-owner files:
- `frontend/src/components/workspace/*`
- `frontend/src/components/inspector/*`
- `frontend/src/components/sidebar/panels/*`

### Wave 4 — compile and publish
Single-owner files:
- `backend/**/*`
- `frontend/src/core/authoring/compile*`
- `frontend/src/components/dialogs/PublishProfileDialog.tsx`

Do **not** parallel-edit `ToolbarBand.tsx`, `SidebarPanel.tsx`, `InspectorPanel.tsx`, or `WorkspacePage.tsx` in more than one branch at a time.

---

## Explicit non-goals for this rollout

Do not include these until after Phase 5:
- inline OCR text rewrite into arbitrary PDF text streams
- full Word parity
- track changes with character-level diff rendering
- collaborative multi-user editing
- spreadsheet formulas in tables
- HTML import with full CSS fidelity

---

## Final implementation note

The most important strategic decision is this:

**Treat the current app as a mature PDF-native lane and build a parallel semantic authoring lane beside it.**

If you instead keep extending `PdfEditAdapter`, `DocumentCommand`, and annotation payloads to simulate writer features, the project will grow in size but not in capability.
