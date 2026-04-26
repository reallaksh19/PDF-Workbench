# PDF Workbench Merge Plan & Integration Notes

## 1. File Ownership Rules (Phase 2+)

*   **`frontend/src/components/shell/ToolbarBand.tsx`**: Single-owner (Shell/UI). Other agents must not edit this file directly to add tabs.
*   **`frontend/src/components/shell/LeftRail.tsx`**: Single-owner (Shell/UI).
*   **`frontend/src/components/sidebar/SidebarPanel.tsx`**: Single-owner (Shell/UI).
*   **`frontend/src/components/inspector/InspectorPanel.tsx`**: Single-owner (Shell/UI).
*   **`frontend/src/components/shell/WorkspacePage.tsx`**: Single-owner (Shell/UI).

## 2. Merge Waves

*   **Wave 1: Shell and Contracts** (Current wave). Establish base types, document command structure, empty `AuthoringCommand` structure, store flags, and basic UI structure without throws.
*   **Wave 2: Authoring Core**. Implementation of `AuthoringCommand`, basic state history, and integration with the command bus.
*   **Wave 3: Insert / Layout**. Inserting new objects, changing layout, alignment tools, etc.
*   **Wave 4: Styles / Tables / Outline / Forms**. Rich text styles, tables, outlines, and form fields.
*   **Wave 5: Compile / Publish**. Export, generation, and output formatting.
*   **Wave 6: Cross-lane Integration**. Final integration, end-to-end testing, and ensuring smooth interaction between PDF-native and Authoring lanes.

## 3. Contract Guards

*   `AuthoringCommand` must remain entirely separate from `DocumentCommand`. They address different conceptual layers (semantic authoring vs. PDF document manipulation).
*   **NO `PdfEditAdapter` imports inside `frontend/src/core/authoring/*`**. Authoring logic must deal with semantic intent, not direct PDF manipulation.

## 4. Merge Checklist

1.  Types first (`types.ts` updates).
2.  Store second (`store.ts` updates).
3.  UI third (`ToolbarBand.tsx`, `LeftRail.tsx`, etc.).
4.  Tests fourth (Shell tests, store tests).
5.  Integration fifth (Verify no throw on render).

## 5. Reviewer Notes for Downstream Agents

*   **Architecture Violations**: Reject any PR that mixes `DocumentCommand` and `AuthoringCommand` logic.
*   **Imports**: Reject any PR that imports `PdfEditAdapter` into `core/authoring`.
*   **State**: Ensure new state pieces are isolated and deterministic in Zustand.
*   **UI Edits**: Agents must NOT directly edit Shell/UI single-owner files (ToolbarBand, LeftRail, SidebarPanel, InspectorPanel, WorkspacePage) to add their tabs. They should register them through a standardized extension mechanism (to be defined, but for now, no direct edits).
