import { BookOpen, Flower2, Home, MessageCircleHeart, Sprout, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon?: LucideIcon;
}

export const TAB_ITEMS: NavItem[] = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/lessons", label: "Lessons", icon: BookOpen },
  { href: "/practice", label: "Practice", icon: Sprout },
  { href: "/leaderboard", label: "Leaderboard", icon: Flower2 },
  { href: "/ask-pansy", label: "Pansy", icon: MessageCircleHeart },
];

export const HEADER_ITEMS: NavItem[] = [
  { href: "/brokers", label: "Brokers" },
  { href: "/profile", label: "Profile" },
];

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
