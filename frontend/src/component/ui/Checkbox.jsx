export function Checkbox({ id, checked, onCheckedChange, className = "", ...props }) {
  return (
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      className={`h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary ${className}`}
      {...props}
    />
  )
}
