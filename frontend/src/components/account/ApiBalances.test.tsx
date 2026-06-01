import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ApiBalances } from './ApiBalances';

const convexClient = new ConvexReactClient('https://example.convex.cloud');

describe('ApiBalances', () => {
  it('renders the three provider indicators (placeholder while loading)', () => {
    render(
      <ConvexProvider client={convexClient}>
        <ApiBalances />
      </ConvexProvider>,
    );
    expect(screen.getByText('GPT')).toBeInTheDocument();
    expect(screen.getByText('Google')).toBeInTheDocument();
    // No live query under the test client → dashes, not numbers.
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });
});
