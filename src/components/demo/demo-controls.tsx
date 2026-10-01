"use client"

import { ClockIcon, FlaskConicalIcon, RotateCcwIcon, UserRoundXIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { t } from "@/i18n/t"
import { advanceClock, simulateDeclaration } from "@/lib/demo/ops"
import { demoNow, resetDemo, setSettings, useDemo } from "@/lib/demo/store"
import { DAY } from "@/lib/demo/window"
import { formatDate } from "@/lib/format"

import { useCopy } from "./app-provider"

export function DemoControls() {
  const demo = useDemo()
  const { app, seed, locale, common } = useCopy()
  const c = app.controls
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  if (!demo) return null
  const now = demoNow()

  const declare = () => {
    const r = simulateDeclaration()
    if (r.ok) {
      setNote(null)
      setOpen(false)
      toast.warning(t(c.declared, { name: r.guardianName, will: r.willName }))
    } else if (r.reason === "cooldown") {
      setNote(t(c.declareBlocked, { date: formatDate(r.until, locale) }))
    } else {
      setNote(c.declareNone)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setNote(null)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" aria-label={c.button} className="max-sm:size-10 max-sm:px-0">
          <FlaskConicalIcon aria-hidden="true" />
          <span className="hidden sm:inline">{c.button}</span>
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={common.close} className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{c.title}</DialogTitle>
          <DialogDescription>{c.body}</DialogDescription>
        </DialogHeader>

        <section className="rounded-md border p-3">
          <h3 className="flex items-center gap-2 font-sans text-sm font-semibold">
            <ClockIcon className="size-4" aria-hidden="true" />
            {c.clock}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
            {t(c.clockNow, { date: formatDate(now, locale) })}
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => advanceClock(DAY)}>
              {c.plusDay}
            </Button>
            <Button size="sm" variant="outline" onClick={() => advanceClock(7 * DAY)}>
              {c.plusWeek}
            </Button>
          </div>
        </section>

        <div className="flex items-start justify-between gap-4">
          <div>
            <Label htmlFor="fail-next">{c.failNext}</Label>
            <p className="mt-0.5 text-xs text-muted-foreground">{c.failNextHint}</p>
          </div>
          <Switch id="fail-next" checked={demo.settings.failNext} onCheckedChange={(v) => setSettings({ failNext: v })} />
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Label htmlFor="slow">{c.slow}</Label>
            <p className="mt-0.5 text-xs text-muted-foreground">{c.slowHint}</p>
          </div>
          <Switch id="slow" checked={demo.settings.slow} onCheckedChange={(v) => setSettings({ slow: v })} />
        </div>

        <section className="rounded-md border p-3">
          <Button size="sm" variant="outline" onClick={declare}>
            <UserRoundXIcon aria-hidden="true" />
            {c.declare}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">{c.declareHint}</p>
          {note ? (
            <p role="status" className="mt-2 rounded-sm bg-brass-soft px-2 py-1.5 text-xs font-medium text-brass">
              {note}
            </p>
          ) : null}
        </section>

        <div className="flex items-center justify-between gap-4 border-t pt-4">
          <p className="text-xs text-muted-foreground">{c.resetHint}</p>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              resetDemo(seed)
              setOpen(false)
              toast(c.resetDone)
            }}
          >
            <RotateCcwIcon aria-hidden="true" />
            {c.reset}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
