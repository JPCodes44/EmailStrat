import { Icon } from './Common';
import type {
  SidebarBrandProps,
  SidebarNavItemProps,
  SidebarNavProps,
  SidebarProps,
} from './types';

/** Product logo, name, and tagline at the top of the sidebar. */
export function SidebarBrand({ title, subtitle }: SidebarBrandProps) {
  return (
    <div className="outreachSidebarBrand">
      <span className="outreachBrandMark">
        <Icon name="hub" size={18} fill />
      </span>
      <span className="outreachBrandText">
        <span className="outreachBrandTitle">{title}</span>
        <span className="outreachBrandSubtitle">{subtitle}</span>
      </span>
    </div>
  );
}

/** A single sidebar navigation entry. */
export function SidebarNavItem({
  item,
  active,
  onSelect,
}: SidebarNavItemProps) {
  return (
    <button
      type="button"
      className={`outreachNavItem ${active ? 'outreachNavItemActive' : ''}`}
      aria-current={active ? 'page' : undefined}
      onClick={() => onSelect(item.id)}
    >
      <Icon name={item.iconName} size={20} fill={active} />
      {item.label}
    </button>
  );
}

/** Vertical list of sidebar navigation items. */
export function SidebarNav({ items, activeId, onSelect }: SidebarNavProps) {
  return (
    <nav className="outreachSidebarNav" aria-label="Primary">
      {items.map((item) => (
        <SidebarNavItem
          key={item.id}
          item={item}
          active={item.id === activeId}
          onSelect={onSelect}
        />
      ))}
    </nav>
  );
}

/** Fixed desktop sidebar: brand and primary nav. */
export function Sidebar({ brand, items, activeId, onSelect }: SidebarProps) {
  return (
    <aside className="outreachSidebar">
      <div className="outreachSidebarHeader">
        <SidebarBrand title={brand.title} subtitle={brand.subtitle} />
      </div>
      <SidebarNav items={items} activeId={activeId} onSelect={onSelect} />
    </aside>
  );
}
