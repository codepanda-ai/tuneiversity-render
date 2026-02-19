"use client"

import { useState, useCallback } from "react"
import { PracticeHeader } from "@/components/practice-header"
import { LyricsDisplay } from "@/components/lyrics-display"
import { AudioControls, type RecordingState } from "@/components/audio-controls"
import { FeedbackSection } from "@/components/feedback-section"
import { Button } from "@/components/ui/button"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"

const SONG_DATA = {
  title: "小幸运",
  artist: "田馥甄 (Hebe Tien)",
  lines: [
    {
      syllables: [
        { character: "你", pinyin: "nǐ" },
        { character: "还", pinyin: "hái" },
        { character: "要", pinyin: "yào" },
        { character: "我", pinyin: "wǒ" },
        { character: "怎", pinyin: "zěn" },
        { character: "样", pinyin: "yàng" },
      ],
      translation: "What more do you want from me?",
    },
    {
      syllables: [
        { character: "要", pinyin: "yào" },
        { character: "怎", pinyin: "zěn" },
        { character: "样", pinyin: "yàng" },
        { character: "你", pinyin: "nǐ" },
        { character: "才", pinyin: "cái" },
        { character: "会", pinyin: "huì" },
        { character: "快", pinyin: "kuài" },
        { character: "乐", pinyin: "lè" },
      ],
      translation: "What will it take for you to be happy?",
    },
    {
      syllables: [
        { character: "我", pinyin: "wǒ" },
        { character: "听", pinyin: "tīng" },
        { character: "见", pinyin: "jiàn" },
        { character: "雨", pinyin: "yǔ" },
        { character: "滴", pinyin: "dī" },
        { character: "落", pinyin: "luò" },
        { character: "在", pinyin: "zài" },
        { character: "青", pinyin: "qīng" },
        { character: "青", pinyin: "qīng" },
        { character: "草", pinyin: "cǎo" },
        { character: "地", pinyin: "dì" },
      ],
      translation: "I heard the rain falling on the green grass",
    },
    {
      syllables: [
        { character: "我", pinyin: "wǒ" },
        { character: "听", pinyin: "tīng" },
        { character: "见", pinyin: "jiàn" },
        { character: "远", pinyin: "yuǎn" },
        { character: "方", pinyin: "fāng" },
        { character: "下", pinyin: "xià" },
        { character: "课", pinyin: "kè" },
        { character: "钟", pinyin: "zhōng" },
        { character: "声", pinyin: "shēng" },
        { character: "响", pinyin: "xiǎng" },
      ],
      translation: "I heard the distant school bell ringing",
    },
    {
      syllables: [
        { character: "与", pinyin: "yǔ" },
        { character: "你", pinyin: "nǐ" },
        { character: "相", pinyin: "xiāng" },
        { character: "遇", pinyin: "yù" },
        { character: "好", pinyin: "hǎo" },
        { character: "幸", pinyin: "xìng" },
        { character: "运", pinyin: "yùn" },
      ],
      translation: "Meeting you was such good fortune",
    },
    {
      syllables: [
        { character: "可", pinyin: "kě" },
        { character: "以", pinyin: "yǐ" },
        { character: "同", pinyin: "tóng" },
        { character: "行", pinyin: "xíng" },
        { character: "好", pinyin: "hǎo" },
        { character: "幸", pinyin: "xìng" },
        { character: "运", pinyin: "yùn" },
      ],
      translation: "Being able to walk together, what good fortune",
    },
    {
      syllables: [
        { character: "我", pinyin: "wǒ" },
        { character: "想", pinyin: "xiǎng" },
        { character: "和", pinyin: "hé" },
        { character: "你", pinyin: "nǐ" },
        { character: "走", pinyin: "zǒu" },
        { character: "到", pinyin: "dào" },
        { character: "最", pinyin: "zuì" },
        { character: "后", pinyin: "hòu" },
      ],
      translation: "I want to walk with you until the end",
    },
    {
      syllables: [
        { character: "因", pinyin: "yīn" },
        { character: "为", pinyin: "wèi" },
        { character: "你", pinyin: "nǐ" },
        { character: "是", pinyin: "shì" },
        { character: "我", pinyin: "wǒ" },
        { character: "的", pinyin: "de" },
        { character: "小", pinyin: "xiǎo" },
        { character: "幸", pinyin: "xìng" },
        { character: "运", pinyin: "yùn" },
      ],
      translation: "Because you are my little lucky charm",
    },
    {
      syllables: [
        { character: "我", pinyin: "wǒ" },
        { character: "听", pinyin: "tīng" },
        { character: "见", pinyin: "jiàn" },
        { character: "风", pinyin: "fēng" },
        { character: "来", pinyin: "lái" },
        { character: "自", pinyin: "zì" },
        { character: "地", pinyin: "dì" },
        { character: "铁", pinyin: "tiě" },
        { character: "和", pinyin: "hé" },
        { character: "人", pinyin: "rén" },
        { character: "海", pinyin: "hǎi" },
      ],
      translation: "I heard the wind from the subway and the crowds",
    },
    {
      syllables: [
        { character: "我", pinyin: "wǒ" },
        { character: "排", pinyin: "pái" },
        { character: "着", pinyin: "zhe" },
        { character: "队", pinyin: "duì" },
        { character: "拿", pinyin: "ná" },
        { character: "着", pinyin: "zhe" },
        { character: "爱", pinyin: "ài" },
        { character: "的", pinyin: "de" },
        { character: "号", pinyin: "hào" },
        { character: "码", pinyin: "mǎ" },
        { character: "牌", pinyin: "pái" },
      ],
      translation: "I stand in line holding love's number ticket",
    },
    {
      syllables: [
        { character: "终", pinyin: "zhōng" },
        { character: "于", pinyin: "yú" },
        { character: "等", pinyin: "děng" },
        { character: "到", pinyin: "dào" },
        { character: "你", pinyin: "nǐ" },
      ],
      translation: "Finally waited for you",
    },
    {
      syllables: [
        { character: "那", pinyin: "nà" },
        { character: "一", pinyin: "yī" },
        { character: "天", pinyin: "tiān" },
        { character: "裙", pinyin: "qún" },
        { character: "摆", pinyin: "bǎi" },
        { character: "摇", pinyin: "yáo" },
        { character: "曳", pinyin: "yè" },
      ],
      translation: "That day, skirts swaying",
    },
    {
      syllables: [
        { character: "你", pinyin: "nǐ" },
        { character: "轻", pinyin: "qīng" },
        { character: "声", pinyin: "shēng" },
        { character: "说", pinyin: "shuō" },
        { character: "我", pinyin: "wǒ" },
        { character: "好", pinyin: "hǎo" },
        { character: "看", pinyin: "kàn" },
      ],
      translation: "You softly said I look good",
    },
    {
      syllables: [
        { character: "风", pinyin: "fēng" },
        { character: "吹", pinyin: "chuī" },
        { character: "花", pinyin: "huā" },
        { character: "落", pinyin: "luò" },
        { character: "泪", pinyin: "lèi" },
        { character: "如", pinyin: "rú" },
        { character: "雨", pinyin: "yǔ" },
        { character: "下", pinyin: "xià" },
      ],
      translation: "Wind blows, flowers fall, tears like rain",
    },
    {
      syllables: [
        { character: "幸", pinyin: "xìng" },
        { character: "好", pinyin: "hǎo" },
        { character: "有", pinyin: "yǒu" },
        { character: "你", pinyin: "nǐ" },
        { character: "一", pinyin: "yī" },
        { character: "路", pinyin: "lù" },
        { character: "陪", pinyin: "péi" },
        { character: "伴", pinyin: "bàn" },
      ],
      translation: "Luckily you've been by my side all along",
    },
    {
      syllables: [
        { character: "好", pinyin: "hǎo" },
        { character: "想", pinyin: "xiǎng" },
        { character: "再", pinyin: "zài" },
        { character: "回", pinyin: "huí" },
        { character: "到", pinyin: "dào" },
        { character: "那", pinyin: "nà" },
        { character: "一", pinyin: "yī" },
        { character: "天", pinyin: "tiān" },
      ],
      translation: "I really want to go back to that day",
    },
    {
      syllables: [
        { character: "爱", pinyin: "ài" },
        { character: "上", pinyin: "shàng" },
        { character: "你", pinyin: "nǐ" },
        { character: "不", pinyin: "bù" },
        { character: "是", pinyin: "shì" },
        { character: "我", pinyin: "wǒ" },
        { character: "的", pinyin: "de" },
        { character: "错", pinyin: "cuò" },
      ],
      translation: "Falling in love with you wasn't my fault",
    },
    {
      syllables: [
        { character: "你", pinyin: "nǐ" },
        { character: "是", pinyin: "shì" },
        { character: "我", pinyin: "wǒ" },
        { character: "最", pinyin: "zuì" },
        { character: "想", pinyin: "xiǎng" },
        { character: "留", pinyin: "liú" },
        { character: "住", pinyin: "zhù" },
        { character: "的", pinyin: "de" },
        { character: "幸", pinyin: "xìng" },
        { character: "运", pinyin: "yùn" },
      ],
      translation: "You are the luck I most want to hold onto",
    },
  ],
}

export default function PracticePage() {
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [recordingState, setRecordingState] = useState<RecordingState>("idle")
  const [feedback, setFeedback] = useState<{
    score: number
    syllableCorrectness: boolean[]
  } | null>(null)

  const currentLine = SONG_DATA.lines[currentLineIndex]

  const syllablesWithFeedback = currentLine.syllables.map((s, i) => ({
    ...s,
    correct: feedback ? feedback.syllableCorrectness[i] : undefined,
  }))

  const { startRecording, stopAndSubmit, error, clearError } = useAudioRecorder(
    (score) => {
      const correctness = Array.from(
        { length: currentLine.syllables.length },
        () => Math.random() > (score < 70 ? 0.5 : 0.25)
      )
      setFeedback({ score, syllableCorrectness: correctness })
    },
    (state) => setRecordingState(state)
  )

  const handleRecord = useCallback(() => {
    if (recordingState === "idle") {
      setFeedback(null)
      clearError()
      startRecording()
    } else if (recordingState === "recording") {
      stopAndSubmit(currentLine.syllables.length)
    }
  }, [recordingState, currentLine.syllables.length, startRecording, stopAndSubmit, clearError])

  const handleTryAgain = useCallback(() => {
    setFeedback(null)
  }, [])

  const handleNextLine = useCallback(() => {
    setFeedback(null)
    setCurrentLineIndex((prev) =>
      prev < SONG_DATA.lines.length - 1 ? prev + 1 : 0
    )
  }, [])

  const handlePlayNative = useCallback(() => {
    // Placeholder for native pronunciation playback
  }, [])

  return (
    <main className="min-h-dvh flex flex-col bg-background max-w-lg mx-auto shadow-sm">
      <PracticeHeader
        songTitle={SONG_DATA.title}
        artist={SONG_DATA.artist}
        currentLine={currentLineIndex + 1}
        totalLines={SONG_DATA.lines.length}
      />

      <div className="h-px bg-border mx-4" aria-hidden="true" />

      <LyricsDisplay
        syllables={syllablesWithFeedback}
        translation={currentLine.translation}
        showFeedback={feedback !== null}
      />

      {!feedback && (
        <AudioControls
          state={recordingState}
          onRecord={handleRecord}
          onPlayNative={handlePlayNative}
        />
      )}

      {feedback && (
        <FeedbackSection
          score={feedback.score}
          onTryAgain={handleTryAgain}
          onNextLine={handleNextLine}
        />
      )}

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
        >
          Practice Full Verse
        </Button>
      </div>
    </main>
  )
}
