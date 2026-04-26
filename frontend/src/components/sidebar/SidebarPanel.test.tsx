import React from 'react';
import { render, screen } from '@testing-library/react';
import { SidebarPanel } from './SidebarPanel';
import { useEditorStore } from '@/core/editor/store';

describe('SidebarPanel', () => {
  it('renders outline tab without throwing', () => {
    useEditorStore.setState({ sidebarTab: 'outline' });
    render(<SidebarPanel />);
    expect(screen.getByText('Outline')).toBeInTheDocument();
    expect(screen.getByText('Outline goes here')).toBeInTheDocument();
  });

  it('renders forms tab without throwing', () => {
    useEditorStore.setState({ sidebarTab: 'forms' });
    render(<SidebarPanel />);
    expect(screen.getByText('Forms')).toBeInTheDocument();
    expect(screen.getByText('Forms go here')).toBeInTheDocument();
  });
});
