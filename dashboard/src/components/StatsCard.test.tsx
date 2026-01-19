/**
 * Tests for StatsCard component
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsCard } from '../components/StatsCard';
import { Activity } from 'lucide-react';

describe('StatsCard Component', () => {
  it('renders title and value correctly', () => {
    render(
      <StatsCard
        title="Test Title"
        value={42}
        icon={<Activity data-testid="icon" />}
      />
    );

    expect(screen.getByText('Test Title')).toBeDefined();
    expect(screen.getByText('42')).toBeDefined();
    expect(screen.getByTestId('icon')).toBeDefined();
  });

  it('renders trend information when provided', () => {
    render(
      <StatsCard
        title="Test"
        value={100}
        icon={<Activity />}
        trend={{ value: 15, isPositive: true }}
      />
    );

    expect(screen.getByText(/15%/)).toBeDefined();
  });

  it('displays positive trend correctly', () => {
    const { container } = render(
      <StatsCard
        title="Test"
        value={100}
        icon={<Activity />}
        trend={{ value: 10, isPositive: true }}
      />
    );

    const trendElement = screen.getByText(/10%/);
    expect(trendElement.className).toContain('text-green-500');
  });

  it('displays negative trend correctly', () => {
    const { container } = render(
      <StatsCard
        title="Test"
        value={100}
        icon={<Activity />}
        trend={{ value: 10, isPositive: false }}
      />
    );

    const trendElement = screen.getByText(/10%/);
    expect(trendElement.className).toContain('text-red-500');
  });

  it('renders with custom color', () => {
    const { container } = render(
      <StatsCard
        title="Test"
        value={100}
        icon={<Activity />}
        color="bg-blue-600"
      />
    );

    const iconContainer = container.querySelector('.bg-blue-600');
    expect(iconContainer).toBeDefined();
  });
});
