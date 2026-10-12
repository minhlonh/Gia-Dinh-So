export function getRemainingUsage(): number {
  if (typeof window === "undefined") return 5;
  const used = parseInt(localStorage.getItem("gia_dinh_so_usage") || "0", 10);
  return Math.max(0, 5 - used);
}

export function incrementUsage(): number {
  if (typeof window === "undefined") return 5;
  const currentUsed = parseInt(localStorage.getItem("gia_dinh_so_usage") || "0", 10);
  const newUsed = currentUsed + 1;
  localStorage.setItem("gia_dinh_so_usage", newUsed.toString());
  
  // Báo cho HeaderBar cập nhật lại số lượt hiển thị ngay lập tức
  window.dispatchEvent(new Event("usage-updated"));
  
  return Math.max(0, 5 - newUsed);
}