"use client"

import { useState, useCallback, useEffect, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { PracticeHeader } from "@/components/practice-header"
import { LyricsDisplay } from "@/components/lyrics-display"
import { AudioControls, type RecordingState } from "@/components/audio-controls"
import { FeedbackSection } from "@/components/feedback-section"
import { Button } from "@/components/ui/button"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { SongLyrics } from "@/components/song-lyrics"
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

  const sessionParam = searchParams.get("session")
  const [sessionId, setSessionId] = useState<string>(
    () => sessionParam ?? crypto.randomUUID()
  )

  const [songMeta, setSongMeta] = useState<SongMeta | null>(null)
  const [verse, setVerse] = useState<VerseData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const voicesRef = useRef<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices()
    }
    loadVoices()
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices)
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices)
  }, [])

  const [recordingState, setRecordingState] = useState<RecordingState>("idle")
  const [feedback, setFeedback] = useState<{ score: number } | null>(null)
  const [showLyrics, setShowLyrics] = useState(false)
  const [verseScores, setVerseScores] = useState<number[]>([])
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

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
  }, [songId])

  // Inject session ID into URL if not already present
  useEffect(() => {
    if (!searchParams.get("session")) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("session", sessionId)
      router.replace(`/practice?${params.toString()}`)
    }
  }, [router, sessionId, searchParams])

  const { startRecording, stopAndSubmit, error, clearError } = useAudioRecorder(
    (score) => {
      setFeedback({ score })
      setVerseScores((prev) => [...prev, score])
    },
    (state) => setRecordingState(state),
    testParam,
    verse?.lyricsZh ?? "",
    verse?.lyricsPinyin ?? "",
    sessionId,
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
    const newSessionId = crypto.randomUUID()
    setSessionId(newSessionId)
    setFeedback(null)
    const params = new URLSearchParams(searchParams.toString())
    params.set("session", newSessionId)
    router.replace(`/practice?${params.toString()}`)
  }, [router, searchParams])

  const handlePreviousVerse = useCallback(() => {
    if (!songMeta) return
    const prevVerse = verseOrder > 1 ? verseOrder - 1 : songMeta.num_verses
    const testSuffix = testParam !== null ? `&test=${testParam}` : ""
    router.push(`/practice?song=${songId}&verse=${prevVerse}${testSuffix}&session=${sessionId}`)
  }, [router, songId, verseOrder, songMeta, testParam, sessionId])

  const handleNextVerse = useCallback(() => {
    if (!songMeta) return
    const nextVerse = verseOrder < songMeta.num_verses ? verseOrder + 1 : 1
    const testSuffix = testParam !== null ? `&test=${testParam}` : ""
    router.push(`/practice?song=${songId}&verse=${nextVerse}${testSuffix}&session=${sessionId}`)
  }, [router, songId, verseOrder, songMeta, testParam, sessionId])

  const handlePlayNative = useCallback(() => {
    if (!verse?.lyricsZh) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(verse.lyricsZh)
    utterance.lang = "zh-CN"
    utterance.rate = 0.5
    const chineseVoice = voicesRef.current.find((v) => v.name.includes("Meijia"))
    if (chineseVoice) utterance.voice = chineseVoice
    window.speechSynthesis.speak(utterance)
  }, [verse?.lyricsZh])

  const isLastVerse = !!songMeta && verseOrder === songMeta.num_verses

  const handleViewReport = useCallback(async () => {
    setIsGeneratingReport(true)
    try {
      await fetch(`/api/songs/${songId}/report?session=${sessionId}`, { method: "POST" })
      router.push(`/report?session=${sessionId}&song=${songId}`)
    } catch {
      setIsGeneratingReport(false)
    }
  }, [songId, sessionId, router])

  const handleRestartSong = useCallback(() => {
    setVerseScores([])
    setFeedback(null)
    const testSuffix = testParam !== null ? `&test=${testParam}` : ""
    router.push(`/practice?song=${songId}&verse=1${testSuffix}&session=${sessionId}`)
  }, [router, songId, testParam, sessionId])

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

      {isGeneratingReport ? (
        <div className="flex flex-col items-center gap-3 px-6 py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Generating your report…</p>
        </div>
      ) : feedback ? (
        <FeedbackSection
          score={feedback.score}
          onTryAgain={handleTryAgain}
          onNextVerse={handleNextVerse}
          isLastVerse={isLastVerse}
          onViewReport={handleViewReport}
        />
      ) : null}

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
        <Link href="/" className="block mt-2">
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            size="lg"
          >
            Home
          </Button>
        </Link>
      </div>

      {showLyrics && (
        <SongLyrics songId={songId} onClose={() => setShowLyrics(false)} />
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
