import type {
  ButtonProps,
  ButtonVariant,
  IconProps,
  InputBoxProps,
  SplitButtonProps,
  StatusPillProps,
} from './types';

const variantClass: Record<ButtonVariant, string> = {
  primary: 'outreachBtnPrimary',
  secondary: 'outreachBtnSecondary',
};

function iconSizeClass(size: number) {
  return `outreachIconSize${size}`;
}

/** Renders a Material Symbols Outlined glyph. `name` is the symbol id. */
export function Icon({ name, size = 20, fill = false }: IconProps) {
  const fillClass = fill ? 'outreachIconFill' : '';
  return (
    <span
      aria-hidden
      className={`outreachIcon ${iconSizeClass(size)} ${fillClass}`}
    >
      {name}
    </span>
  );
}

/** Themed action button with an optional leading icon. */
export function Button({
  variant,
  children,
  iconName,
  size = 'md',
  type = 'button',
  disabled = false,
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`outreachButton ${variantClass[variant]} outreachButton-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {iconName !== undefined ? <Icon name={iconName} size={18} /> : null}
      {children}
    </button>
  );
}

/** Color-themed status pill. `tone` selects the success/danger/neutral theme. */
export function StatusPill({ tone, children }: StatusPillProps) {
  return (
    <span className={`outreachStatusPill outreachStatusPill-${tone}`}>
      {children}
    </span>
  );
}

/** Reusable input styled for Outreach OS forms. */
export function InputBox({
  value,
  onChange,
  type = 'text',
  placeholder,
  className = '',
  min,
  max,
}: InputBoxProps) {
  return (
    <input
      type={type}
      className={`outreachInput ${className}`}
      placeholder={placeholder}
      min={min}
      max={max}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

/** Primary action paired with a dropdown-toggle segment. */
export function SplitButton({
  label,
  iconName,
  onClick,
  onToggleMenu,
}: SplitButtonProps) {
  return (
    <span className="outreachSplitButton">
      <button
        type="button"
        className="outreachSplitMain outreachBtnPrimary"
        onClick={onClick}
      >
        <Icon name={iconName} size={18} />
        {label}
      </button>
      <button
        type="button"
        className="outreachSplitToggle outreachBtnPrimary"
        aria-label="More import options"
        onClick={onToggleMenu}
      >
        <Icon name="arrow_drop_down" size={20} />
      </button>
    </span>
  );
}
