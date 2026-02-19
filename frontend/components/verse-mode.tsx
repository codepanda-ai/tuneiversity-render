"use client"

import { useState } from "react"
import { Mic, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface VerseLine {
  characters: string
  pinyin: string
  translation: string
}

interface VerseModeProps {
  lines: VerseLine[]
  onExit: () => void
  onComplete: (scores: { clarity: number; fluency: number }) => void
}

export function VerseMode({ lines, onExit, onComplete }: VerseModeProps) {
  const [verseState, setVerseState] = useState<
    "idle" | "recording" | "processing"
  >("idle")

  function handleRecord() {
    if (verseState === "idle") {
      setVerseState("recording")
      setTimeout(() => {
        setVerseState("processing")
        setTimeout(() => {
          const clarity = Math.floor(Math.random() * 25) + 70
          const fluency = Math.floor(Math.random() * 25) + 68
          onComplete({ clarity, fluency })
        }, 2000)
      }, 3500)
    } else if (verseState === "recording") {
      setVerseState("processing")
      setTimeout(() => {
        const clarity = Math.floor(Math.random() * 25) + 70
        const fluency = Math.floor(Math.random() * 25) + 68
        onComplete({ clarity, fluency })
      }, 2000)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-background max-w-lg mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-base font-semibold text-foreground">
          Full Verse Practice
        </h2>
        <Button variant="ghost" size="sm" onClick={onExit} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Exit
        </Button>
      </header>

      {/* Verse Lines */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="rounded-xl border border-border bg-card p-4">
          {lines.map((line, i) => (
            <div
              key={i}
              className={cn(
                "py-4",
                i < lines.length - 1 && "border-b border-border"
              )}
            >
              <p className="text-xl font-bold font-chinese text-foreground">
                {line.characters}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {line.pinyin}
              </p>
              <p className="text-sm text-muted-foreground/70 mt-0.5 italic">
                {`"${line.translation}"`}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-3 px-6 py-6 border-t border-border bg-background">
        {verseState === "processing" ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Analyzing full verse...</span>
          </div>
        ) : (
          <>
            {verseState === "recording" && (
              <p className="text-sm font-medium text-primary">
                Recording verse...
              </p>
            )}
            <button
              onClick={handleRecord}
              aria-label={
                verseState === "recording"
                  ? "Stop recording verse"
                  : "Record full verse"
              }
              className={cn(
                "flex items-center justify-center rounded-full h-20 w-20 transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                verseState === "recording"
                  ? "bg-destructive/90 text-destructive-foreground animate-mic-pulse"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <Mic className="h-8 w-8" />
            </button>
            <p className="text-xs text-muted-foreground">
              {verseState === "recording"
                ? "Tap to stop"
                : "Tap to record full verse"}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
