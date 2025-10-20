// src/component/ui/input.jsx
export default function Input({ label, ...props }) {
  return (
    <input
      {...props}
      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  )
}
