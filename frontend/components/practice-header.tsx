"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface PracticeHeaderProps {
  songTitleZh: string
  songTitleEn: string
  artistZh: string
  artistEn: string
  currentLine: number
  totalLines: number
  youtubeUrl: string | null
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

export function PracticeHeader({
  songTitleZh,
  songTitleEn,
  artistZh,
  artistEn,
  currentLine,
  totalLines,
  youtubeUrl,
}: PracticeHeaderProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const progress = (currentLine / totalLines) * 100
  const youtubeId = youtubeUrl ? getYouTubeId(youtubeUrl) : null

  return (
    <header className="px-4 pt-4 pb-3">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground font-chinese">
            {songTitleZh}{" "}
            <span className="text-sm font-normal text-muted-foreground">{songTitleEn}</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {artistZh}{" "}
            <span className="text-xs">{artistEn}</span>
          </p>
        </div>
        <span className="text-xs text-muted-foreground mt-1 shrink-0">
          Line {currentLine} of {totalLines}
        </span>
      </div>

      <Progress value={progress} className="mt-3 h-1.5" />

      {youtubeId && (
        <Collapsible open={isVideoOpen} onOpenChange={setIsVideoOpen}>
          <CollapsibleTrigger className="flex w-full items-center gap-3 mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <div className="relative h-10 w-16 shrink-0 rounded-md overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                alt="Song video thumbnail"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="font-medium text-foreground">Watch full song</span>
            <div className="ml-auto">
              {isVideoOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="aspect-video w-full rounded-lg overflow-hidden border border-border">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title={`${songTitleZh} ${songTitleEn}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </header>
  )
}
