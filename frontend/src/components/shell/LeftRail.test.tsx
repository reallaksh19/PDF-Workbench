import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeftRail } from './LeftRail';
import { useEditorStore } from '@/core/editor/store';

describe('LeftRail', () => {
  it('renders all tabs and updates store without throwing', () => {
    render(<LeftRail />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(7); // Thumbnails, Bookmarks, Comments, Search, Macros, Outline, Forms

    // Test that we can set a tab and it doesn't crash
    fireEvent.click(buttons[5]); // Click Outline
    expect(useEditorStore.getState().sidebarTab).toBe('outline');

    fireEvent.click(buttons[6]); // Click Forms
    expect(useEditorStore.getState().sidebarTab).toBe('forms');
  });
});
