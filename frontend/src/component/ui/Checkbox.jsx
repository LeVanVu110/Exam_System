"use client"

export function Checkbox({ id, checked, onCheckedChange, className = "", ...props }) {
  return (
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${className}`}
      {...props}
    />
  )
}

export default Checkbox
