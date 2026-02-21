"use client"

import { useState, useCallback, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { PracticeHeader } from "@/components/practice-header"
import { LyricsDisplay } from "@/components/lyrics-display"
import { AudioControls, type RecordingState } from "@/components/audio-controls"
import { FeedbackSection } from "@/components/feedback-section"
import { Button } from "@/components/ui/button"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { SongLyrics } from "@/components/song-lyrics"
import { SongReport } from "@/components/song-report"
import { cachedFetch } from "@/lib/api-cache"
import { Loader2 } from "lucide-react"

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

function PracticePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const songId = Number(searchParams.get("song") ?? "1")
  const verseOrder = Number(searchParams.get("verse") ?? "1")
  const testParam = searchParams.get("test")

  const [songMeta, setSongMeta] = useState<SongMeta | null>(null)
  const [verse, setVerse] = useState<VerseData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [recordingState, setRecordingState] = useState<RecordingState>("idle")
  const [feedback, setFeedback] = useState<{ score: number } | null>(null)
  const [showLyrics, setShowLyrics] = useState(false)
  const [verseScores, setVerseScores] = useState<number[]>([])
  const [showReport, setShowReport] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    setFetchError(null)
    setFeedback(null)

    async function load() {
      try {
        const [songRes, verseRes] = await Promise.all([
          cachedFetch(`/api/songs/${songId}`),
          cachedFetch(`/api/songs/${songId}/verses/${verseOrder}`),
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

  // Reset verse scores when the song changes
  useEffect(() => {
    setVerseScores([])
    setShowReport(false)
  }, [songId])

  const { startRecording, stopAndSubmit, error, clearError } = useAudioRecorder(
    (score) => {
      setFeedback({ score })
      setVerseScores((prev) => [...prev, score])
    },
    (state) => setRecordingState(state),
    testParam,
    verse?.lyricsZh ?? "",
    verse?.lyricsPinyin ?? "",
  )

  const handleRecord = useCallback(() => {
    if (!verse) return
    if (recordingState === "idle") {
      setFeedback(null)
      clearError()
      startRecording()
    } else if (recordingState === "recording") {
      stopAndSubmit()
    }
  }, [recordingState, verse, startRecording, stopAndSubmit, clearError])

  const handleTryAgain = useCallback(() => {
    setFeedback(null)
  }, [])

  const handlePreviousVerse = useCallback(() => {
    if (!songMeta) return
    const prevVerse = verseOrder > 1 ? verseOrder - 1 : songMeta.num_verses
    const testSuffix = testParam !== null ? `&test=${testParam}` : ""
    router.push(`/?song=${songId}&verse=${prevVerse}${testSuffix}`)
  }, [router, songId, verseOrder, songMeta, testParam])

  const handleNextVerse = useCallback(() => {
    if (!songMeta) return
    const nextVerse = verseOrder < songMeta.num_verses ? verseOrder + 1 : 1
    const testSuffix = testParam !== null ? `&test=${testParam}` : ""
    router.push(`/?song=${songId}&verse=${nextVerse}${testSuffix}`)
  }, [router, songId, verseOrder, songMeta, testParam])

  const handlePlayNative = useCallback(() => {
    // Placeholder for native pronunciation playback
  }, [])

  const isLastVerse = !!songMeta && verseOrder === songMeta.num_verses
  const overallScore =
    verseScores.length > 0
      ? Math.round(verseScores.reduce((sum, s) => sum + s, 0) / verseScores.length)
      : 0

  const handleViewReport = useCallback(() => {
    setShowReport(true)
  }, [])

  const handleRestartSong = useCallback(() => {
    setShowReport(false)
    setVerseScores([])
    setFeedback(null)
    const testSuffix = testParam !== null ? `&test=${testParam}` : ""
    router.push(`/?song=${songId}&verse=1${testSuffix}`)
  }, [router, songId, testParam])

  if (isLoading) {
    return (
      <main className="min-h-dvh flex flex-col bg-background max-w-lg mx-auto shadow-sm items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mt-3" />
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
    <main className="min-h-dvh flex flex-col bg-background max-w-lg mx-auto shadow-sm relative">
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
          onPrevious={handlePreviousVerse}
          onNext={handleNextVerse}
        />
      )}

      {feedback && (
        <FeedbackSection
          score={feedback.score}
          onTryAgain={handleTryAgain}
          onNextVerse={handleNextVerse}
          isLastVerse={isLastVerse}
          onViewReport={handleViewReport}
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
          onClick={() => setShowLyrics(true)}
        >
          Full Song Lyrics
        </Button>
      </div>

      {showLyrics && (
        <SongLyrics songId={songId} onClose={() => setShowLyrics(false)} />
      )}

      {showReport && songMeta && (
        <SongReport
          songTitleZh={songMeta.title_zh}
          artistZh={songMeta.artist_zh}
          overallScore={overallScore}
          onRestart={handleRestartSong}
        />
      )}
    </main>
  )
}

export default function PracticePage() {
  return (
    <Suspense>
      <PracticePageInner />
    </Suspense>
  )
}
