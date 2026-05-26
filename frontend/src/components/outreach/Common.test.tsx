import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, Icon, SplitButton } from './Common';

describe('Icon', () => {
  it('renders the glyph name as content', () => {
    render(<Icon name="search" />);
    expect(screen.getByText('search')).toBeInTheDocument();
  });

  it('is hidden from assistive tech', () => {
    const { container } = render(<Icon name="close" />);
    expect(container.querySelector('.outreachIcon')).toHaveAttribute(
      'aria-hidden',
    );
  });
});

describe('Button', () => {
  it('renders its label', () => {
    render(<Button variant="primary">Search Companies</Button>);
    expect(
      screen.getByRole('button', { name: /Search Companies/ }),
    ).toBeInTheDocument();
  });

  it('renders a leading icon when provided', () => {
    render(
      <Button variant="secondary" iconName="history">
        Recent Searches
      </Button>,
    );
    expect(screen.getByText('history')).toBeInTheDocument();
  });

  it('calls onClick when pressed', async () => {
    const onClick = vi.fn();
    render(
      <Button variant="primary" onClick={onClick}>
        Go
      </Button>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('SplitButton', () => {
  it('fires the primary action and the menu toggle separately', async () => {
    const onClick = vi.fn();
    const onToggleMenu = vi.fn();
    render(
      <SplitButton
        label="Import to Pipeline"
        iconName="add_task"
        onClick={onClick}
        onToggleMenu={onToggleMenu}
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: /Import to Pipeline/ }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'More import options' }),
    );
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onToggleMenu).toHaveBeenCalledTimes(1);
  });
});
