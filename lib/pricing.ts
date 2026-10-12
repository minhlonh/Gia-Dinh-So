export function getRemainingUsage(): number {
  if (typeof window === "undefined") return 5;
  const current = parseInt(localStorage.getItem("gia_dinh_so_usage") || "0", 10);
  return Math.max(0, 5 - current);
}

export function incrementUsage(): number {
  if (typeof window === "undefined") return 5;
  const current = parseInt(localStorage.getItem("gia_dinh_so_usage") || "0", 10);
  const next = current + 1;
  localStorage.setItem("gia_dinh_so_usage", next.toString());

  // Báo hiệu cho HeaderBar và PayWallModal cập nhật lại giao diện lập tức
  window.dispatchEvent(new Event("usage-updated"));

  return Math.max(0, 5 - next);
}
