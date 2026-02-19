"use client"

import { Button } from "@/components/ui/button"
import { RotateCcw, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeedbackSectionProps {
  score: number
  onTryAgain: () => void
  onNextLine: () => void
}

function getScoreColor(score: number) {
  if (score >= 85) return "text-foreground"
  if (score >= 70) return "text-chart-5"
  return "text-destructive"
}

function getScoreMessage(score: number) {
  if (score >= 85) return "Excellent clarity! Your pronunciation is very clear."
  if (score >= 70) return "Great clarity overall. A few syllables need refinement."
  return "We recommend another try before moving on."
}

export function FeedbackSection({
  score,
  onTryAgain,
  onNextLine,
}: FeedbackSectionProps) {
  const isLowScore = score < 70

  return (
    <div className="bg-muted/50 border-t border-border px-6 py-6">
      {/* Score */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Clarity Score
        </p>
        <p className={cn("text-6xl font-bold tabular-nums", getScoreColor(score))}>
          {score}
          <span className="text-xl font-normal text-muted-foreground">
            / 100
          </span>
        </p>
        <p className="text-sm text-muted-foreground mt-3">
          {getScoreMessage(score)}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <Button
          variant="outline"
          className="flex-1 gap-2 bg-background"
          onClick={onTryAgain}
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>
        <Button
          variant={isLowScore ? "outline" : "default"}
          className={cn("flex-1 gap-2", !isLowScore && "font-semibold")}
          onClick={onNextLine}
        >
          Next Line
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
