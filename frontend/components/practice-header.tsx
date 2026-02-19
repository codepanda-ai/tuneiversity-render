"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface PracticeHeaderProps {
  songTitle: string
  artist: string
  currentLine: number
  totalLines: number
}

export function PracticeHeader({
  songTitle,
  artist,
  currentLine,
  totalLines,
}: PracticeHeaderProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const progress = (currentLine / totalLines) * 100

  return (
    <header className="px-4 pt-4 pb-3">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground font-chinese">
            {songTitle}
          </h1>
          <p className="text-sm text-muted-foreground">{artist}</p>
        </div>
        <span className="text-xs text-muted-foreground mt-1 shrink-0">
          Line {currentLine} of {totalLines}
        </span>
      </div>

      <Progress value={progress} className="mt-3 h-1.5" />

      <Collapsible open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <CollapsibleTrigger className="flex w-full items-center gap-3 mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <div className="relative h-10 w-16 shrink-0 rounded-md overflow-hidden bg-muted">
            <Image
              src="/images/song-thumbnail.jpg"
              alt="Song video thumbnail"
              fill
              className="object-cover"
              sizes="64px"
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
          <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">YouTube Player Placeholder</p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </header>
  )
}
