"use client"

import { useState, useEffect, useCallback } from "react"

export function useSpeechSynthesis() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    const handleVoicesChanged = () => {
      setVoices(window.speechSynthesis.getVoices())
    }
    window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged)
    handleVoicesChanged() // Initial load
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged)
    }
  }, [])

  const speak = useCallback(
    (text: string, isMuted: boolean) => {
      if (!("speechSynthesis" in window) || isMuted) {
        return
      }

      window.speechSynthesis.cancel() // Stop any previous speech

      const utterance = new SpeechSynthesisUtterance(text)

      // Find a British female voice
      const britishFemaleVoice = voices.find(
        (voice) => voice.lang === "en-GB" && voice.name.toLowerCase().includes("female"),
      )

      // Fallback voices
      const usFemaleVoice = voices.find(
        (voice) => voice.lang === "en-US" && voice.name.toLowerCase().includes("female"),
      )

      const anyBritishVoice = voices.find((voice) => voice.lang === "en-GB")

      utterance.voice = britishFemaleVoice || usFemaleVoice || anyBritishVoice || voices[0]
      utterance.lang = utterance.voice?.lang || "en-GB"
      utterance.rate = 0.9
      utterance.pitch = 1

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    },
    [voices],
  )

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  return { speak, cancel, isSpeaking }
}
