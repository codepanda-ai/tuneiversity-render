"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { SongReport } from "@/components/song-report"

interface SongMeta {
  title_zh: string
  title_en: string
  artist_zh: string
  artist_en: string
}

interface ReportData {
  song_id: number
  session_id: string
  overall_score: number
  positives: string[]
  improvements: string[]
  suggested_songs: {
    id: number
    title_zh: string
    title_en: string
    artist_zh: string
  }[]
}

function ReportPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get("session") ?? ""
  const songId = Number(searchParams.get("song") ?? "1")

  const [song, setSong] = useState<SongMeta | null>(null)
  const [report, setReport] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [songRes, reportRes] = await Promise.all([
          fetch(`/api/songs/${songId}`),
          fetch(`/api/songs/${songId}/report?session=${sessionId}`),
        ])
        if (!songRes.ok || !reportRes.ok) throw new Error("Failed to load report")
        const [songData, reportData] = await Promise.all([songRes.json(), reportRes.json()])
        setSong(songData)
        setReport(reportData)
      } catch {
        setError("Could not load your report. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [songId, sessionId])

  if (isLoading) {
    return (
      <main className="min-h-dvh flex flex-col bg-background max-w-lg mx-auto shadow-sm items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading your report…</p>
      </main>
    )
  }

  if (error || !song || !report) {
    return (
      <main className="min-h-dvh flex flex-col bg-background max-w-lg mx-auto shadow-sm items-center justify-center">
        <p className="text-destructive text-sm">{error ?? "No report found."}</p>
      </main>
    )
  }

  return (
    <SongReport
      songTitleZh={song.title_zh}
      songTitleEn={song.title_en}
      artistZh={song.artist_zh}
      artistEn={song.artist_en}
      overallScore={report.overall_score}
      positives={report.positives}
      improvements={report.improvements}
      suggestedSongs={report.suggested_songs.map((s) => ({
        id: s.id,
        titleZh: s.title_zh,
        titleEn: s.title_en,
        artistZh: s.artist_zh,
      }))}
      onRestart={() => router.push(`/?song=${songId}`)}
    />
  )
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh flex flex-col bg-background max-w-lg mx-auto shadow-sm items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your report…</p>
        </main>
      }
    >
      <ReportPageInner />
    </Suspense>
  )
}
