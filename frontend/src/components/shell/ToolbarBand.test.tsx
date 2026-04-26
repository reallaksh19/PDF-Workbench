import React from 'react';
import { render, screen } from '@testing-library/react';
import { ToolbarBand } from './ToolbarBand';

describe('ToolbarBand', () => {
  it('renders all tabs without throwing', () => {
    render(<ToolbarBand />);
    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('Author')).toBeInTheDocument();
    expect(screen.getByText('Insert')).toBeInTheDocument();
    expect(screen.getByText('Layout')).toBeInTheDocument();
    expect(screen.getByText('Format')).toBeInTheDocument();
  });
});
