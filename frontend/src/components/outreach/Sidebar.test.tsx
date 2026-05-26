import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar, SidebarBrand, SidebarNav, SidebarNavItem } from './Sidebar';

const item = { id: 'companies', label: 'Companies', iconName: 'business' };
const items = [
  { id: 'dashboard', label: 'Dashboard', iconName: 'dashboard' },
  { id: 'companies', label: 'Companies', iconName: 'business' },
];

describe('SidebarBrand', () => {
  it('renders the title and subtitle', () => {
    render(<SidebarBrand title="Outreach OS" subtitle="Enterprise Outreach" />);
    expect(screen.getByText('Outreach OS')).toBeInTheDocument();
    expect(screen.getByText('Enterprise Outreach')).toBeInTheDocument();
  });
});

describe('SidebarNavItem', () => {
  it('marks the active item with aria-current', () => {
    render(<SidebarNavItem item={item} active onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: /Companies/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('reports its id when selected', async () => {
    const onSelect = vi.fn();
    render(<SidebarNavItem item={item} active={false} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: /Companies/ }));
    expect(onSelect).toHaveBeenCalledWith('companies');
  });
});

describe('SidebarNav', () => {
  it('renders every item', () => {
    render(
      <SidebarNav items={items} activeId="companies" onSelect={() => {}} />,
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Companies')).toBeInTheDocument();
  });

  it('forwards selections by id', async () => {
    const onSelect = vi.fn();
    render(
      <SidebarNav items={items} activeId="companies" onSelect={onSelect} />,
    );
    await userEvent.click(screen.getByText('Dashboard'));
    expect(onSelect).toHaveBeenCalledWith('dashboard');
  });
});

describe('Sidebar', () => {
  it('renders brand and nav items', () => {
    render(
      <Sidebar
        brand={{ title: 'Outreach OS', subtitle: 'Enterprise Outreach' }}
        items={items}
        activeId="companies"
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText('Outreach OS')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /New Campaign/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Companies')).toBeInTheDocument();
  });
});
