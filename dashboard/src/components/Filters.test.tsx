/**
 * Tests for SearchBar component
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '../components/Filters';

describe('SearchBar Component', () => {
  it('renders with placeholder', () => {
    render(
      <SearchBar
        value=""
        onChange={() => {}}
        placeholder="Search agents..."
      />
    );

    const input = screen.getByPlaceholderText('Search agents...');
    expect(input).toBeDefined();
  });

  it('displays current value', () => {
    render(
      <SearchBar
        value="test query"
        onChange={() => {}}
      />
    );

    const input = screen.getByDisplayValue('test query');
    expect(input).toBeDefined();
  });

  it('calls onChange when text is entered', () => {
    const handleChange = vi.fn();
    render(
      <SearchBar
        value=""
        onChange={handleChange}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new text' } });

    expect(handleChange).toHaveBeenCalledWith('new text');
  });

  it('shows clear button when value is not empty', () => {
    render(
      <SearchBar
        value="some text"
        onChange={() => {}}
      />
    );

    const clearButton = screen.getByRole('button');
    expect(clearButton).toBeDefined();
  });

  it('does not show clear button when value is empty', () => {
    const { container } = render(
      <SearchBar
        value=""
        onChange={() => {}}
      />
    );

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(0);
  });

  it('clears value when clear button is clicked', () => {
    const handleChange = vi.fn();
    render(
      <SearchBar
        value="text to clear"
        onChange={handleChange}
      />
    );

    const clearButton = screen.getByRole('button');
    fireEvent.click(clearButton);

    expect(handleChange).toHaveBeenCalledWith('');
  });
});
