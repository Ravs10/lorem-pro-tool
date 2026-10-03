"use client";
import { usePathname } from "next/navigation";
import NotificationBanner from "./NotificationBanner";

export default function GlobalBannerWrapper() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  const slug = pathname.split("/").filter(Boolean)[0] || "all";
  return (
    <div className="max-w-6xl mx-auto px-4">
      <NotificationBanner toolSlug={slug} />
    </div>
  );
}
