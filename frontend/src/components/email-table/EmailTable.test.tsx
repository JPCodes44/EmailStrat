import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { EmailTableScreen } from './EmailTable';

const convexClient = new ConvexReactClient('https://example.convex.cloud');

describe('EmailTableScreen', () => {
  it('renders the contacts table shell', () => {
    const { container } = render(
      <ConvexProvider client={convexClient}>
        <EmailTableScreen />
      </ConvexProvider>,
    );
    expect(
      screen.getByRole('heading', { name: 'Email Table' }),
    ).toBeInTheDocument();
    expect(container.querySelector('#email-hot-table')).toBeInTheDocument();
    // No drafted companies under the test client.
    expect(screen.getByText('0 companies')).toBeInTheDocument();
  });
});
