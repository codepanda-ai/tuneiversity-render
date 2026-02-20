"use client"

import { useState, useCallback, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { PracticeHeader } from "@/components/practice-header"
import { LyricsDisplay } from "@/components/lyrics-display"
import { AudioControls, type RecordingState } from "@/components/audio-controls"
import { FeedbackSection } from "@/components/feedback-section"
import { Button } from "@/components/ui/button"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"

interface VerseData {
  lyricsZh: string
  lyricsPinyin: string
  lyricsEn: string | null
}

interface SongMeta {
  title_zh: string
  title_en: string
  artist_zh: string
  artist_en: string
  num_verses: number
  youtube_url: string | null
}

export default function PracticePage() {
  const searchParams = useSearchParams()
  const songId = Number(searchParams.get("song") ?? "1")
  const verseOrder = Number(searchParams.get("verse") ?? "1")

  const [songMeta, setSongMeta] = useState<SongMeta | null>(null)
  const [verse, setVerse] = useState<VerseData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [recordingState, setRecordingState] = useState<RecordingState>("idle")
  const [feedback, setFeedback] = useState<{ score: number } | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setFetchError(null)
    setFeedback(null)

    async function load() {
      try {
        const [songRes, verseRes] = await Promise.all([
          fetch(`/api/songs/${songId}`),
          fetch(`/api/songs/${songId}/verses/${verseOrder}`),
        ])
        if (!songRes.ok || !verseRes.ok) throw new Error("Failed to load")
        const [song, verseData] = await Promise.all([songRes.json(), verseRes.json()])
        setSongMeta(song)
        setVerse({
          lyricsZh: verseData.lyrics_zh,
          lyricsPinyin: verseData.lyrics_pinyin,
          lyricsEn: verseData.lyrics_en,
        })
      } catch {
        setFetchError("Failed to load song data.")
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [songId, verseOrder])

  const { startRecording, stopAndSubmit, error, clearError } = useAudioRecorder(
    (score) => {
      setFeedback({ score })
    },
    (state) => setRecordingState(state)
  )

  const handleRecord = useCallback(() => {
    if (!verse) return
    if (recordingState === "idle") {
      setFeedback(null)
      clearError()
      startRecording()
    } else if (recordingState === "recording") {
      stopAndSubmit(1)
    }
  }, [recordingState, verse, startRecording, stopAndSubmit, clearError])

  const handleTryAgain = useCallback(() => {
    setFeedback(null)
  }, [])

  const handlePlayNative = useCallback(() => {
    // Placeholder for native pronunciation playback
  }, [])

  if (isLoading) {
    return (
      <main className="min-h-dvh flex flex-col bg-background max-w-lg mx-auto shadow-sm items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </main>
    )
  }

  if (fetchError || !songMeta || !verse) {
    return (
      <main className="min-h-dvh flex flex-col bg-background max-w-lg mx-auto shadow-sm items-center justify-center">
        <p className="text-destructive text-sm">{fetchError ?? "No data found."}</p>
      </main>
    )
  }

  return (
    <main className="min-h-dvh flex flex-col bg-background max-w-lg mx-auto shadow-sm">
      <PracticeHeader
        songTitleZh={songMeta.title_zh}
        songTitleEn={songMeta.title_en}
        artistZh={songMeta.artist_zh}
        artistEn={songMeta.artist_en}
        currentLine={verseOrder}
        totalLines={songMeta.num_verses}
        youtubeUrl={songMeta.youtube_url}
      />

      <div className="h-px bg-border mx-4" aria-hidden="true" />

      <LyricsDisplay
        lyricsZh={verse.lyricsZh}
        lyricsPinyin={verse.lyricsPinyin}
        translation={verse.lyricsEn}
        showFeedback={feedback !== null}
      />

      {!feedback && (
        <AudioControls
          state={recordingState}
          onRecord={handleRecord}
          onPlayNative={handlePlayNative}
        />
      )}

      {feedback && (
        <FeedbackSection
          score={feedback.score}
          onTryAgain={handleTryAgain}
          onNextLine={handleTryAgain}
        />
      )}

      {error && (
        <p className="text-sm text-destructive text-center px-6 pb-2">
          {error === "permission_denied"
            ? "Microphone access was denied. Please allow microphone access and try again."
            : error === "not_supported"
            ? "Audio recording is not supported in this browser."
            : "Something went wrong. Please try again."}
        </p>
      )}

      <div className="mt-auto px-4 pb-6">
        <div className="h-px bg-border mb-4" aria-hidden="true" />
        <Button
          variant="outline"
          className="w-full border-primary text-primary hover:bg-primary/5 font-medium"
          size="lg"
        >
          Practice Full Verse
        </Button>
      </div>
    </main>
  )
}
