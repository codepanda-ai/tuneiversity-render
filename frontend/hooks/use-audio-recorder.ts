"use client"

import { useRef, useState, useCallback } from "react"
import type { RecordingState } from "@/components/audio-controls"

export type AudioRecorderError =
  | "permission_denied"
  | "not_supported"
  | "network_error"
  | "unknown"

export interface UseAudioRecorderReturn {
  startRecording: () => Promise<void>
  stopAndSubmit: () => Promise<void>
  error: AudioRecorderError | null
  clearError: () => void
}

export function useAudioRecorder(
  onScoreReceived: (score: number) => void,
  onStateChange: (state: RecordingState) => void
): UseAudioRecorderReturn {
  const [error, setError] = useState<AudioRecorderError | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const mimeTypeRef = useRef<string>("")

  const clearError = useCallback(() => setError(null), [])

  const startRecording = useCallback(async () => {
    // SSR / old browser guard
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setError("not_supported")
      return
    }

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (err) {
      if (
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "SecurityError")
      ) {
        setError("permission_denied")
      } else {
        setError("unknown")
      }
      return
    }

    // Pick the best supported MIME type
    const mimeType = ["audio/webm", "audio/ogg", ""].find(
      (type) => type === "" || MediaRecorder.isTypeSupported(type)
    ) as string

    streamRef.current = stream
    mimeTypeRef.current = mimeType
    chunksRef.current = []

    const mediaRecorder = new MediaRecorder(
      stream,
      mimeType ? { mimeType } : undefined
    )

    mediaRecorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data)
      }
    }

    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start()
    onStateChange("recording")
  }, [onStateChange])

  const stopAndSubmit = useCallback(
    async () => {
      const mediaRecorder = mediaRecorderRef.current
      if (!mediaRecorder) return

      onStateChange("processing")

      await new Promise<void>((resolve) => {
        mediaRecorder.onstop = async () => {
          // Release the microphone
          streamRef.current?.getTracks().forEach((t) => t.stop())

          try {
            const blob = new Blob(chunksRef.current, {
              type: mimeTypeRef.current || "audio/webm",
            })

            const formData = new FormData()
            formData.append("audio", blob, "recording.webm")

            const response = await fetch("/api/score", {
              method: "POST",
              body: formData,
            })

            if (!response.ok) {
              throw new Error(`Server error: ${response.statusText}`)
            }

            const data = (await response.json()) as { score: number }
            onScoreReceived(data.score)
          } catch {
            setError("network_error")
          } finally {
            onStateChange("idle")
            // Clean up refs
            mediaRecorderRef.current = null
            streamRef.current = null
            chunksRef.current = []
          }

          resolve()
        }

        mediaRecorder.stop()
      })
    },
    [onScoreReceived, onStateChange]
  )

  return { startRecording, stopAndSubmit, error, clearError }
}
