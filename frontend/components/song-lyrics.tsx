"use client"

import { useEffect, useState } from "react"
import { X, Loader2 } from "lucide-react"
import { cachedFetch } from "@/lib/api-cache"

interface Verse {
  verse_order: number
  lyrics_zh: string
  lyrics_pinyin: string
  lyrics_en: string | null
}

interface SongLyricsProps {
  songId: number
  onClose: () => void
}

export function SongLyrics({ songId, onClose }: SongLyricsProps) {
  const [verses, setVerses] = useState<Verse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await cachedFetch(`/api/songs/${songId}/lyrics`)
        if (!res.ok) throw new Error("Failed to load lyrics")
        setVerses(await res.json())
      } catch {
        setFetchError("Failed to load lyrics.")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [songId])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-muted/40 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-background border-b border-border shrink-0">
        <h2 className="text-base font-bold text-foreground">Full Song Lyrics</h2>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close lyrics"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading && (
          <div className="flex flex-col items-center mt-8">
            <p className="text-muted-foreground text-sm">Loading...</p>
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mt-3" />
          </div>
        )}
        {fetchError && (
          <p className="text-destructive text-sm text-center mt-8">{fetchError}</p>
        )}
        {!isLoading && !fetchError && (
          <div className="bg-background rounded-xl overflow-hidden shadow-sm">
            {verses.map((verse, index) => (
              <div key={verse.verse_order}>
                <div className="px-5 py-5">
                  <p className="text-2xl font-bold font-chinese text-foreground leading-snug">
                    {verse.lyrics_zh}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    {verse.lyrics_pinyin}
                  </p>
                  {verse.lyrics_en && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {verse.lyrics_en}
                    </p>
                  )}
                </div>
                {index < verses.length - 1 && (
                  <div className="h-px bg-border mx-5" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
