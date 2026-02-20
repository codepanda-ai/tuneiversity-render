"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { RotateCcw, CheckCircle, AlertCircle, Share2 } from "lucide-react"

interface SongReportProps {
  songTitleZh: string
  artistZh: string
  overallScore: number
  onRestart: () => void
}

const SUGGESTED_SONGS = [
  { titleZh: "月亮代表我的心", titleEn: "The Moon Represents My Heart", artistZh: "邓丽君" },
  { titleZh: "告白气球", titleEn: "Love Confession", artistZh: "周杰伦" },
  { titleZh: "晴天", titleEn: "Sunny Day", artistZh: "周杰伦" },
]

function getLetterGrade(score: number): string {
  if (score >= 93) return "A+"
  if (score >= 90) return "A"
  if (score >= 87) return "A-"
  if (score >= 83) return "B+"
  if (score >= 80) return "B"
  if (score >= 77) return "B-"
  if (score >= 73) return "C+"
  if (score >= 70) return "C"
  if (score >= 67) return "C-"
  if (score >= 60) return "D"
  return "F"
}

function getGradeColor(score: number): string {
  if (score >= 83) return "text-primary"
  if (score >= 70) return "text-chart-5"
  return "text-destructive"
}

function getFeedback(score: number): { positives: string[]; improvements: string[] } {
  if (score >= 85) {
    return {
      positives: ["Strong tone accuracy throughout", "Clear pronunciation on most syllables"],
      improvements: ["Refine rising tones (Tone 2)", "Work on syllable-final consonants"],
    }
  }
  return {
    positives: ["Good effort and persistence", "Some syllables pronounced correctly"],
    improvements: [
      "Start with slower practice songs",
      "Review fundamental tone rules",
      "Practice individual syllables before full lines",
      "Listen to native pronunciation more frequently",
    ],
  }
}

export function SongReport({ songTitleZh, artistZh, overallScore, onRestart }: SongReportProps) {
  const grade = getLetterGrade(overallScore)
  const gradeColor = getGradeColor(overallScore)
  const { positives, improvements } = getFeedback(overallScore)

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background max-w-lg mx-auto overflow-y-auto">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 text-center shrink-0">
        <h1 className="text-2xl font-bold text-foreground">Song Complete!</h1>
        <p className="text-sm text-muted-foreground mt-1 font-chinese">
          {songTitleZh} · {artistZh}
        </p>
      </header>

      <div className="px-4 pb-8 flex flex-col gap-4">
        {/* Score Card */}
        <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-6 text-center">
          <p className={cn("text-6xl font-bold", gradeColor)}>{grade}</p>
          <p className="text-sm text-muted-foreground mt-2">Overall Score</p>
          <p className="text-3xl font-bold text-foreground mt-1">
            {overallScore}
            <span className="text-lg font-normal text-muted-foreground">/100</span>
          </p>
        </div>

        {/* What You Did Well */}
        <div className="rounded-2xl bg-green-50 border border-green-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            <h2 className="font-bold text-green-800">What You Did Well</h2>
          </div>
          <ul className="flex flex-col gap-2">
            {positives.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Areas to Improve */}
        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <h2 className="font-bold text-amber-800">Areas to Improve</h2>
          </div>
          <ul className="flex flex-col gap-2">
            {improvements.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Try These Songs Next */}
        <div>
          <h2 className="font-bold text-foreground mb-3">Try These Songs Next</h2>
          <div className="flex flex-col gap-2">
            {SUGGESTED_SONGS.map((song) => (
              <div
                key={song.titleZh}
                className="rounded-xl border border-border bg-background px-4 py-3"
              >
                <p className="font-bold text-foreground font-chinese">{song.titleZh}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {song.titleEn} · {song.artistZh}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Practice Again */}
        <Button onClick={onRestart} className="w-full gap-2" size="lg">
          <RotateCcw className="h-4 w-4" />
          Practice This Song Again
        </Button>

        {/* Share */}
        <div>
          <div className="h-px bg-border mb-4" />
          <div className="flex items-center justify-center gap-1.5 mb-4">
            <Share2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Share Your Score</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() => {}}
              className="flex flex-col items-center gap-1.5 rounded-2xl p-3 text-white text-xs font-medium"
              style={{ background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)" }}
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              Instagram
            </button>
            <button
              onClick={() => {}}
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-black p-3 text-white text-xs font-medium"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X
            </button>
            <button
              onClick={() => {}}
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-red-500 p-3 text-white text-xs font-medium"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
              </svg>
              Rednote
            </button>
            <button
              onClick={() => {}}
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-black p-3 text-white text-xs font-medium"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.78a4.85 4.85 0 01-1.02-.09z" />
              </svg>
              TikTok
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
