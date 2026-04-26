import React from 'react';
import { ToolbarFile } from '@/components/toolbar/ToolbarFile';
import { ToolbarOrganize } from '@/components/toolbar/ToolbarOrganize';
import { ToolbarComment } from '@/components/toolbar/ToolbarComment';
import { ToolbarView } from '@/components/toolbar/ToolbarView';
import { ToolbarMacro } from '@/components/toolbar/ToolbarMacro';
import { useEditorStore } from '@/core/editor/store';
import type { RibbonTab } from '@/core/editor/types';

const RIBBON_TABS: Array<{ id: RibbonTab; label: string }> = [
  { id: 'file', label: 'File' },
  { id: 'organize', label: 'Organize' },
  { id: 'annotate', label: 'Annotate' },
  { id: 'macro', label: 'Macro' },
  { id: 'view', label: 'View' },
  { id: 'author', label: 'Author' },
  { id: 'insert', label: 'Insert' },
  { id: 'layout', label: 'Layout' },
  { id: 'format', label: 'Format' },
];

export const ToolbarBand: React.FC = () => {
  const { activeRibbonTab, setActiveRibbonTab } = useEditorStore();

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
      <div className="flex items-center gap-1 px-3 pt-2">
        {RIBBON_TABS.map((tab) => {
          const active = activeRibbonTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveRibbonTab(tab.id)}
              className={`rounded-t-md px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-b-0 border-slate-200 dark:border-slate-800'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-stretch gap-3 px-3 py-2 overflow-x-auto overflow-y-hidden min-h-[74px]">
        {activeRibbonTab === 'file' && (
          <RibbonGroup title="Document">
            <ToolbarFile />
          </RibbonGroup>
        )}

        {activeRibbonTab === 'organize' && (
          <RibbonGroup title="Page Tools">
            <ToolbarOrganize />
          </RibbonGroup>
        )}

        {activeRibbonTab === 'annotate' && (
          <RibbonGroup title="Annotation">
            <ToolbarComment />
          </RibbonGroup>
        )}

        {activeRibbonTab === 'macro' && (
          <RibbonGroup title="Macro Commands">
            <ToolbarMacro />
          </RibbonGroup>
        )}

        {activeRibbonTab === 'view' && (
          <RibbonGroup title="Viewer">
            <ToolbarView />
          </RibbonGroup>
        )}

        {activeRibbonTab === 'author' && (
          <RibbonGroup title="Authoring">
            <div className="h-10 px-4 flex items-center text-sm text-slate-500">Authoring tools coming soon</div>
          </RibbonGroup>
        )}

        {activeRibbonTab === 'insert' && (
          <RibbonGroup title="Insert">
            <div className="h-10 px-4 flex items-center text-sm text-slate-500">Insert tools coming soon</div>
          </RibbonGroup>
        )}

        {activeRibbonTab === 'layout' && (
          <RibbonGroup title="Layout">
            <div className="h-10 px-4 flex items-center text-sm text-slate-500">Layout tools coming soon</div>
          </RibbonGroup>
        )}

        {activeRibbonTab === 'format' && (
          <RibbonGroup title="Format">
            <div className="h-10 px-4 flex items-center text-sm text-slate-500">Formatting tools coming soon</div>
          </RibbonGroup>
        )}
      </div>
    </div>
  );
};

const RibbonGroup: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => {
  return (
    <div className="flex flex-col rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 min-w-fit">
      <div className="p-2">{children}</div>
      <div className="border-t border-slate-200 dark:border-slate-800 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400 text-center">
        {title}
      </div>
    </div>
  );
};
