"use client"

import { MenuIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

import { NavLinks, type NavItem } from "./nav-links"

export function MobileMenu({
  items,
  openLabel,
  closeLabel,
  title,
  children,
}: {
  items: NavItem[]
  openLabel: string
  closeLabel: string
  title: string
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={openLabel} className="md:hidden">
          <MenuIcon className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" closeLabel={closeLabel} className="w-[min(20rem,86vw)] gap-0 p-0">
        <div className="border-b px-5 py-4">
          <SheetTitle className="font-serif text-lg">{title}</SheetTitle>
        </div>
        <nav aria-label={title} className="px-5 py-3">
          <NavLinks items={items} className="flex flex-col" onNavigate={() => setOpen(false)} />
        </nav>
        <div className="mt-auto flex items-center gap-3 border-t px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
