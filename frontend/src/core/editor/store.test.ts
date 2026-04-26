import { useEditorStore } from './store';

describe('Editor Store', () => {
  it('preserves new flags deterministically', () => {
    useEditorStore.setState({ inspectorTab: 'layout' });
    expect(useEditorStore.getState().inspectorTab).toBe('layout');

    useEditorStore.setState({ inspectorTab: 'data' });
    expect(useEditorStore.getState().inspectorTab).toBe('data');

    useEditorStore.setState({ activeRibbonTab: 'author' });
    expect(useEditorStore.getState().activeRibbonTab).toBe('author');
  });
});
