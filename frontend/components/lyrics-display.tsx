"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface Syllable {
  character: string
  pinyin: string
  correct?: boolean
}

interface LyricsDisplayProps {
  syllables: Syllable[]
  translation: string
  showFeedback: boolean
}

const toneColorMap: Record<string, string> = {
  "1": "text-primary",
  "2": "text-chart-5",
  "3": "text-chart-3",
  "4": "text-destructive/70",
  "0": "text-muted-foreground",
}

function getTone(pinyin: string): string {
  if (/[āēīōūǖ]/.test(pinyin)) return "1"
  if (/[áéíóúǘ]/.test(pinyin)) return "2"
  if (/[ǎěǐǒǔǚ]/.test(pinyin)) return "3"
  if (/[àèìòùǜ]/.test(pinyin)) return "4"
  return "0"
}

export function LyricsDisplay({
  syllables,
  translation,
  showFeedback,
}: LyricsDisplayProps) {
  const [showTranslation, setShowTranslation] = useState(false)

  return (
    <section className="flex-1 flex flex-col items-center justify-center px-6 py-8">
      {/* Chinese Characters */}
      <div className="flex flex-wrap justify-center gap-0.5">
        {syllables.map((s, i) => (
          <span
            key={i}
            className={cn(
              "text-4xl md:text-5xl font-bold font-chinese transition-colors duration-300",
              showFeedback && s.correct === false
                ? "text-destructive bg-destructive/10 rounded-md px-1"
                : "text-foreground"
            )}
          >
            {s.character}
          </span>
        ))}
      </div>

      {/* Pinyin */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {syllables.map((s, i) => (
          <span
            key={i}
            className={cn(
              "text-base md:text-lg font-medium transition-colors",
              toneColorMap[getTone(s.pinyin)]
            )}
          >
            {s.pinyin}
          </span>
        ))}
      </div>

      {/* Translation */}
      <div className="mt-5 flex flex-col items-center gap-2">
        {showTranslation && (
          <p className="text-sm text-muted-foreground italic text-center">
            {`"${translation}"`}
          </p>
        )}
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-label={showTranslation ? "Hide translation" : "Show translation"}
        >
          {showTranslation ? (
            <EyeOff className="h-3 w-3" />
          ) : (
            <Eye className="h-3 w-3" />
          )}
          <span>{showTranslation ? "Hide" : "Show"} translation</span>
        </button>
      </div>
    </section>
  )
}
