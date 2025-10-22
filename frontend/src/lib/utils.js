// utils.js
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("vi-VN");
}

export function formatTime(time) {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
