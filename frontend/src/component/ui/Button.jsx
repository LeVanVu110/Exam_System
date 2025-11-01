// src/component/ui/button.jsx
export default function Button({ children, variant = "default", ...props }) {
  const baseStyle =
    "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 border"

  const variants = {
    default:
      "bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:border-blue-600",
    outline:
      "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400",
    danger:
      "bg-red-50 text-red-600 border-red-300 hover:bg-red-100 hover:border-red-400",
  }

  return (
    <button
      {...props}
      className={`${baseStyle} ${variants[variant] || variants.default}`}
    >
      {children}
    </button>
  )
}
