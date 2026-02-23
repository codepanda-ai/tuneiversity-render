"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Music2, UserRound, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { cachedFetch } from "@/lib/api-cache"

interface Song {
  id: number
  title_en: string
  title_zh: string
  artist_en: string
  artist_zh: string
  difficulty: "beginner" | "intermediate" | "advanced"
  youtube_url: string
}

interface ApiSong {
  id: number
  title_en: string
  title_zh: string
  artist_en: string
  artist_zh: string
  difficulty: string | null
  num_verses: number
  youtube_url: string | null
}

const MOCK_SONGS: Song[] = [
  {
    id: 1,
    title_en: "Lucky (My Little Fortune)",
    title_zh: "小幸運",
    artist_en: "Hebe Tien",
    artist_zh: "田馥甄",
    difficulty: "beginner",
    youtube_url: "https://www.youtube.com/watch?v=IFTFr06O1pk",
  },
  {
    id: 2,
    title_en: "Confession Balloon",
    title_zh: "告白氣球",
    artist_en: "Jay Chou",
    artist_zh: "周杰倫",
    difficulty: "intermediate",
    youtube_url: "https://www.youtube.com/watch?v=bu7nU9Mhpyo",
  },
  {
    id: 3,
    title_en: "Ordinary Friends",
    title_zh: "普通朋友",
    artist_en: "David Tao",
    artist_zh: "陶喆",
    difficulty: "intermediate",
    youtube_url: "https://www.youtube.com/watch?v=a1aF0cPjpxs",
  },
  {
    id: 4,
    title_en: "Stranded",
    title_zh: "擱淺",
    artist_en: "Jay Chou",
    artist_zh: "周杰倫",
    difficulty: "advanced",
    youtube_url: "https://www.youtube.com/watch?v=PKIiBByqK4E",
  },
  {
    id: 5,
    title_en: "Little Love Song",
    title_zh: "小情歌",
    artist_en: "Sodagreen",
    artist_zh: "蘇打綠",
    difficulty: "beginner",
    youtube_url: "https://www.youtube.com/watch?v=7V08YTl9cjQ",
  },
]

const DIFFICULTY_STYLES = {
  beginner: "bg-green-50 text-green-700 border border-green-200",
  intermediate: "bg-amber-50 text-amber-700 border border-amber-200",
  advanced: "bg-red-50 text-red-700 border border-red-200",
}

const DIFFICULTY_LABELS = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
}

function getYouTubeThumbnail(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/)
  return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null
}

export default function HomePage() {
  const [apiSongs, setApiSongs] = useState<Song[]>([])

  useEffect(() => {
    async function fetchSongs() {
      try {
        const res = await cachedFetch("/api/songs")
        if (res.ok) {
          const data: ApiSong[] = await res.json()
          setApiSongs(
            data.map((s) => ({
              id: s.id,
              title_en: s.title_en,
              title_zh: s.title_zh,
              artist_en: s.artist_en,
              artist_zh: s.artist_zh,
              difficulty: (s.difficulty ?? "beginner") as Song["difficulty"],
              youtube_url: s.youtube_url ?? "",
            }))
          )
        }
      } catch {
        // silent — fall back to mock data only
      }
    }
    fetchSongs()
  }, [])

  const apiIds = new Set(apiSongs.map((s) => s.id))
  const songs = [...apiSongs, ...MOCK_SONGS.filter((s) => !apiIds.has(s.id))]

  return (
    <main className="min-h-dvh flex flex-col bg-background max-w-lg mx-auto shadow-sm">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
            <Music2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground leading-tight">Tuneiversity</h1>
            <p className="text-xs text-primary font-chinese leading-tight">多練歌</p>
          </div>
        </div>
        <button
          className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-muted/70 transition-colors"
          aria-label="User account"
        >
          <UserRound className="h-5 w-5 text-muted-foreground" />
        </button>
      </header>

      <div className="h-px bg-border mx-4" aria-hidden="true" />

      {/* Song list */}
      <div className="flex-1 px-4 py-4 space-y-3">
        <div className="px-1 mb-1">
          <h2 className="text-xl font-bold text-foreground">Choose a Song</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Select a song to practice your Mandarin pronunciation
          </p>
        </div>
        {songs.map((song) => {
          const thumbnail = getYouTubeThumbnail(song.youtube_url)
          return (
            <Link
              key={song.id}
              href={`/practice?song=${song.id}&verse=1`}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:bg-muted/60 transition-colors group"
            >
              {/* Thumbnail */}
              <div className="relative w-24 shrink-0 rounded-lg overflow-hidden bg-muted aspect-video">
                {thumbnail && (
                  <Image
                    src={thumbnail}
                    alt={`${song.title_en} thumbnail`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )}
              </div>

              {/* Song info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {song.title_en}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium px-1.5 py-0.5 rounded-full shrink-0",
                      DIFFICULTY_STYLES[song.difficulty]
                    )}
                  >
                    {DIFFICULTY_LABELS[song.difficulty]}
                  </span>
                </div>
                <p className="text-base font-bold font-chinese text-foreground leading-snug mt-0.5">
                  {song.title_zh}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {song.artist_en} · {song.artist_zh}
                </p>
              </div>

              {/* Chevron */}
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
            </Link>
          )
        })}
      </div>
    </main>
  )
}
