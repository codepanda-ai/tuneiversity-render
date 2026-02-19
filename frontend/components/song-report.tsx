"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { RotateCcw, Sparkles } from "lucide-react"

interface LineScore {
  characters: string
  score: number
}

interface SongReportProps {
  songTitle: string
  artist: string
  overallScore: number
  clarityScore: number
  fluencyScore: number
  toneAccuracy: number
  lineScores: LineScore[]
  recommendations: string[]
  onRestart: () => void
}

function getScoreColor(score: number) {
  if (score >= 85) return "text-primary"
  if (score >= 70) return "text-chart-5"
  return "text-destructive"
}

function getScoreBg(score: number) {
  if (score >= 85) return "bg-primary/10"
  if (score >= 70) return "bg-chart-5/10"
  return "bg-destructive/10"
}

function getOverallMessage(score: number) {
  if (score >= 90) return "Outstanding performance! Your Mandarin pronunciation is very clear and natural."
  if (score >= 80) return "Great work! You have strong pronunciation with a few areas to polish."
  if (score >= 70) return "Good progress! Keep practicing the highlighted areas for improvement."
  return "Keep going! Consistent practice will help you improve quickly."
}

export function SongReport({
  songTitle,
  artist,
  overallScore,
  clarityScore,
  fluencyScore,
  toneAccuracy,
  lineScores,
  recommendations,
  onRestart,
}: SongReportProps) {
  return (
    <div className="min-h-dvh flex flex-col bg-background max-w-lg mx-auto">
      {/* Header */}
      <header className="px-6 pt-6 pb-4 text-center">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-accent rounded-full px-3 py-1 mb-3">
          <Sparkles className="h-3 w-3" />
          AI Feedback Report
        </div>
        <h1 className="text-xl font-bold text-foreground font-chinese">
          {songTitle}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">{artist}</p>
      </header>

      {/* Overall Score */}
      <div className="mx-6 rounded-2xl bg-card border border-border p-6 shadow-sm text-center">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          Overall Score
        </p>
        <p
          className={cn(
            "text-6xl font-bold tabular-nums",
            getScoreColor(overallScore)
          )}
        >
          {overallScore}
          <span className="text-lg font-normal text-muted-foreground">
            /100
          </span>
        </p>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          {getOverallMessage(overallScore)}
        </p>
      </div>

      {/* Breakdown Scores */}
      <div className="grid grid-cols-3 gap-3 mx-6 mt-4">
        {[
          { label: "Clarity", value: clarityScore },
          { label: "Fluency", value: fluencyScore },
          { label: "Tone Accuracy", value: toneAccuracy },
        ].map(({ label, value }) => (
          <div
            key={label}
            className={cn(
              "rounded-xl p-3 text-center",
              getScoreBg(value)
            )}
          >
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {value}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Line-by-Line Scores */}
      <div className="mx-6 mt-6">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Line Breakdown
        </h3>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {lineScores.map((line, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center justify-between px-4 py-3",
                i < lineScores.length - 1 && "border-b border-border"
              )}
            >
              <span className="text-sm font-chinese text-foreground truncate mr-4">
                {line.characters}
              </span>
              <span
                className={cn(
                  "text-sm font-semibold tabular-nums shrink-0",
                  getScoreColor(line.score)
                )}
              >
                {line.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="mx-6 mt-6">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Recommendations
        </h3>
        <div className="rounded-xl border border-border bg-card p-4">
          <ul className="flex flex-col gap-3">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3 text-sm text-foreground leading-relaxed">
                <span className="shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold mt-0.5">
                  {i + 1}
                </span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Restart Button */}
      <div className="px-6 py-8 mt-auto">
        <Button onClick={onRestart} className="w-full gap-2" size="lg">
          <RotateCcw className="h-4 w-4" />
          Practice Again
        </Button>
      </div>
    </div>
  )
}
