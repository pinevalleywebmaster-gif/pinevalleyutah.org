"use client";

import { usePathname } from "next/navigation";

export function HomeSubtitle() {
  const pathname = usePathname();

  if (pathname !== "/") return null;

  return <p>Community information and public resources</p>;
}

export function HomeAnnouncement({ children }) {
  const pathname = usePathname();

  if (pathname !== "/") return null;

  return children;
}
