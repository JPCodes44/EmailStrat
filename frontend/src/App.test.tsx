import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

describe('App navigation', () => {
  it('switches between Generation Jobs and Companies from the sidebar', async () => {
    render(<App />);
    // Companies is the default screen on load.
    expect(
      screen.getByRole('heading', { name: 'Generate Target List' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Notifications' }),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: /Generation Jobs/ }),
    );
    expect(
      screen.getByRole('heading', { name: 'Generation Jobs' }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Companies/ }));
    expect(
      screen.getByRole('heading', { name: 'Generate Target List' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Notifications' }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Campaigns/ }));
    expect(
      screen.getByRole('heading', { name: 'Target Companies' }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Email Table/ }));
    expect(
      screen.getByRole('heading', { name: 'Email Table' }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Draft Review/ }));
    expect(
      screen.getByRole('heading', { name: 'Review Company Email Groups' }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Continue/ }));
    expect(
      screen.getByRole('heading', { name: 'Schedule Submission' }),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Back to Draft Review' }),
    );
    expect(
      screen.getByRole('heading', { name: 'Review Company Email Groups' }),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: /Generation Jobs/ }),
    );
    expect(
      screen.getByRole('heading', { name: 'Generation Jobs' }),
    ).toBeInTheDocument();
  }, 20000);
});
