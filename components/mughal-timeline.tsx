"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"

// --- NEW ICONS (Heroicons) ---
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path
      fillRule="evenodd"
      d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.648c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653z"
      clipRule="evenodd"
    />
  </svg>
)
const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path
      fillRule="evenodd"
      d="M6.75 5.25a.75.75 0 01.75.75v12a.75.75 0 01-1.5 0v-12a.75.75 0 01.75-.75zM15.75 5.25a.75.75 0 01.75.75v12a.75.75 0 01-1.5 0v-12a.75.75 0 01.75-.75z"
      clipRule="evenodd"
    />
  </svg>
)
const RewindIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path
      fillRule="evenodd"
      d="M9.53 2.47a.75.75 0 010 1.06L4.81 8.25H15a6.75 6.75 0 010 13.5h-3a.75.75 0 010-1.5h3a5.25 5.25 0 100-10.5H4.81l4.72 4.72a.75.75 0 11-1.06 1.06l-6-6a.75.75 0 010-1.06l6-6a.75.75 0 011.06 0z"
      clipRule="evenodd"
    />
  </svg>
)
const FastForwardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path
      fillRule="evenodd"
      d="M14.47 2.47a.75.75 0 011.06 0l6 6a.75.75 0 010 1.06l-6 6a.75.75 0 11-1.06-1.06L19.19 12.75H9a5.25 5.25 0 100 10.5h3a.75.75 0 010 1.5H9a6.75 6.75 0 010-13.5h10.19l-4.72-4.72a.75.75 0 010-1.06z"
      clipRule="evenodd"
    />
  </svg>
)
const VolumeUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
    <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
  </svg>
)
const VolumeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.94 12l-2.22 2.22a.75.75 0 101.06 1.06L20 13.06l2.22 2.22a.75.75 0 10-1.06-1.06L21.06 12l-2.22-2.22z" />
  </svg>
)

// --- DETAILED HISTORICAL DATA WITH MAP TEXT ---
const mughalEvents = [
  {
    year: 1526,
    title: "Foundation of Empire",
    description:
      "At the First Battle of Panipat, Babur's small, disciplined army faced the Sultan of Delhi Ibrahim Lodi's force. Babur's revolutionary use of field artillery and flanking tactics proved decisive, shattering the Lodi dynasty and laying the foundation for 300 years of Mughal rule.",
    category: "Military",
    keyFigures: ["Babur", "Ibrahim Lodi"],
    imageUrl: "/images/1526_battle_of_panipat.jpg",
    animation: {
      type: "battle",
      center: [29.39, 76.96],
      zoom: 7,
      latlng: [29.39, 76.96],
      mapTexts: [
        { text: "Babur's Army", position: [29.6, 76.8] },
        { text: "Lodi's Army", position: [29.2, 77.1] },
      ],
      empireBounds: [
        [34.5, 69.2],
        [31.5, 74.3],
        [28.6, 77.2],
        [27.1, 78.0],
        [26.9, 80.9],
        [30.0, 76.0],
        [34.5, 69.2],
      ],
    },
  },
  {
    year: 1540,
    title: "Mughal Exile",
    description:
      "Humayun, Babur's successor, was decisively defeated by the Afghan leader Sher Shah Suri. The Mughal army was routed, and Humayun was forced to flee to Persia. This 15-year exile was a period of great hardship but also learning, as he absorbed Persian culture and military techniques.",
    category: "Political",
    keyFigures: ["Humayun", "Sher Shah Suri"],
    imageUrl: "/images/1540_humayun_exile.jpg",
    animation: {
      type: "political",
      center: [27.05, 79.91],
      zoom: 6,
      latlng: [27.05, 79.91],
      mapTexts: [{ text: "Battle of Kannauj", position: [27.05, 79.91] }],
      empireBounds: [
        [28.6, 77.2],
        [27.1, 78.0],
        [25.4, 81.8],
        [26.9, 80.9],
        [28.6, 77.2],
      ],
    },
  },
  {
    year: 1556,
    title: "Akbar's Ascension",
    description:
      "Following Humayun's death, the 13-year-old Akbar, guided by his regent Bairam Khan, secured his throne at the Second Battle of Panipat. This marked the true beginning of the Mughal Empire's consolidation and expansion.",
    category: "Military",
    keyFigures: ["Akbar", "Bairam Khan", "Hemu"],
    imageUrl: "/images/1556_akbar_ascension.jpg",
    animation: {
      type: "battle",
      center: [29.39, 76.96],
      zoom: 5,
      latlng: [29.39, 76.96],
      mapTexts: [{ text: "Panipat II", position: [29.39, 76.96] }],
      empireBounds: [
        [35.0, 65.0],
        [34.5, 69.2],
        [31.5, 74.3],
        [28.6, 77.2],
        [27.1, 78.0],
        [25.2, 83.0],
        [22.3, 72.9],
        [23.5, 68.5],
        [28.0, 67.0],
        [35.0, 65.0],
      ],
    },
  },
  {
    year: 1572,
    title: "Conquest of Gujarat",
    description:
      "Akbar's conquest of the wealthy Gujarat Sultanate was a strategic masterstroke. It gave the landlocked empire access to the sea, controlling the bustling ports of Surat and Cambay and opening up lucrative global trade routes.",
    category: "Economic",
    keyFigures: ["Akbar", "Muzaffar Shah III"],
    imageUrl: "/images/1572_gujarat_trade.jpg",
    animation: {
      type: "economic",
      center: [22.3, 71.5],
      zoom: 6,
      latlng: [21.17, 72.83],
      mapTexts: [{ text: "Port of Surat", position: [21.17, 72.83] }],
      empireBounds: [
        [35.0, 65.0],
        [34.5, 69.2],
        [31.5, 74.3],
        [28.6, 77.2],
        [27.1, 78.0],
        [25.2, 83.0],
        [21.0, 85.0],
        [20.0, 75.0],
        [21.5, 70.0],
        [23.5, 68.5],
        [28.0, 67.0],
        [35.0, 65.0],
      ],
    },
  },
  {
    year: 1582,
    title: "Din-i Ilahi Proclaimed",
    description:
      "At his new capital, Fatehpur Sikri, Akbar promoted a syncretic creed called Din-i Ilahi (The Religion of God). It combined elements of many religions and, while never gaining a mass following, it symbolized Akbar's vision of a unified, tolerant empire.",
    category: "Religious",
    keyFigures: ["Akbar", "Abu'l-Fazl"],
    imageUrl: "/images/1582_din_ilahi.jpg",
    animation: {
      type: "political",
      center: [27.09, 77.66],
      zoom: 6,
      latlng: [27.09, 77.66],
      mapTexts: [{ text: "Fatehpur Sikri", position: [27.09, 77.66] }],
      empireBounds: [
        [35.0, 65.0],
        [34.5, 69.2],
        [31.5, 74.3],
        [28.6, 77.2],
        [27.1, 78.0],
        [25.2, 83.0],
        [21.0, 85.0],
        [20.0, 75.0],
        [21.5, 70.0],
        [23.5, 68.5],
        [28.0, 67.0],
        [35.0, 65.0],
      ],
    },
  },
  {
    year: 1615,
    title: "East India Company Arrives",
    description:
      "Sir Thomas Roe, an ambassador for King James I of England, arrived at the court of Emperor Jahangir. He secured a royal decree granting the British East India Company rights to build factories in Surat. This seemingly minor agreement was the crucial first step towards British colonial rule.",
    category: "Political",
    keyFigures: ["Jahangir", "Thomas Roe"],
    imageUrl: "/images/1615_east_india_company.jpg",
    animation: {
      type: "political",
      center: [27.17, 78.04],
      zoom: 5,
      latlng: [27.17, 78.04],
      mapTexts: [{ text: "Mughal Court at Agra", position: [27.17, 78.04] }],
      empireBounds: [
        [35.0, 65.0],
        [34.5, 69.2],
        [31.5, 74.3],
        [28.6, 77.2],
        [27.1, 78.0],
        [25.2, 83.0],
        [21.0, 85.0],
        [18.0, 78.0],
        [20.0, 73.0],
        [23.5, 68.5],
        [28.0, 67.0],
        [35.0, 65.0],
      ],
    },
  },
  {
    year: 1632,
    title: "Taj Mahal Construction",
    description:
      "Heartbroken by the death of his wife, Mumtaz Mahal, Emperor Shah Jahan commissioned the Taj Mahal. Over 20,000 artisans worked for two decades to build this mausoleum of white marble, which remains the jewel of Mughal architecture and a symbol of eternal love.",
    category: "Cultural",
    keyFigures: ["Shah Jahan", "Mumtaz Mahal"],
    imageUrl: "/images/1632_taj_mahal.jpg",
    animation: {
      type: "build",
      center: [27.17, 78.04],
      zoom: 7,
      latlng: [27.17, 78.04],
      mapTexts: [{ text: "Taj Mahal", position: [27.17, 78.04] }],
      empireBounds: [
        [35.0, 65.0],
        [34.5, 69.2],
        [31.5, 74.3],
        [28.6, 77.2],
        [27.1, 78.0],
        [25.2, 83.0],
        [21.0, 85.0],
        [15.0, 77.0],
        [18.0, 73.0],
        [23.5, 68.5],
        [28.0, 67.0],
        [35.0, 65.0],
      ],
    },
  },
  {
    year: 1674,
    title: "Maratha Coronation",
    description:
      "Shivaji, a brilliant Maratha chieftain, carved out a kingdom through guerrilla warfare. His formal coronation as Chhatrapati (Sovereign) at Raigad Fort was a direct challenge to Aurangzeb's authority, establishing the Maratha Empire as a legitimate Hindu power.",
    category: "Political",
    keyFigures: ["Aurangzeb", "Shivaji"],
    imageUrl: "/images/1674_shivaji_coronation.jpg",
    animation: {
      type: "coronation",
      center: [18.23, 73.44],
      zoom: 6,
      latlng: [18.23, 73.44],
      mapTexts: [{ text: "Maratha Capital at Raigad", position: [18.23, 73.44] }],
      empireBounds: [
        [35.0, 65.0],
        [34.5, 69.2],
        [31.5, 74.3],
        [28.6, 77.2],
        [25.2, 87.0],
        [20.0, 84.0],
        [14.0, 78.0],
        [16.0, 73.0],
        [23.5, 68.5],
        [28.0, 67.0],
        [35.0, 65.0],
      ],
    },
  },
  {
    year: 1686,
    title: "Conquest of Deccan",
    description:
      "Emperor Aurangzeb spent the last 26 years of his reign in the Deccan, obsessed with crushing the Marathas and conquering the sultanates of Bijapur and Golconda. While he expanded the empire to its greatest extent, the endless wars drained the treasury and sparked rebellions elsewhere.",
    category: "Military",
    keyFigures: ["Aurangzeb", "Sambhaji"],
    imageUrl: "/images/1686_aurangzeb_deccan.jpg",
    animation: {
      type: "battle",
      center: [17.38, 78.4],
      zoom: 5,
      latlng: [17.38, 78.4],
      mapTexts: [{ text: "Siege of Golconda", position: [17.38, 78.4] }],
      empireBounds: [
        [35.0, 65.0],
        [34.5, 69.2],
        [31.5, 74.3],
        [28.6, 77.2],
        [25.2, 88.0],
        [20.0, 84.0],
        [10.0, 78.0],
        [15.0, 73.0],
        [23.5, 68.5],
        [28.0, 67.0],
        [35.0, 65.0],
      ],
    },
  },
  {
    year: 1739,
    title: "Nader Shah's Invasion",
    description:
      "The Persian emperor Nader Shah invaded India, annihilated the Mughal army, and sacked Delhi. He left the city in ruins, carrying away immense treasures, including the Peacock Throne and Koh-i-Noor diamond. This event shattered Mughal prestige and accelerated its decline.",
    category: "Military",
    keyFigures: ["Muhammad Shah", "Nader Shah"],
    imageUrl: "/images/1739_nader_shah.jpg",
    animation: {
      type: "battle",
      center: [28.6, 77.2],
      zoom: 5,
      latlng: [28.6, 77.2],
      mapTexts: [{ text: "Sack of Delhi", position: [28.6, 77.2] }],
      empireBounds: [
        [35.0, 65.0],
        [31.5, 74.3],
        [28.6, 77.2],
        [25.2, 88.0],
        [22.0, 80.0],
        [24.0, 73.0],
        [35.0, 65.0],
      ],
    },
  },
  {
    year: 1857,
    title: "The Last Emperor",
    description:
      "During the Indian Rebellion, sepoys proclaimed the elderly Bahadur Shah Zafar as their leader. After the British crushed the rebellion, Zafar was tried for treason and exiled to Burma. His sons were executed, and the British Crown assumed direct control of India, formally ending the Mughal dynasty.",
    category: "Political",
    keyFigures: ["Bahadur Shah Zafar", "Queen Victoria"],
    imageUrl: "/images/1857_zafar_trial.jpg",
    animation: {
      type: "coronation",
      center: [28.6, 77.2],
      zoom: 6,
      latlng: [28.6, 77.2],
      mapTexts: [{ text: "End of an Empire", position: [28.6, 77.2] }],
      empireBounds: [
        [28.7, 77.1],
        [28.5, 77.3],
        [28.4, 77.2],
        [28.6, 77.0],
        [28.7, 77.1],
      ],
    },
  },
]

// Dynamically import the map component
const InteractiveMap = dynamic(() => import("./interactive-map").then((mod) => mod.InteractiveMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-800 animate-pulse flex items-center justify-center text-white">
      Loading Map...
    </div>
  ),
})

// --- Main Timeline Component ---
export function MughalEmpireTimeline() {
  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const { speak, cancel, isSpeaking } = useSpeechSynthesis()
  const wasSpeakingRef = useRef(false)

  const currentEvent = useMemo(() => mughalEvents[currentEventIndex], [currentEventIndex])
  const prevEvent = useMemo(() => 
    currentEventIndex > 0 ? mughalEvents[currentEventIndex - 1] : null, 
    [currentEventIndex]
  )

  // --- SPEECH-DRIVEN AUTO-PLAY ---
  useEffect(() => {
    if (isAutoPlay) {
      const narrationText = `${currentEvent.title}. ${currentEvent.description}`
      speak(narrationText, isMuted)
    } else {
      cancel()
    }
    return () => cancel()
  }, [currentEvent, isAutoPlay, isMuted, speak, cancel])

  useEffect(() => {
    if (wasSpeakingRef.current && !isSpeaking && isAutoPlay) {
      const nextEventTimer = setTimeout(() => {
        setCurrentEventIndex((prevIndex) => {
          if (prevIndex === mughalEvents.length - 1) {
            setIsAutoPlay(false)
            return prevIndex
          }
          return prevIndex + 1
        })
      }, 1500)
      return () => clearTimeout(nextEventTimer)
    }
    wasSpeakingRef.current = isSpeaking
  }, [isSpeaking, isAutoPlay])

  const handleSliderChange = (value: number[]) => {
    cancel()
    setCurrentEventIndex(value[0])
  }

  const handleAutoPlayToggle = (checked: boolean) => {
    setIsAutoPlay(checked)
    if (checked) {
      setIsMuted(false)
    }
  }

  return (
    <div className="w-full max-w-7xl h-[90vh] flex flex-col lg:flex-row gap-4 bg-black rounded-xl shadow-2xl shadow-yellow-500/10 p-4 border border-gray-800">
      <div className="flex-grow lg:w-2/3 h-1/2 lg:h-full rounded-lg relative overflow-hidden border border-gray-800">
        <InteractiveMap event={currentEvent} isSpeaking={isSpeaking && !isMuted} />
      </div>
      <div className="flex flex-col lg:w-1/3 h-1/2 lg:h-full">
        <div className="flex-grow mb-4 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentEvent.year}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="h-full"
            >
              <Card className="bg-gray-900/50 border-gray-800 text-white h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-2xl font-bold text-yellow-400 tracking-wider">
                      {currentEvent.year}
                    </CardDescription>
                    <Badge variant="outline" className="border-yellow-400/50 text-yellow-400">
                      {currentEvent.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-serif pt-2">{currentEvent.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-4 overflow-y-auto p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <img
                      src={currentEvent.imageUrl || "/placeholder.svg"}
                      alt={currentEvent.title}
                      className="w-full h-auto object-cover rounded-lg mb-4 border border-gray-700"
                    />
                  </motion.div>
                  <p className="text-gray-300 leading-relaxed">{currentEvent.description}</p>
                  <div>
                    <h4 className="font-semibold text-gray-400 mb-2">Key Figures</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentEvent.keyFigures.map((figure) => (
                        <Badge key={figure} variant="secondary" className="bg-gray-700 text-gray-200">
                          {figure}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex flex-col items-center gap-4">
          <Slider
            min={0}
            max={mughalEvents.length - 1}
            step={1}
            value={[currentEventIndex]}
            onValueChange={handleSliderChange}
          />
          <div className="flex items-center justify-center gap-2 rounded-full bg-black/30 border border-gray-700 p-1.5 backdrop-blur-sm">
            <Button
              onClick={() => setCurrentEventIndex((p) => (p - 1 + mughalEvents.length) % mughalEvents.length)}
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-white/10"
            >
              <RewindIcon />
            </Button>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => handleAutoPlayToggle(!isAutoPlay)}
                variant="ghost"
                size="icon"
                className="rounded-full w-12 h-12 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
              >
                {isAutoPlay ? <PauseIcon /> : <PlayIcon />}
              </Button>
            </div>
            <Button
              onClick={() => setCurrentEventIndex((p) => (p + 1) % mughalEvents.length)}
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-white/10"
            >
              <FastForwardIcon />
            </Button>
            <div className="w-px h-6 bg-gray-600 mx-1"></div>
            <Button
              onClick={() => setIsMuted(!isMuted)}
              variant="ghost"
              size="icon"
              className="rounded-full relative hover:bg-white/10"
            >
              {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
              {isSpeaking && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-800"></span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
