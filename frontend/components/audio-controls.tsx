"use client"

import { Mic, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type RecordingState = "idle" | "recording" | "processing"

interface AudioControlsProps {
  state: RecordingState
  onRecord: () => void
  onPlayNative: () => void
}

const waveformBars = [
  { height: 16, animation: "animate-waveform-1" },
  { height: 24, animation: "animate-waveform-2" },
  { height: 32, animation: "animate-waveform-3" },
  { height: 28, animation: "animate-waveform-4" },
  { height: 20, animation: "animate-waveform-5" },
] as const

function WaveformAnimation() {
  return (
    <div className="flex items-center justify-center gap-1.5 h-10" role="img" aria-label="Recording waveform">
      {waveformBars.map((bar, i) => (
        <div
          key={i}
          className={cn(
            "w-1.5 rounded-full bg-indigo-600 origin-center",
            bar.animation
          )}
          style={{ height: `${bar.height}px` }}
        />
      ))}
    </div>
  )
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  )
}

export function AudioControls({
  state,
  onRecord,
  onPlayNative,
}: AudioControlsProps) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 pb-4">
      {/* Play Native Pronunciation */}
      <Button
        variant="outline"
        size="sm"
        onClick={onPlayNative}
        disabled={state !== "idle"}
        className="gap-2 text-muted-foreground"
      >
        <PlayIcon className="h-3.5 w-3.5" />
        Play Native Pronunciation
      </Button>

      {/* Processing Status */}
      {state === "processing" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Analyzing your pronunciation...</span>
        </div>
      )}

      {/* Waveform — above mic during recording */}
      {state === "recording" && <WaveformAnimation />}

      {/* Mic Button */}
      <div className="relative flex items-center justify-center">
        {/* Soft pink halo ring behind mic when recording */}
        {state === "recording" && (
          <div className="absolute h-24 w-24 rounded-full bg-destructive/15 animate-recording-ring" />
        )}
        <button
          onClick={onRecord}
          disabled={state === "processing"}
          aria-label={state === "recording" ? "Stop recording" : "Start recording"}
          className={cn(
            "relative z-10 flex items-center justify-center rounded-full transition-all duration-200",
            "h-20 w-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            state === "recording"
              ? "bg-destructive text-destructive-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
            state === "processing" && "opacity-50 cursor-not-allowed"
          )}
        >
          {state === "processing" ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </button>
      </div>

      {/* Label — below mic button */}
      {state === "idle" && (
        <p className="text-sm text-muted-foreground">Tap to Record</p>
      )}
      {state === "recording" && (
        <p className="text-sm font-medium text-muted-foreground">Recording...</p>
      )}
    </div>
  )
}
