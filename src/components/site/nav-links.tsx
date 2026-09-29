"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export interface NavItem {
  href: string
  label: string
}

/** Header links with the current page marked. */
export function NavLinks({ items, className, onNavigate }: { items: NavItem[]; className?: string; onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <ul className={className}>
      {items.map((item) => {
        const current = pathname === item.href || pathname?.startsWith(`${item.href}/`)
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={current ? "page" : undefined}
              className={cn(
                "inline-flex h-10 items-center text-sm font-medium underline-offset-[6px] transition-colors hover:text-foreground",
                current ? "text-foreground underline decoration-primary decoration-2" : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
