"use client"

import React from "react"
import { MapContainer, TileLayer, useMap, Polygon } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { motion } from "framer-motion"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Text, Box, Sphere, Cone, Cylinder, Plane } from "@react-three/drei"
import { type FC, useEffect, useState, useRef, Suspense } from "react"

// --- BATTLE DATA CONFIGURATION ---
const BATTLE_DATA = {
  1526: {
    name: "Battle of Panipat",
    type: "foundation", // Foundation of Mughal Empire
    center: [29.39, 76.96],
    zoom: 5,
    boundaries: [
      [28.8, 75.5], [29.8, 75.5], [29.8, 78.4], [28.8, 78.4]
    ],
    armies: [
      {
        id: "babur",
        name: "Babur's Timurid Forces",
        startPosition: [28.5, 75.0],
        battlePosition: [29.2, 76.7],
        color: "#10B981",
        size: 6,
        isVictorious: true
      },
      {
        id: "lodi", 
        name: "Ibrahim Lodi's Army",
        startPosition: [30.3, 78.9],
        battlePosition: [29.6, 77.2],
        color: "#DC2626",
        size: 8,
        isVictorious: false
      }
    ],
    foundation: {
      coronation: {
        position: [29.39, 76.96],
        emperor: "Babur",
        duration: 8000
      },
      fort: {
        position: [29.39, 76.96],
        type: "victory_fort",
        name: "Panipat Victory Fort"
      }
    }
  },
  1540: {
    name: "Humayun's Defeat and Exile",
    type: "defeatAndExile", // Special type for defeat → exile sequence
    center: [27.05, 79.91],
    zoom: 5,
    boundaries: [
      [26.0, 78.5], [28.1, 78.5], [28.1, 81.3], [26.0, 81.3]
    ],
    armies: [
      {
        id: "humayun",
        name: "Humayun's Forces",
        startPosition: [25.5, 77.5],
        battlePosition: [26.8, 79.6],
        color: "#10B981", 
        size: 5,
        isVictorious: false
      },
      {
        id: "sher",
        name: "Sher Shah Suri's Army",
        startPosition: [28.6, 82.3],
        battlePosition: [27.3, 80.2],
        color: "#F97316",
        size: 7,
        isVictorious: true
      }
    ],
    exileSequence: {
      defeatLocation: [27.05, 79.91], // Battle center where defeat happens
      exileRoute: [
        [27.05, 79.91], // Start from defeat location
        [30.0, 75.0],   // Through northern India
        [32.0, 66.0]    // To Persia
      ],
      emperorExile: {
        isActive: true,
        duration: 15000 // 15 second exile journey
      }
    }
  },
  1556: {
    name: "Second Battle of Panipat",
    type: "coronation", // Akbar's ascension to power
    center: [29.39, 76.96],
    zoom: 5,
    boundaries: [
      [28.8, 75.5], [29.8, 75.5], [29.8, 78.4], [28.8, 78.4]
    ],
    armies: [
      {
        id: "akbar",
        name: "Akbar's Mughal Army",
        startPosition: [28.2, 75.8],
        battlePosition: [29.1, 76.8],
        color: "#10B981",
        size: 8,
        isVictorious: true
      },
      {
        id: "hemu",
        name: "Hemu's Hindu Forces",
        startPosition: [30.5, 78.1],
        battlePosition: [29.7, 77.1],
        color: "#F97316",
        size: 10,
        isVictorious: false
      }
    ],
    coronation: {
      position: [29.39, 76.96],
      emperor: "Akbar the Great",
      duration: 12000,
      ceremony: {
        type: "imperial_coronation",
        symbols: ["crown", "scepter", "throne"]
      }
    },
    monument: {
      type: "fort",
      position: [29.39, 76.96],
      name: "Akbar's Victory Fort"
    }
  },
  1572: {
    name: "Conquest of Gujarat",
    type: "conquest",
    center: [22.3, 71.5],
    zoom: 6,
    boundaries: [
      [21.0, 70.0], [24.0, 70.0], [24.0, 73.0], [21.0, 73.0]
    ],
    armies: [
      {
        id: "akbar_gujarat",
        name: "Akbar's Conquest Force",
        startPosition: [24.5, 70.5],
        battlePosition: [22.5, 71.3],
        color: "#10B981",
        size: 12,
        isVictorious: true
      },
      {
        id: "gujarat",
        name: "Gujarat Sultanate",
        startPosition: [21.8, 72.7],
        battlePosition: [22.1, 71.7],
        color: "#F59E0B",
        size: 6,
        isVictorious: false
      }
    ],
    conquest: {
      celebration: {
        position: [22.3, 71.5],
        duration: 8000,
        type: "victory_celebration"
      },
      tradeRoute: {
        route: [[22.3, 71.5], [21.17, 72.83]], // To Surat port
        port: {
          position: [21.17, 72.83],
          name: "Surat Port",
          development: true
        }
      }
    }
  },
  1582: {
    name: "Din-i Ilahi Proclamation",
    type: "religious",
    center: [27.09, 77.66],
    zoom: 7,
    boundaries: [
      [26.8, 77.3], [27.4, 77.3], [27.4, 78.0], [26.8, 78.0]
    ],
    religious: {
      ceremony: {
        position: [27.09, 77.66],
        type: "religious_proclamation",
        duration: 10000,
        symbols: ["divine_light", "spiritual_aura", "unity_banner"]
      },
      monument: {
        type: "palace",
        position: [27.09, 77.66],
        name: "Fatehpur Sikri"
      }
    }
  },
  1615: {
    name: "East India Company Arrival",
    type: "diplomatic",
    center: [27.17, 78.04],
    zoom: 6,
    boundaries: [
      [26.8, 77.7], [27.5, 77.7], [27.5, 78.4], [26.8, 78.4]
    ],
    diplomatic: {
      ceremony: {
        position: [27.17, 78.04],
        type: "diplomatic_meeting",
        duration: 12000,
        participants: ["Mughal Emperor", "British Ambassador"]
      },
      tradeRoute: {
        route: [
          [51.5, -0.1], // London
          [36.1, -5.3], // Gibraltar
          [30.0, 31.2], // Alexandria
          [12.8, 45.0], // Aden
          [21.17, 72.83], // Surat
          [27.17, 78.04]  // Agra
        ],
        ships: true
      },
      monument: {
        type: "court",
        position: [27.17, 78.04],
        name: "Mughal Court at Agra"
      }
    }
  },
  1632: {
    name: "Taj Mahal Construction",
    type: "monument",
    center: [27.17, 78.04],
    zoom: 8,
    boundaries: [
      [27.1, 77.9], [27.25, 77.9], [27.25, 78.2], [27.1, 78.2]
    ],
    construction: {
      phases: [
        { name: "Foundation", duration: 3000 },
        { name: "Walls", duration: 3000 },
        { name: "Dome", duration: 3000 },
        { name: "Completion", duration: 3000 }
      ],
      workers: {
        position: [27.17, 78.04],
        count: 12,
        activity: "building"
      },
      materials: {
        types: ["marble", "precious_stones", "gold"],
        transport: true
      }
    },
    monument: {
      type: "taj",
      position: [27.17, 78.04],
      name: "Taj Mahal"
    }
  },
  1674: {
    name: "Maratha Coronation",
    type: "independence",
    center: [18.23, 73.44],
    zoom: 7,
    boundaries: [
      [17.8, 73.0], [18.6, 73.0], [18.6, 73.9], [17.8, 73.9]
    ],
    independence: {
      ceremony: {
        position: [18.23, 73.44],
        type: "independence_declaration",
        duration: 15000,
        leader: "Shivaji Maharaj",
        elements: ["flag_raising", "coronation", "celebration"]
      },
      monument: {
        type: "fort",
        position: [18.23, 73.44],
        name: "Raigad Fort"
      }
    }
  },
  1686: {
    name: "Conquest of Deccan",
    type: "imperial_expansion",
    center: [17.38, 78.4],
    zoom: 5,
    boundaries: [
      [16.0, 77.0], [19.0, 77.0], [19.0, 80.0], [16.0, 80.0]
    ],
    armies: [
      {
        id: "aurangzeb",
        name: "Aurangzeb's Imperial Army",
        startPosition: [19.2, 77.5],
        battlePosition: [17.8, 78.2],
        color: "#10B981",
        size: 15,
        isVictorious: true
      },
      {
        id: "deccan_alliance",
        name: "Maratha-Deccan Alliance",
        startPosition: [16.5, 79.3],
        battlePosition: [17.0, 78.6],
        color: "#F97316",
        size: 12,
        isVictorious: false
      }
    ],
    expansion: {
      territory: {
        position: [17.38, 78.4],
        marking: true,
        duration: 8000
      },
      victory: {
        celebration: {
          position: [17.38, 78.4],
          type: "imperial_victory",
          duration: 6000
        }
      }
    }
  },
  1739: {
    name: "Nader Shah's Invasion",
    type: "invasion",
    center: [28.6, 77.2],
    zoom: 6,
    boundaries: [
      [28.2, 76.8], [29.0, 76.8], [29.0, 77.6], [28.2, 77.6]
    ],
    invasion: {
      sequence: {
        phases: [
          { name: "Invasion", duration: 4000 },
          { name: "Looting", duration: 6000 },
          { name: "Devastation", duration: 4000 }
        ]
      },
      loot: {
        position: [28.6, 77.2],
        types: ["peacock_throne", "kohinoor", "treasure"],
        transport: {
          route: [[28.6, 77.2], [32.0, 66.0]], // To Persia
          duration: 8000
        }
      },
      devastation: {
        position: [28.6, 77.2],
        intensity: 2.0,
        effects: ["destruction", "smoke", "ruins"]
      }
    }
  },
  1857: {
    name: "End of Mughal Empire",
    type: "empireEnd", // Special type for empire collapse
    center: [28.6, 77.2],
    zoom: 7,
    boundaries: [
      [28.3, 76.9], [28.9, 76.9], [28.9, 77.5], [28.3, 77.5]
    ],
    empireEnd: {
      court: [28.6, 77.2], // Red Fort Delhi - imperial court
      trialAndExile: {
        isActive: true,
        emperor: "Bahadur Shah Zafar",
        duration: 18000 // 18 second sequence
      }
    }
  }
}

// --- CLEAN 3D COMPONENTS ---

// Enhanced Army with proper spacing and clear formations
const Army3D: FC<{ 
  position: [number, number, number]
  color: string
  size: number
  name: string
  isDeployed: boolean
  isVictorious?: boolean
  onDeployComplete?: () => void
}> = ({ position, color, size, name, isDeployed, isVictorious = true, onDeployComplete }) => {
  const groupRef = useRef<any>(null)
  const [scale, setScale] = useState(0)
  const [opacity, setOpacity] = useState(1)
  
  useEffect(() => {
    if (isDeployed && scale < 1) {
      const interval = setInterval(() => {
        setScale(prev => {
          const newScale = prev + 0.05
          if (newScale >= 1) {
            clearInterval(interval)
            onDeployComplete?.()
            return 1
          }
          return newScale
        })
      }, 50)
      return () => clearInterval(interval)
    }
  }, [isDeployed, scale, onDeployComplete])
  
  // Fade out losing armies after battle
  useEffect(() => {
    if (!isVictorious && scale >= 1) {
      const timer = setTimeout(() => {
        const fadeInterval = setInterval(() => {
          setOpacity(prev => {
            const newOpacity = prev - 0.05
            if (newOpacity <= 0) {
              clearInterval(fadeInterval)
              return 0
            }
            return newOpacity
          })
        }, 100)
      }, 3000) // Wait 3 seconds after battle before fading
      return () => clearTimeout(timer)
    }
  }, [isVictorious, scale])
  
  if (!isDeployed || opacity <= 0) return null
  
  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* Army Banner */}
      <Cylinder args={[0.04, 0.04, 1]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#8B4513" transparent opacity={opacity} />
      </Cylinder>
      
      {/* Banner Flag */}
      <Plane args={[0.6, 0.4]} position={[0.3, 0.8, 0]}>
        <meshStandardMaterial color={color} transparent opacity={0.9 * opacity} />
      </Plane>
      
      {/* Army Name - LARGER TEXT */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.25} // Increased from 0.15
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02} // Increased outline
        outlineColor="black"
      >
        {name}
      </Text>
      
      {/* Clean Linear Formation - Well Spaced */}
      {Array.from({ length: Math.min(size, 8) }, (_, i) => {
        const row = Math.floor(i / 2)
        const col = i % 2
        const x = (col - 0.5) * 0.6 // Wide spacing
        const z = row * 0.4 - 0.8 // Deep formation
        
        return (
          <group key={i} position={[x, 0, z]}>
            {/* Soldier */}
            <Cylinder args={[0.05, 0.07, 0.3]} position={[0, 0.15, 0]}>
              <meshStandardMaterial color="#4A5568" transparent opacity={opacity} />
            </Cylinder>
            
            {/* Head */}
            <Sphere args={[0.06]} position={[0, 0.35, 0]}>
              <meshStandardMaterial color="#D2B48C" transparent opacity={opacity} />
            </Sphere>
            
            {/* Weapon */}
            <Cylinder args={[0.01, 0.01, 0.5]} position={[0.1, 0.3, 0]} rotation={[0, 0, Math.PI/4]}>
              <meshStandardMaterial color="#696969" transparent opacity={opacity} />
            </Cylinder>
            
            {/* Shield */}
            <Cylinder args={[0.08, 0.08, 0.02]} position={[-0.08, 0.2, 0]} rotation={[0, 0, Math.PI/2]}>
              <meshStandardMaterial color={color} transparent opacity={opacity} />
            </Cylinder>
          </group>
        )
      })}
      
      {/* Commander */}
      <group position={[0, 0, -1.2]}>
        <Cylinder args={[0.07, 0.09, 0.4]} position={[0, 0.2, 0]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} transparent opacity={opacity} />
        </Cylinder>
        <Sphere args={[0.08]} position={[0, 0.45, 0]}>
          <meshStandardMaterial color="#D2B48C" transparent opacity={opacity} />
        </Sphere>
        {/* Commander Crown */}
        <Cylinder args={[0.09, 0.07, 0.08]} position={[0, 0.55, 0]}>
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.4} transparent opacity={opacity} />
        </Cylinder>
      </group>
    </group>
  )
}

// Clean Battle Effects - Standard explosions and smoke for regular battles
const BattleEffect3D: FC<{ 
  position: [number, number, number]
  isActive: boolean
  intensity: number
}> = ({ position, isActive, intensity }) => {
  const effectRef = useRef<any>(null)
  
  useEffect(() => {
    if (effectRef.current && isActive) {
      const animate = (): void => {
        if (effectRef.current) {
          effectRef.current.rotation.y += 0.02
          effectRef.current.children.forEach((child: any, i: number) => {
            const time = Date.now() * 0.003
            child.position.y = Math.abs(Math.sin(time + i)) * intensity * 0.8
            child.position.x = Math.cos(time + i * 0.3) * intensity * 0.3
            child.position.z = Math.sin(time + i * 0.5) * intensity * 0.3
          })
          requestAnimationFrame(animate)
        }
      }
      animate()
    }
  }, [isActive, intensity])
  
  if (!isActive) return null
  
  return (
    <group ref={effectRef} position={position}>
      {/* Standard explosion particles */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 0.5 + Math.random() * 0.5
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <Sphere key={i} args={[0.06]} position={[x, 0.2, z]}>
            <meshStandardMaterial 
              color="#FF4500" 
              emissive="#FF4500"
              emissiveIntensity={0.7}
              transparent
              opacity={0.8}
            />
          </Sphere>
        )
      })}
      
      {/* Standard smoke clouds */}
      {Array.from({ length: 5 }, (_, i) => {
        const angle = (i / 5) * Math.PI * 2
        const radius = 0.8 + Math.random() * 0.4
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <Sphere key={`smoke-${i}`} args={[0.12]} position={[x, 0.8, z]}>
            <meshStandardMaterial 
              color="#555555"
              transparent
              opacity={0.4}
            />
          </Sphere>
        )
      })}
    </group>
  )
}

// Emperor Exile for Humayun's defeat and journey to Persia
const EmperorExile3D: FC<{ 
  exileData: any
  isActive: boolean
}> = ({ exileData, isActive }) => {
  const groupRef = useRef<any>(null)
  const [phase, setPhase] = useState<'defeat' | 'journey' | 'exile'>('defeat')
  const [journeyProgress, setJourneyProgress] = useState(0)
  const [currentPosition, setCurrentPosition] = useState(exileData.defeatLocation)
  
  useEffect(() => {
    if (!isActive) return
    
    // Phase 1: Show defeat for 3 seconds
    const defeatTimer = setTimeout(() => {
      setPhase('journey')
      
      // Phase 2: Journey animation along exile route (12 seconds)
      const journeyInterval = setInterval(() => {
        setJourneyProgress(prev => {
          const newProgress = prev + 0.007 // Slow, dramatic journey
          if (newProgress >= 1) {
            clearInterval(journeyInterval)
            setPhase('exile')
            return 1
          }
          
          // Calculate position along route
          const route = exileData.exileRoute
          const totalSegments = route.length - 1
          const currentSegment = Math.floor(newProgress * totalSegments)
          const segmentProgress = (newProgress * totalSegments) - currentSegment
          
          if (currentSegment < totalSegments) {
            const start = route[currentSegment]
            const end = route[currentSegment + 1]
            const pos: [number, number] = [
              start[0] + (end[0] - start[0]) * segmentProgress,
              start[1] + (end[1] - start[1]) * segmentProgress
            ]
            setCurrentPosition(pos)
          }
          
          return newProgress
        })
      }, 100)
    }, 3000)
    
    return () => {
      clearTimeout(defeatTimer)
    }
  }, [isActive, exileData])
  
  if (!isActive) return null
  
  const pos3D: [number, number, number] = [
    (currentPosition[1] - 75) * 0.1,
    0,
    (currentPosition[0] - 25) * 0.1
  ]
  
  return (
    <group ref={groupRef} position={pos3D}>
      {/* Humayun Emperor Figure */}
      <group position={[0, 0, 0]}>
        {/* Emperor Body */}
        <Cylinder args={[0.08, 0.1, 0.4]} position={[0, 0.2, 0]}>
          <meshStandardMaterial 
            color={phase === 'defeat' ? "#8B0000" : "#4B0082"} 
            emissive={phase === 'defeat' ? "#8B0000" : "#4B0082"} 
            emissiveIntensity={0.3} 
          />
        </Cylinder>
        
        {/* Emperor Head */}
        <Sphere args={[0.08]} position={[0, 0.45, 0]}>
          <meshStandardMaterial color="#D2B48C" />
        </Sphere>
        
        {/* Imperial Crown */}
        <group position={[0, 0.55, 0]}>
          <Cylinder args={[0.1, 0.08, 0.06]}>
            <meshStandardMaterial 
              color="#FFD700" 
              emissive="#FFD700" 
              emissiveIntensity={phase === 'defeat' ? 0.2 : 0.5} 
              metalness={0.8} 
              roughness={0.2} 
            />
          </Cylinder>
          
          {/* Crown jewels */}
          {[0, 1, 2, 3, 4].map(i => {
            const angle = (i / 5) * Math.PI * 2
            return (
              <Sphere key={i} args={[0.015]} 
                position={[Math.cos(angle) * 0.08, 0.04, Math.sin(angle) * 0.08]}>
                <meshStandardMaterial 
                  color="#FF0000" 
                  emissive="#FF0000" 
                  emissiveIntensity={0.6} 
                />
              </Sphere>
            )
          })}
        </group>
        
        {/* Imperial Cloak - changes color based on phase */}
        <Cylinder args={[0.12, 0.15, 0.1]} position={[0, 0.05, 0]}>
          <meshStandardMaterial 
            color={phase === 'defeat' ? "#8B0000" : phase === 'journey' ? "#800080" : "#4B0082"} 
            transparent 
            opacity={0.8} 
          />
        </Cylinder>
      </group>
      
      {/* Small Entourage (2-3 loyal followers) */}
      {phase !== 'defeat' && [
        [-0.3, -0.3], [0.3, -0.3], [0, -0.6]
      ].slice(0, journeyProgress > 0.3 ? 3 : 0).map((pos, i) => (
        <group key={i} position={[pos[0], 0, pos[1]]}>
          <Cylinder args={[0.04, 0.06, 0.25]} position={[0, 0.125, 0]}>
            <meshStandardMaterial color="#4A5568" />
          </Cylinder>
          <Sphere args={[0.05]} position={[0, 0.28, 0]}>
            <meshStandardMaterial color="#D2B48C" />
          </Sphere>
        </group>
      ))}
      
      {/* Phase-specific effects */}
      {phase === 'defeat' && (
        <Text
          position={[0, 1.8, 0]}
          fontSize={0.25}
          color="#FF0000"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
        >
          HUMAYUN DEFEATED
        </Text>
      )}
      
      {phase === 'journey' && (
        <Text
          position={[0, 1.8, 0]}
          fontSize={0.25}
          color="#FFA500"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
        >
          EXILE TO PERSIA
        </Text>
      )}
      
      {phase === 'exile' && (
        <Text
          position={[0, 1.8, 0]}
          fontSize={0.25}
          color="#8A2BE2"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
        >
          15 YEARS IN EXILE
        </Text>
      )}
      
      {/* Journey path particles */}
      {phase === 'journey' && journeyProgress > 0.1 && Array.from({ length: 8 }, (_, i) => {
        const trailOffset = i * 0.1
        const trailProgress = Math.max(0, journeyProgress - trailOffset)
        if (trailProgress <= 0) return null
        
        return (
          <Sphere key={i} args={[0.02]} position={[-trailProgress * 2, 0.1, -trailProgress * 1.5]}>
            <meshStandardMaterial 
              color="#FFD700" 
              emissive="#FFD700" 
              emissiveIntensity={0.5 * (1 - trailOffset)} 
              transparent 
              opacity={0.7 * (1 - trailOffset)} 
            />
          </Sphere>
        )
      })}
    </group>
  )
}

// Foundation Ceremony for Babur's Coronation
const Foundation3D: FC<{ 
  foundationData: any
  isActive: boolean
}> = ({ foundationData, isActive }) => {
  const groupRef = useRef<any>(null)
  const [phase, setPhase] = useState<'coronation' | 'fort'>('coronation')
  const [coronationProgress, setCoronationProgress] = useState(0)
  const [fortProgress, setFortProgress] = useState(0)
  
  useEffect(() => {
    if (!isActive) return
    
    // Coronation phase
    const coronationTimer = setTimeout(() => {
      setPhase('fort')
      
      // Start fort construction
      const fortInterval = setInterval(() => {
        setFortProgress(prev => {
          const newProgress = prev + 0.02
          if (newProgress >= 1) {
            clearInterval(fortInterval)
            return 1
          }
          return newProgress
        })
      }, 100)
    }, foundationData.coronation.duration)
    
    // Coronation animation
    const coronationInterval = setInterval(() => {
      setCoronationProgress(prev => {
        const newProgress = prev + 0.01
        if (newProgress >= 1) {
          clearInterval(coronationInterval)
          return 1
        }
        return newProgress
      })
    }, 80)
    
    return () => {
      clearTimeout(coronationTimer)
      clearInterval(coronationInterval)
    }
  }, [isActive, foundationData])
  
  if (!isActive) return null
  
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Coronation Phase */}
      {phase === 'coronation' && (
        <group>
          {/* Throne */}
          <Box args={[0.8, 0.6, 0.4]} position={[0, 0.3, 0]}>
            <meshStandardMaterial color="#8B4513" />
          </Box>
          
          {/* Emperor Figure */}
          <Cylinder args={[0.1, 0.12, 0.4]} position={[0, 0.7, 0]}>
            <meshStandardMaterial color="#10B981" />
          </Cylinder>
          <Sphere args={[0.12]} position={[0, 0.95, 0]}>
            <meshStandardMaterial color="#D2B48C" />
          </Sphere>
          
          {/* Crown */}
          <Cylinder args={[0.15, 0.12, 0.08]} position={[0, 1.1, 0]}>
            <meshStandardMaterial 
              color="#FFD700" 
              emissive="#FFD700" 
              emissiveIntensity={0.3}
            />
          </Cylinder>
          
          {/* Coronation Text */}
          <Text
            position={[0, 2.5, 0]}
            fontSize={0.25}
            color="gold"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            {foundationData.coronation.emperor} Crowned
          </Text>
          
          {/* Celebration Particles */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * Math.PI * 2
            const radius = 1.5 + Math.sin(Date.now() * 0.003 + i) * 0.3
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            const y = Math.abs(Math.sin(Date.now() * 0.002 + i)) * 0.5
            
            return (
              <Sphere key={i} args={[0.03]} position={[x, y, z]}>
                <meshStandardMaterial 
                  color="#FFD700" 
                  emissive="#FFD700"
                  emissiveIntensity={0.8}
                />
              </Sphere>
            )
          })}
        </group>
      )}
      
      {/* Fort Construction Phase */}
      {phase === 'fort' && (
        <group>
          {/* Fort Foundation */}
          <Box args={[2 * fortProgress, 0.3, 2 * fortProgress]} position={[0, 0.15, 0]}>
            <meshStandardMaterial color="#8B4513" />
          </Box>
          
          {/* Fort Walls */}
          {fortProgress > 0.3 && (
            <Box args={[2, 1.5 * (fortProgress - 0.3) / 0.7, 0.2]} position={[0, 0.75 * (fortProgress - 0.3) / 0.7, 1]}>
              <meshStandardMaterial color="#A0522D" />
            </Box>
          )}
          
          {/* Fort Towers */}
          {fortProgress > 0.6 && (
            <>
              <Cylinder args={[0.2, 0.2, 1.5 * (fortProgress - 0.6) / 0.4]} position={[-0.8, 0.75 * (fortProgress - 0.6) / 0.4, 0.8]}>
                <meshStandardMaterial color="#A0522D" />
              </Cylinder>
              <Cylinder args={[0.2, 0.2, 1.5 * (fortProgress - 0.6) / 0.4]} position={[0.8, 0.75 * (fortProgress - 0.6) / 0.4, 0.8]}>
                <meshStandardMaterial color="#A0522D" />
              </Cylinder>
            </>
          )}
          
          {/* Fort Text */}
          <Text
            position={[0, 3.2, 0]}
            fontSize={0.2}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            {foundationData.fort.name}
          </Text>
        </group>
      )}
    </group>
  )
}

// Coronation Ceremony for Akbar's Ascension
const Coronation3D: FC<{ 
  coronationData: any
  isActive: boolean
}> = ({ coronationData, isActive }) => {
  const groupRef = useRef<any>(null)
  const [phase, setPhase] = useState<'ceremony' | 'symbols' | 'completion'>('ceremony')
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    if (!isActive) return
    
    // Phase transitions
    const phase1Timer = setTimeout(() => setPhase('symbols'), 4000)
    const phase2Timer = setTimeout(() => setPhase('completion'), 8000)
    
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 0.008
        if (newProgress >= 1) {
          clearInterval(progressInterval)
          return 1
        }
        return newProgress
      })
    }, 100)
    
    return () => {
      clearTimeout(phase1Timer)
      clearTimeout(phase2Timer)
      clearInterval(progressInterval)
    }
  }, [isActive])
  
  if (!isActive) return null
  
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Imperial Throne */}
      <Box args={[1.2, 0.8, 0.6]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      
      {/* Emperor Akbar */}
      <Cylinder args={[0.12, 0.14, 0.5]} position={[0, 0.85, 0]}>
        <meshStandardMaterial color="#10B981" />
      </Cylinder>
      <Sphere args={[0.14]} position={[0, 1.15, 0]}>
        <meshStandardMaterial color="#D2B48C" />
      </Sphere>
      
      {/* Imperial Crown */}
      <Cylinder args={[0.18, 0.15, 0.1]} position={[0, 1.35, 0]}>
        <meshStandardMaterial 
          color="#FFD700" 
          emissive="#FFD700" 
          emissiveIntensity={0.4}
        />
      </Cylinder>
      
      {/* Coronation Symbols */}
      {phase === 'symbols' && (
        <group>
          {/* Scepter */}
          <Cylinder args={[0.02, 0.02, 0.8]} position={[0.4, 0.8, 0]} rotation={[0, 0, Math.PI/6]}>
            <meshStandardMaterial color="#FFD700" />
          </Cylinder>
          
          {/* Orb */}
          <Sphere args={[0.08]} position={[0.6, 0.9, 0]}>
            <meshStandardMaterial color="#FFD700" />
          </Sphere>
          
          {/* Imperial Banner */}
          <Plane args={[0.8, 0.6]} position={[-0.4, 1.2, 0]}>
            <meshStandardMaterial color="#10B981" />
          </Plane>
        </group>
      )}
      
      {/* Completion Effects */}
      {phase === 'completion' && (
        <group>
          {/* Celebration Ring */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * Math.PI * 2
            const radius = 2 + Math.sin(Date.now() * 0.002 + i) * 0.2
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            const y = Math.abs(Math.sin(Date.now() * 0.003 + i)) * 0.3
            
            return (
              <Sphere key={i} args={[0.04]} position={[x, y, z]}>
                <meshStandardMaterial 
                  color="#FFD700" 
                  emissive="#FFD700"
                  emissiveIntensity={0.8}
                />
              </Sphere>
            )
          })}
        </group>
      )}
      
      {/* Emperor Name */}
      <Text
        position={[0, 2.8, 0]}
        fontSize={0.3}
        color="gold"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {coronationData.emperor}
      </Text>
      
      {/* Phase Text */}
      <Text
        position={[0, -1.2, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {phase === 'ceremony' ? 'Imperial Coronation' : 
         phase === 'symbols' ? 'Symbols of Power' : 'Empire Established'}
      </Text>
    </group>
  )
}

// Conquest Celebration for Gujarat
const Conquest3D: FC<{ 
  conquestData: any
  isActive: boolean
}> = ({ conquestData, isActive }) => {
  const groupRef = useRef<any>(null)
  const [phase, setPhase] = useState<'celebration' | 'trade'>('celebration')
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    if (!isActive) return
    
    // Phase transition
    const phaseTimer = setTimeout(() => setPhase('trade'), conquestData.celebration.duration)
    
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 0.01
        if (newProgress >= 1) {
          clearInterval(progressInterval)
          return 1
        }
        return newProgress
      })
    }, 100)
    
    return () => {
      clearTimeout(phaseTimer)
      clearInterval(progressInterval)
    }
  }, [isActive, conquestData])
  
  if (!isActive) return null
  
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Victory Banner */}
      <Cylinder args={[0.05, 0.05, 1.5]} position={[0, 0.75, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Cylinder>
      <Plane args={[1.2, 0.8]} position={[0.6, 1.2, 0]}>
        <meshStandardMaterial color="#10B981" />
      </Plane>
      
      {/* Victory Text */}
      <Text
        position={[0, 2.8, 0]}
        fontSize={0.25}
        color="gold"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        GUJARAT CONQUERED
      </Text>
      
      {/* Celebration Phase */}
      {phase === 'celebration' && (
        <group>
          {/* Victory Soldiers */}
          {Array.from({ length: 6 }, (_, i) => {
            const angle = (i / 6) * Math.PI * 2
            const radius = 1.5
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            
            return (
              <group key={i} position={[x, 0, z]}>
                <Cylinder args={[0.06, 0.08, 0.3]} position={[0, 0.15, 0]}>
                  <meshStandardMaterial color="#10B981" />
                </Cylinder>
                <Sphere args={[0.07]} position={[0, 0.35, 0]}>
                  <meshStandardMaterial color="#D2B48C" />
                </Sphere>
              </group>
            )
          })}
          
          {/* Celebration Particles */}
          {Array.from({ length: 10 }, (_, i) => {
            const angle = (i / 10) * Math.PI * 2
            const radius = 2 + Math.sin(Date.now() * 0.002 + i) * 0.3
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            const y = Math.abs(Math.sin(Date.now() * 0.003 + i)) * 0.4
            
            return (
              <Sphere key={i} args={[0.03]} position={[x, y, z]}>
                <meshStandardMaterial 
                  color="#FFD700" 
                  emissive="#FFD700"
                  emissiveIntensity={0.7}
                />
              </Sphere>
            )
          })}
        </group>
      )}
      
      {/* Trade Route Phase */}
      {phase === 'trade' && (
        <group>
          {/* Trade Route Line */}
          <Cylinder args={[0.02, 0.02, 2]} position={[0, 0.1, -1]} rotation={[Math.PI/2, 0, 0]}>
            <meshStandardMaterial color="#FFD700" />
          </Cylinder>
          
          {/* Port Development */}
          <group position={[0, 0, -2]}>
            <Box args={[0.8, 0.4, 0.6]} position={[0, 0.2, 0]}>
              <meshStandardMaterial color="#8B4513" />
            </Box>
            <Cylinder args={[0.1, 0.1, 0.8]} position={[0, 0.6, 0]}>
              <meshStandardMaterial color="#A0522D" />
            </Cylinder>
            <Text
              position={[0, 2.2, 0]}
              fontSize={0.15}
              color="white"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.01}
              outlineColor="black"
            >
              {conquestData.tradeRoute.port.name}
            </Text>
          </group>
          
          {/* Trade Ships */}
          {Array.from({ length: 3 }, (_, i) => {
            const shipProgress = Math.min(1, progress * 3 - i * 0.3)
            const x = shipProgress * 2 - 1
            const z = -1 + shipProgress * 0.5
            
            return (
              <group key={i} position={[x, 0.1, z]}>
                <Box args={[0.3, 0.15, 0.1]} position={[0, 0.075, 0]}>
                  <meshStandardMaterial color="#8B4513" />
                </Box>
                <Cylinder args={[0.02, 0.02, 0.4]} position={[0, 0.3, 0]}>
                  <meshStandardMaterial color="#8B4513" />
                </Cylinder>
              </group>
            )
          })}
        </group>
      )}
    </group>
  )
}

// Religious Ceremony for Din-i Ilahi
const Religious3D: FC<{ 
  religiousData: any
  isActive: boolean
}> = ({ religiousData, isActive }) => {
  const groupRef = useRef<any>(null)
  const [phase, setPhase] = useState<'proclamation' | 'symbols' | 'unity'>('proclamation')
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    if (!isActive) return
    
    // Phase transitions
    const phase1Timer = setTimeout(() => setPhase('symbols'), 4000)
    const phase2Timer = setTimeout(() => setPhase('unity'), 8000)
    
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 0.008
        if (newProgress >= 1) {
          clearInterval(progressInterval)
          return 1
        }
        return newProgress
      })
    }, 100)
    
    return () => {
      clearTimeout(phase1Timer)
      clearTimeout(phase2Timer)
      clearInterval(progressInterval)
    }
  }, [isActive])
  
  if (!isActive) return null
  
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Palace Base */}
      <Box args={[2, 0.5, 2]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      
      {/* Palace Structure */}
      <Box args={[1.5, 1.2, 1.5]} position={[0, 1.1, 0]}>
        <meshStandardMaterial color="#A0522D" />
      </Box>
      
      {/* Palace Dome */}
      <Cylinder args={[0.8, 0.8, 0.4]} position={[0, 2.2, 0]}>
        <meshStandardMaterial color="#FFD700" />
      </Cylinder>
      
      {/* Divine Light */}
      {phase === 'proclamation' && (
        <group>
          <Cylinder args={[0.1, 0.3, 2]} position={[0, 3.5, 0]}>
            <meshStandardMaterial 
              color="#FFFF00" 
              emissive="#FFFF00" 
              emissiveIntensity={0.8}
              transparent
              opacity={0.7}
            />
          </Cylinder>
          
          <Text
            position={[0, 5.5, 0]}
            fontSize={0.25}
            color="gold"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            DIN-I ILAHI
          </Text>
        </group>
      )}
      
      {/* Spiritual Symbols */}
      {phase === 'symbols' && (
        <group>
          {/* Unity Symbols */}
          {Array.from({ length: 6 }, (_, i) => {
            const angle = (i / 6) * Math.PI * 2
            const radius = 1.8
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            
            return (
              <group key={i} position={[x, 1.5, z]}>
                <Cylinder args={[0.05, 0.05, 0.8]} position={[0, 0.4, 0]}>
                  <meshStandardMaterial color="#FFD700" />
                </Cylinder>
                <Sphere args={[0.08]} position={[0, 0.9, 0]}>
                  <meshStandardMaterial 
                    color={i % 2 === 0 ? "#FF0000" : "#00FF00"} 
                    emissive={i % 2 === 0 ? "#FF0000" : "#00FF00"}
                    emissiveIntensity={0.5}
                  />
                </Sphere>
              </group>
            )
          })}
          
          <Text
            position={[0, 4, 0]}
            fontSize={0.2}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            Religious Unity
          </Text>
        </group>
      )}
      
      {/* Unity Banner */}
      {phase === 'unity' && (
        <group>
          <Plane args={[2, 1]} position={[0, 2.5, 0]}>
            <meshStandardMaterial color="#800080" />
          </Plane>
          
          <Text
            position={[0, 2.5, 0]}
            fontSize={0.15}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="black"
          >
            Unity of Faiths
          </Text>
          
          {/* Unity Particles */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * Math.PI * 2
            const radius = 2.5 + Math.sin(Date.now() * 0.002 + i) * 0.2
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            const y = Math.abs(Math.sin(Date.now() * 0.003 + i)) * 0.3
            
            return (
              <Sphere key={i} args={[0.03]} position={[x, y, z]}>
                <meshStandardMaterial 
                  color="#800080" 
                  emissive="#800080"
                  emissiveIntensity={0.6}
                />
              </Sphere>
            )
          })}
        </group>
      )}
      
      {/* Palace Name */}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {religiousData.monument.name}
      </Text>
    </group>
  )
}

// Diplomatic Meeting for East India Company
const Diplomatic3D: FC<{ 
  diplomaticData: any
  isActive: boolean
}> = ({ diplomaticData, isActive }) => {
  const groupRef = useRef<any>(null)
  const [phase, setPhase] = useState<'meeting' | 'trade' | 'agreement'>('meeting')
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    if (!isActive) return
    
    // Phase transitions
    const phase1Timer = setTimeout(() => setPhase('trade'), 4000)
    const phase2Timer = setTimeout(() => setPhase('agreement'), 8000)
    
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 0.008
        if (newProgress >= 1) {
          clearInterval(progressInterval)
          return 1
        }
        return newProgress
      })
    }, 100)
    
    return () => {
      clearTimeout(phase1Timer)
      clearTimeout(phase2Timer)
      clearInterval(progressInterval)
    }
  }, [isActive])
  
  if (!isActive) return null
  
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Mughal Court */}
      <Box args={[2.5, 0.5, 2.5]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      
      {/* Court Structure */}
      <Box args={[2, 1.5, 2]} position={[0, 1.25, 0]}>
        <meshStandardMaterial color="#A0522D" />
      </Box>
      
      {/* Mughal Emperor */}
      <group position={[-0.5, 0.8, 0]}>
        <Cylinder args={[0.1, 0.12, 0.4]} position={[0, 0.2, 0]}>
          <meshStandardMaterial color="#10B981" />
        </Cylinder>
        <Sphere args={[0.12]} position={[0, 0.45, 0]}>
          <meshStandardMaterial color="#D2B48C" />
        </Sphere>
        <Cylinder args={[0.15, 0.12, 0.08]} position={[0, 0.6, 0]}>
          <meshStandardMaterial color="#FFD700" />
        </Cylinder>
      </group>
      
      {/* British Ambassador */}
      <group position={[0.5, 0.8, 0]}>
        <Cylinder args={[0.1, 0.12, 0.4]} position={[0, 0.2, 0]}>
          <meshStandardMaterial color="#1E40AF" />
        </Cylinder>
        <Sphere args={[0.12]} position={[0, 0.45, 0]}>
          <meshStandardMaterial color="#D2B48C" />
        </Sphere>
        <Box args={[0.2, 0.1, 0.1]} position={[0, 0.6, 0]}>
          <meshStandardMaterial color="#1E40AF" />
        </Box>
      </group>
      
      {/* Meeting Phase */}
      {phase === 'meeting' && (
        <group>
          <Text
            position={[0, 3.2, 0]}
            fontSize={0.25}
            color="gold"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            DIPLOMATIC MEETING
          </Text>
          
          {/* Meeting Table */}
          <Box args={[1.5, 0.1, 0.8]} position={[0, 0.6, 0]}>
            <meshStandardMaterial color="#8B4513" />
          </Box>
        </group>
      )}
      
      {/* Trade Route Phase */}
      {phase === 'trade' && (
        <group>
          {/* Trade Route Visualization */}
          <Cylinder args={[0.02, 0.02, 3]} position={[0, 0.1, -1.5]} rotation={[Math.PI/2, 0, 0]}>
            <meshStandardMaterial color="#FFD700" />
          </Cylinder>
          
          {/* Ships along route */}
          {Array.from({ length: 4 }, (_, i) => {
            const shipProgress = Math.min(1, progress * 4 - i * 0.2)
            const x = shipProgress * 3 - 1.5
            const z = -1.5 + shipProgress * 0.3
            
            return (
              <group key={i} position={[x, 0.1, z]}>
                <Box args={[0.4, 0.2, 0.15]} position={[0, 0.1, 0]}>
                  <meshStandardMaterial color="#1E40AF" />
                </Box>
                <Cylinder args={[0.02, 0.02, 0.5]} position={[0, 0.4, 0]}>
                  <meshStandardMaterial color="#1E40AF" />
                </Cylinder>
              </group>
            )
          })}
          
          <Text
            position={[0, 3.2, 0]}
            fontSize={0.2}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            Trade Route Established
          </Text>
        </group>
      )}
      
      {/* Agreement Phase */}
      {phase === 'agreement' && (
        <group>
          {/* Agreement Document */}
          <Plane args={[1, 0.8]} position={[0, 1.5, 0]}>
            <meshStandardMaterial color="#FFFFFF" />
          </Plane>
          
          <Text
            position={[0, 1.5, 0]}
            fontSize={0.1}
            color="black"
            anchorX="center"
            anchorY="middle"
          >
            TRADE AGREEMENT
          </Text>
          
          {/* Agreement Particles */}
          {Array.from({ length: 6 }, (_, i) => {
            const angle = (i / 6) * Math.PI * 2
            const radius = 2 + Math.sin(Date.now() * 0.002 + i) * 0.2
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            const y = Math.abs(Math.sin(Date.now() * 0.003 + i)) * 0.3
            
            return (
              <Sphere key={i} args={[0.03]} position={[x, y, z]}>
                <meshStandardMaterial 
                  color="#1E40AF" 
                  emissive="#1E40AF"
                  emissiveIntensity={0.6}
                />
              </Sphere>
            )
          })}
          
          <Text
            position={[0, 3.7, 0]}
            fontSize={0.2}
            color="gold"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            Agreement Signed
          </Text>
        </group>
      )}
      
      {/* Court Name */}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {diplomaticData.monument.name}
      </Text>
    </group>
  )
}

// Construction Sequence for Taj Mahal
const Construction3D: FC<{ 
  constructionData: any
  isActive: boolean
}> = ({ constructionData, isActive }) => {
  const groupRef = useRef<any>(null)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [phaseProgress, setPhaseProgress] = useState(0)
  const [workersVisible, setWorkersVisible] = useState(false)
  
  useEffect(() => {
    if (!isActive) return
    
    // Phase management
    const phaseTimer = setInterval(() => {
      setCurrentPhase(prev => {
        if (prev < constructionData.phases.length - 1) {
          setPhaseProgress(0)
          return prev + 1
        } else {
          clearInterval(phaseTimer)
          return prev
        }
      })
    }, constructionData.phases[0].duration)
    
    // Progress animation
    const progressInterval = setInterval(() => {
      setPhaseProgress(prev => {
        const newProgress = prev + 0.02
        if (newProgress >= 1) {
          return 1
        }
        return newProgress
      })
    }, 100)
    
    // Show workers after first phase
    const workersTimer = setTimeout(() => {
      setWorkersVisible(true)
    }, constructionData.phases[0].duration)
    
    return () => {
      clearInterval(phaseTimer)
      clearInterval(progressInterval)
      clearTimeout(workersTimer)
    }
  }, [isActive, constructionData])
  
  if (!isActive) return null
  
  const currentPhaseData = constructionData.phases[currentPhase]
  
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Foundation Phase */}
      {currentPhase === 0 && (
        <group>
          <Box args={[2 * phaseProgress, 0.3, 2 * phaseProgress]} position={[0, 0.15, 0]}>
            <meshStandardMaterial color="#8B4513" />
          </Box>
          <Text
            position={[0, 2.2, 0]}
            fontSize={0.25}
            color="gold"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            {currentPhaseData.name}
          </Text>
        </group>
      )}
      
      {/* Walls Phase */}
      {currentPhase === 1 && (
        <group>
          <Box args={[2, 0.3, 2]} position={[0, 0.15, 0]}>
            <meshStandardMaterial color="#8B4513" />
          </Box>
          <Box args={[2, 1.5 * phaseProgress, 0.2]} position={[0, 0.75 * phaseProgress, 1]}>
            <meshStandardMaterial color="#FFFFFF" />
          </Box>
          <Box args={[2, 1.5 * phaseProgress, 0.2]} position={[0, 0.75 * phaseProgress, -1]}>
            <meshStandardMaterial color="#FFFFFF" />
          </Box>
          <Box args={[0.2, 1.5 * phaseProgress, 2]} position={[1, 0.75 * phaseProgress, 0]}>
            <meshStandardMaterial color="#FFFFFF" />
          </Box>
          <Box args={[0.2, 1.5 * phaseProgress, 2]} position={[-1, 0.75 * phaseProgress, 0]}>
            <meshStandardMaterial color="#FFFFFF" />
          </Box>
          <Text
            position={[0, 3.2, 0]}
            fontSize={0.25}
            color="gold"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            {currentPhaseData.name}
          </Text>
        </group>
      )}
      
      {/* Dome Phase */}
      {currentPhase === 2 && (
        <group>
          <Box args={[2, 0.3, 2]} position={[0, 0.15, 0]}>
            <meshStandardMaterial color="#8B4513" />
          </Box>
          <Box args={[2, 1.5, 0.2]} position={[0, 0.75, 1]}>
            <meshStandardMaterial color="#FFFFFF" />
          </Box>
          <Box args={[2, 1.5, 0.2]} position={[0, 0.75, -1]}>
            <meshStandardMaterial color="#FFFFFF" />
          </Box>
          <Box args={[0.2, 1.5, 2]} position={[1, 0.75, 0]}>
            <meshStandardMaterial color="#FFFFFF" />
          </Box>
          <Box args={[0.2, 1.5, 2]} position={[-1, 0.75, 0]}>
            <meshStandardMaterial color="#FFFFFF" />
          </Box>
          <Cylinder args={[1.2 * phaseProgress, 1.2 * phaseProgress, 0.8 * phaseProgress]} position={[0, 1.5 + 0.4 * phaseProgress, 0]}>
            <meshStandardMaterial color="#FFFFFF" />
          </Cylinder>
          <Text
            position={[0, 3.7, 0]}
            fontSize={0.25}
            color="gold"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            {currentPhaseData.name}
          </Text>
        </group>
      )}
      
      {/* Completion Phase */}
      {currentPhase === 3 && (
        <group>
          <Box args={[2, 0.3, 2]} position={[0, 0.15, 0]}>
            <meshStandardMaterial color="#8B4513" />
          </Box>
          <Box args={[2, 1.5, 0.2]} position={[0, 0.75, 1]}>
            <meshStandardMaterial color="#FFFFFF" />
          </Box>
          <Box args={[2, 1.5, 0.2]} position={[0, 0.75, -1]}>
            <meshStandardMaterial color="#FFFFFF" />
          </Box>
          <Box args={[0.2, 1.5, 2]} position={[1, 0.75, 0]}>
            <meshStandardMaterial color="#FFFFFF" />
          </Box>
          <Box args={[0.2, 1.5, 2]} position={[-1, 0.75, 0]}>
            <meshStandardMaterial color="#FFFFFF" />
          </Box>
          <Cylinder args={[1.2, 1.2, 0.8]} position={[0, 1.9, 0]}>
            <meshStandardMaterial color="#FFFFFF" />
          </Cylinder>
          
          {/* Minarets */}
          <Cylinder args={[0.1, 0.1, 2]} position={[1.5, 1, 1.5]}>
            <meshStandardMaterial color="#FFFFFF" />
          </Cylinder>
          <Cylinder args={[0.1, 0.1, 2]} position={[-1.5, 1, 1.5]}>
            <meshStandardMaterial color="#FFFFFF" />
          </Cylinder>
          <Cylinder args={[0.1, 0.1, 2]} position={[1.5, 1, -1.5]}>
            <meshStandardMaterial color="#FFFFFF" />
          </Cylinder>
          <Cylinder args={[0.1, 0.1, 2]} position={[-1.5, 1, -1.5]}>
            <meshStandardMaterial color="#FFFFFF" />
          </Cylinder>
          
          {/* Completion Celebration */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * Math.PI * 2
            const radius = 3 + Math.sin(Date.now() * 0.002 + i) * 0.3
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            const y = Math.abs(Math.sin(Date.now() * 0.003 + i)) * 0.5
            
            return (
              <Sphere key={i} args={[0.04]} position={[x, y, z]}>
                <meshStandardMaterial 
                  color="#FFD700" 
                  emissive="#FFD700"
                  emissiveIntensity={0.8}
                />
              </Sphere>
            )
          })}
          
          <Text
            position={[0, 4.2, 0]}
            fontSize={0.3}
            color="gold"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            TAJ MAHAL COMPLETED
          </Text>
        </group>
      )}
      
      {/* Workers */}
      {workersVisible && (
        <group>
          {Array.from({ length: constructionData.workers.count }, (_, i) => {
            const angle = (i / constructionData.workers.count) * Math.PI * 2
            const radius = 2.5
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            
            return (
              <group key={i} position={[x, 0, z]}>
                <Cylinder args={[0.05, 0.07, 0.25]} position={[0, 0.125, 0]}>
                  <meshStandardMaterial color="#8B4513" />
                </Cylinder>
                <Sphere args={[0.06]} position={[0, 0.31, 0]}>
                  <meshStandardMaterial color="#D2B48C" />
                </Sphere>
              </group>
            )
          })}
        </group>
      )}
      
      {/* Materials Transport */}
      {currentPhase < 3 && (
        <group>
          {Array.from({ length: 3 }, (_, i) => {
            const materialProgress = Math.min(1, phaseProgress * 3 - i * 0.3)
            const x = materialProgress * 2 - 1
            const z = -2 + materialProgress * 0.5
            
            return (
              <group key={i} position={[x, 0.1, z]}>
                <Box args={[0.2, 0.15, 0.1]} position={[0, 0.075, 0]}>
                  <meshStandardMaterial color="#FFD700" />
                </Box>
              </group>
            )
          })}
        </group>
      )}
    </group>
  )
}

// Independence Declaration for Maratha Empire
const Independence3D: FC<{ 
  independenceData: any
  isActive: boolean
}> = ({ independenceData, isActive }) => {
  const groupRef = useRef<any>(null)
  const [phase, setPhase] = useState<'flag' | 'coronation' | 'celebration'>('flag')
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    if (!isActive) return
    
    // Phase transitions
    const phase1Timer = setTimeout(() => setPhase('coronation'), 5000)
    const phase2Timer = setTimeout(() => setPhase('celebration'), 10000)
    
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 0.006
        if (newProgress >= 1) {
          clearInterval(progressInterval)
          return 1
        }
        return newProgress
      })
    }, 100)
    
    return () => {
      clearTimeout(phase1Timer)
      clearTimeout(phase2Timer)
      clearInterval(progressInterval)
    }
  }, [isActive])
  
  if (!isActive) return null
  
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Fort Base */}
      <Box args={[2.5, 0.5, 2.5]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      
      {/* Fort Structure */}
      <Box args={[2, 1.5, 2]} position={[0, 1.25, 0]}>
        <meshStandardMaterial color="#A0522D" />
      </Box>
      
      {/* Flag Raising Phase */}
      {phase === 'flag' && (
        <group>
          {/* Flag Pole */}
          <Cylinder args={[0.05, 0.05, 2]} position={[0, 1.5, 0]}>
            <meshStandardMaterial color="#8B4513" />
          </Cylinder>
          
          {/* Maratha Flag */}
          <Plane args={[0.8, 0.6]} position={[0.4, 1.5 + progress * 1, 0]}>
            <meshStandardMaterial color="#FF6B35" />
          </Plane>
          
          <Text
            position={[0, 4.2, 0]}
            fontSize={0.25}
            color="gold"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            MARATHA FLAG RAISED
          </Text>
        </group>
      )}
      
      {/* Coronation Phase */}
      {phase === 'coronation' && (
        <group>
          {/* Flag Pole */}
          <Cylinder args={[0.05, 0.05, 2]} position={[0, 1.5, 0]}>
            <meshStandardMaterial color="#8B4513" />
          </Cylinder>
          
          {/* Maratha Flag */}
          <Plane args={[0.8, 0.6]} position={[0.4, 2.5, 0]}>
            <meshStandardMaterial color="#FF6B35" />
          </Plane>
          
          {/* Shivaji Maharaj */}
          <group position={[0, 0.8, 0]}>
            <Cylinder args={[0.1, 0.12, 0.4]} position={[0, 0.2, 0]}>
              <meshStandardMaterial color="#FF6B35" />
            </Cylinder>
            <Sphere args={[0.12]} position={[0, 0.45, 0]}>
              <meshStandardMaterial color="#D2B48C" />
            </Sphere>
            <Cylinder args={[0.15, 0.12, 0.08]} position={[0, 0.6, 0]}>
              <meshStandardMaterial color="#FFD700" />
            </Cylinder>
          </group>
          
          <Text
            position={[0, 4.2, 0]}
            fontSize={0.25}
            color="gold"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            {independenceData.ceremony.leader} CROWNED
          </Text>
        </group>
      )}
      
      {/* Celebration Phase */}
      {phase === 'celebration' && (
        <group>
          {/* Flag Pole */}
          <Cylinder args={[0.05, 0.05, 2]} position={[0, 1.5, 0]}>
            <meshStandardMaterial color="#8B4513" />
          </Cylinder>
          
          {/* Maratha Flag */}
          <Plane args={[0.8, 0.6]} position={[0.4, 2.5, 0]}>
            <meshStandardMaterial color="#FF6B35" />
          </Plane>
          
          {/* Shivaji Maharaj */}
          <group position={[0, 0.8, 0]}>
            <Cylinder args={[0.1, 0.12, 0.4]} position={[0, 0.2, 0]}>
              <meshStandardMaterial color="#FF6B35" />
            </Cylinder>
            <Sphere args={[0.12]} position={[0, 0.45, 0]}>
              <meshStandardMaterial color="#D2B48C" />
            </Sphere>
            <Cylinder args={[0.15, 0.12, 0.08]} position={[0, 0.6, 0]}>
              <meshStandardMaterial color="#FFD700" />
            </Cylinder>
          </group>
          
          {/* Celebration Ring */}
          {Array.from({ length: 15 }, (_, i) => {
            const angle = (i / 15) * Math.PI * 2
            const radius = 3 + Math.sin(Date.now() * 0.002 + i) * 0.3
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            const y = Math.abs(Math.sin(Date.now() * 0.003 + i)) * 0.4
            
            return (
              <Sphere key={i} args={[0.04]} position={[x, y, z]}>
                <meshStandardMaterial 
                  color="#FF6B35" 
                  emissive="#FF6B35"
                  emissiveIntensity={0.8}
                />
              </Sphere>
            )
          })}
          
          <Text
            position={[0, 4.7, 0]}
            fontSize={0.3}
            color="gold"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            MARATHA EMPIRE ESTABLISHED
          </Text>
        </group>
      )}
      
      {/* Fort Name */}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {independenceData.monument.name}
      </Text>
    </group>
  )
}

// Imperial Expansion for Aurangzeb's Conquest
const Expansion3D: FC<{ 
  expansionData: any
  isActive: boolean
}> = ({ expansionData, isActive }) => {
  const groupRef = useRef<any>(null)
  const [phase, setPhase] = useState<'territory' | 'victory'>('territory')
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    if (!isActive) return
    
    // Phase transition
    const phaseTimer = setTimeout(() => setPhase('victory'), expansionData.territory.duration)
    
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 0.01
        if (newProgress >= 1) {
          clearInterval(progressInterval)
          return 1
        }
        return newProgress
      })
    }, 100)
    
    return () => {
      clearTimeout(phaseTimer)
      clearInterval(progressInterval)
    }
  }, [isActive, expansionData])
  
  if (!isActive) return null
  
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Territory Marking Phase */}
      {phase === 'territory' && (
        <group>
          {/* Territory Border */}
          <Box args={[4 * progress, 0.1, 4 * progress]} position={[0, 0.05, 0]}>
            <meshStandardMaterial color="#FFD700" />
          </Box>
          
          {/* Territory Markers */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * Math.PI * 2
            const radius = 2 * progress
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            
            return (
              <Cylinder key={i} args={[0.1, 0.1, 0.8]} position={[x, 0.5, z]}>
                <meshStandardMaterial color="#10B981" />
              </Cylinder>
            )
          })}
          
          {/* Imperial Banner */}
          <Cylinder args={[0.05, 0.05, 1.5]} position={[0, 0.75, 0]}>
            <meshStandardMaterial color="#8B4513" />
          </Cylinder>
          <Plane args={[1, 0.7]} position={[0.5, 1.2, 0]}>
            <meshStandardMaterial color="#10B981" />
          </Plane>
          
          <Text
            position={[0, 3.2, 0]}
            fontSize={0.25}
            color="gold"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            TERRITORY MARKED
          </Text>
        </group>
      )}
      
      {/* Victory Celebration Phase */}
      {phase === 'victory' && (
        <group>
          {/* Territory Border */}
          <Box args={[4, 0.1, 4]} position={[0, 0.05, 0]}>
            <meshStandardMaterial color="#FFD700" />
          </Box>
          
          {/* Territory Markers */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * Math.PI * 2
            const radius = 2
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            
            return (
              <Cylinder key={i} args={[0.1, 0.1, 0.8]} position={[x, 0.5, z]}>
                <meshStandardMaterial color="#10B981" />
              </Cylinder>
            )
          })}
          
          {/* Imperial Banner */}
          <Cylinder args={[0.05, 0.05, 1.5]} position={[0, 0.75, 0]}>
            <meshStandardMaterial color="#8B4513" />
          </Cylinder>
          <Plane args={[1, 0.7]} position={[0.5, 1.2, 0]}>
            <meshStandardMaterial color="#10B981" />
          </Plane>
          
          {/* Victory Soldiers */}
          {Array.from({ length: 10 }, (_, i) => {
            const angle = (i / 10) * Math.PI * 2
            const radius = 2.5
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            
            return (
              <group key={i} position={[x, 0, z]}>
                <Cylinder args={[0.06, 0.08, 0.3]} position={[0, 0.15, 0]}>
                  <meshStandardMaterial color="#10B981" />
                </Cylinder>
                <Sphere args={[0.07]} position={[0, 0.35, 0]}>
                  <meshStandardMaterial color="#D2B48C" />
                </Sphere>
              </group>
            )
          })}
          
          {/* Victory Particles */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * Math.PI * 2
            const radius = 3 + Math.sin(Date.now() * 0.002 + i) * 0.3
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            const y = Math.abs(Math.sin(Date.now() * 0.003 + i)) * 0.4
            
            return (
              <Sphere key={i} args={[0.04]} position={[x, y, z]}>
                <meshStandardMaterial 
                  color="#FFD700" 
                  emissive="#FFD700"
                  emissiveIntensity={0.8}
                />
              </Sphere>
            )
          })}
          
          <Text
            position={[0, 3.7, 0]}
            fontSize={0.3}
            color="gold"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            DECCAN CONQUERED
          </Text>
        </group>
      )}
    </group>
  )
}

// Invasion Sequence for Nader Shah
const Invasion3D: FC<{ 
  invasionData: any
  isActive: boolean
}> = ({ invasionData, isActive }) => {
  const groupRef = useRef<any>(null)
  const [phase, setPhase] = useState<'invasion' | 'looting' | 'devastation'>('invasion')
  const [progress, setProgress] = useState(0)
  const [lootProgress, setLootProgress] = useState(0)
  
  useEffect(() => {
    if (!isActive) return
    
    // Phase transitions
    const phase1Timer = setTimeout(() => setPhase('looting'), 4000)
    const phase2Timer = setTimeout(() => setPhase('devastation'), 10000)
    
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 0.01
        if (newProgress >= 1) {
          clearInterval(progressInterval)
          return 1
        }
        return newProgress
      })
    }, 100)
    
    // Loot transport animation
    const lootInterval = setInterval(() => {
      setLootProgress(prev => {
        const newProgress = prev + 0.005
        if (newProgress >= 1) {
          clearInterval(lootInterval)
          return 1
        }
        return newProgress
      })
    }, 100)
    
    return () => {
      clearTimeout(phase1Timer)
      clearTimeout(phase2Timer)
      clearInterval(progressInterval)
      clearInterval(lootInterval)
    }
  }, [isActive])
  
  if (!isActive) return null
  
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Invasion Phase */}
      {phase === 'invasion' && (
        <group>
          {/* Invasion Forces */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * Math.PI * 2
            const radius = 2 + progress * 0.5
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            
            return (
              <group key={i} position={[x, 0, z]}>
                <Cylinder args={[0.06, 0.08, 0.3]} position={[0, 0.15, 0]}>
                  <meshStandardMaterial color="#DC2626" />
                </Cylinder>
                <Sphere args={[0.07]} position={[0, 0.35, 0]}>
                  <meshStandardMaterial color="#D2B48C" />
                </Sphere>
              </group>
            )
          })}
          
          <Text
            position={[0, 3.2, 0]}
            fontSize={0.25}
            color="red"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            NADER SHAH INVADES
          </Text>
        </group>
      )}
      
      {/* Looting Phase */}
      {phase === 'looting' && (
        <group>
          {/* Treasure Pile */}
          <Box args={[1, 0.5, 1]} position={[0, 0.25, 0]}>
            <meshStandardMaterial color="#FFD700" />
          </Box>
          
          {/* Loot Items */}
          {Array.from({ length: 6 }, (_, i) => {
            const angle = (i / 6) * Math.PI * 2
            const radius = 0.8
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            
            return (
              <Sphere key={i} args={[0.1]} position={[x, 0.6, z]}>
                <meshStandardMaterial 
                  color="#FFD700" 
                  emissive="#FFD700"
                  emissiveIntensity={0.5}
                />
              </Sphere>
            )
          })}
          
          {/* Loot Transport */}
          {Array.from({ length: 4 }, (_, i) => {
            const transportProgress = Math.min(1, lootProgress * 4 - i * 0.2)
            const x = transportProgress * 3 - 1.5
            const z = transportProgress * 2 - 1
            
            return (
              <group key={i} position={[x, 0.1, z]}>
                <Box args={[0.3, 0.2, 0.15]} position={[0, 0.1, 0]}>
                  <meshStandardMaterial color="#FFD700" />
                </Box>
                <Cylinder args={[0.02, 0.02, 0.5]} position={[0, 0.4, 0]}>
                  <meshStandardMaterial color="#8B4513" />
                </Cylinder>
              </group>
            )
          })}
          
          <Text
            position={[0, 3.2, 0]}
            fontSize={0.25}
            color="gold"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            TREASURE LOOTED
          </Text>
        </group>
      )}
      
      {/* Devastation Phase */}
      {phase === 'devastation' && (
        <group>
          {/* Ruins */}
          <Box args={[2, 0.3, 2]} position={[0, 0.15, 0]}>
            <meshStandardMaterial color="#696969" />
          </Box>
          
          {/* Smoke Effects */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * Math.PI * 2
            const radius = 1.5 + Math.sin(Date.now() * 0.002 + i) * 0.3
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            const y = Math.abs(Math.sin(Date.now() * 0.003 + i)) * 0.8
            
            return (
              <Sphere key={i} args={[0.08]} position={[x, y, z]}>
                <meshStandardMaterial 
                  color="#808080" 
                  transparent
                  opacity={0.6}
                />
              </Sphere>
            )
          })}
          
          {/* Devastation Particles */}
          {Array.from({ length: 10 }, (_, i) => {
            const angle = (i / 10) * Math.PI * 2
            const radius = 2.5 + Math.sin(Date.now() * 0.001 + i) * 0.2
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            const y = Math.abs(Math.sin(Date.now() * 0.002 + i)) * 0.3
            
            return (
              <Sphere key={i} args={[0.03]} position={[x, y, z]}>
                <meshStandardMaterial 
                  color="#8B0000" 
                  emissive="#8B0000"
                  emissiveIntensity={0.6}
                />
              </Sphere>
            )
          })}
          
          <Text
            position={[0, 3.2, 0]}
            fontSize={0.3}
            color="red"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            DELHI DEVASTATED
          </Text>
        </group>
      )}
    </group>
  )
}

// Monument construction component
const Monument3D: FC<{ 
  position: [number, number, number]
  type: string
  name: string
  isActive: boolean
}> = ({ position, type, name, isActive }) => {
  const monumentRef = useRef<any>(null)
  const [buildProgress, setBuildProgress] = useState(0)
  
  useEffect(() => {
    if (isActive && buildProgress < 1) {
      const interval = setInterval(() => {
        setBuildProgress(prev => {
          const newProgress = prev + 0.03
          return newProgress >= 1 ? 1 : newProgress
        })
      }, 100)
      return () => clearInterval(interval)
    }
  }, [isActive, buildProgress])
  
  if (!isActive) return null
  
  const getMonument = () => {
  switch (type) {
      case 'taj':
        return (
          <group ref={monumentRef} position={position}>
            {/* Main Dome */}
            <Sphere args={[0.5]} position={[0, 0.8 * buildProgress, 0]} scale={[1, buildProgress, 1]}>
              <meshStandardMaterial color="#F8F8FF" metalness={0.1} roughness={0.2} />
            </Sphere>
            
            {/* Main Building */}
            <Box args={[1.2, 0.6, 1.2]} position={[0, 0.3 * buildProgress, 0]} scale={[1, buildProgress, 1]}>
              <meshStandardMaterial color="#F8F8FF" />
            </Box>
            
            {/* Minarets */}
            {buildProgress > 0.6 && [
              [-0.8, 0.8], [0.8, 0.8], [-0.8, -0.8], [0.8, -0.8]
            ].map((pos, i) => (
              <group key={i} position={[pos[0], 0, pos[1]]}>
                <Cylinder args={[0.08, 0.08, 1.5 * (buildProgress - 0.6) * 2.5]} 
                  position={[0, (buildProgress - 0.6) * 1.875, 0]}>
                  <meshStandardMaterial color="#F8F8FF" />
                </Cylinder>
                {buildProgress > 0.9 && (
                  <Sphere args={[0.1]} position={[0, 1.5 * (buildProgress - 0.6) * 2.5, 0]}>
                    <meshStandardMaterial color="#F8F8FF" />
                  </Sphere>
                )}
              </group>
            ))}
            
            {/* Monument Name */}
            <Text
              position={[0, 1.8, 0]}
              fontSize={0.18} // Increased from 0.1
              color="white"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02} // Increased outline
              outlineColor="black"
            >
              {name}
            </Text>
          </group>
        )
      
      case 'fort':
        return (
          <group ref={monumentRef} position={position}>
            {/* Main Fort Wall */}
            <Box args={[1.8, 1.2 * buildProgress, 1.8]} position={[0, buildProgress * 0.6, 0]}>
              <meshStandardMaterial color="#8B4513" />
            </Box>
            
            {/* Corner Towers */}
            {buildProgress > 0.4 && [
              [-0.8, 0.8], [0.8, 0.8], [-0.8, -0.8], [0.8, -0.8]
            ].map((pos, i) => (
              <Cylinder 
                key={i} 
                args={[0.2, 0.2, 1.5 * (buildProgress - 0.4) * (1/0.6)]} 
                position={[pos[0], (buildProgress - 0.4) * (1/0.6) * 0.75, pos[1]]}
              >
                <meshStandardMaterial color="#654321" />
              </Cylinder>
            ))}
            
            <Text
              position={[0, 1.8, 0]}
              fontSize={0.18} // Increased from 0.1
              color="white"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02} // Increased outline
              outlineColor="black"
            >
              {name}
            </Text>
          </group>
        )
      
      case 'palace':
        return (
          <group ref={monumentRef} position={position}>
            {/* Main Palace */}
            <Box args={[1.5, 1.0 * buildProgress, 1.0]} position={[0, buildProgress * 0.5, 0]}>
              <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.2} />
            </Box>
            
            {/* Decorative Domes */}
            {buildProgress > 0.5 && [
              [-0.5, 0], [0.5, 0], [0, -0.3]
            ].map((pos, i) => (
              <Sphere key={i} args={[0.15]} 
                position={[pos[0], 1.0 * buildProgress + 0.15, pos[1]]}>
                <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
              </Sphere>
            ))}
            
            <Text
              position={[0, 1.8, 0]}
              fontSize={0.18} // Increased from 0.1
              color="white"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02} // Increased outline
              outlineColor="black"
            >
              {name}
            </Text>
          </group>
        )
      
      case 'court':
        return (
          <group ref={monumentRef} position={position}>
            {/* Elegant Court Building */}
            <Box args={[2.0, 0.8 * buildProgress, 1.5]} position={[0, buildProgress * 0.4, 0]}>
              <meshStandardMaterial color="#8B0000" emissive="#8B0000" emissiveIntensity={0.3} />
            </Box>
            
            {/* Pillars */}
            {buildProgress > 0.3 && [
              [-0.8, 0.5], [0, 0.5], [0.8, 0.5], [-0.8, -0.5], [0, -0.5], [0.8, -0.5]
            ].map((pos, i) => (
              <Cylinder key={i} args={[0.05, 0.05, 1.0 * buildProgress]} 
                position={[pos[0], buildProgress * 0.5, pos[1]]}>
                <meshStandardMaterial color="#F5DEB3" />
              </Cylinder>
            ))}
            
            <Text
              position={[0, 1.8, 0]}
              fontSize={0.18} // Increased from 0.1
              color="white"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02} // Increased outline
              outlineColor="black"
            >
              {name}
            </Text>
          </group>
        )
      
    default:
        return (
          <Box args={[1.0, 1.0 * buildProgress, 1.0]} position={position}>
            <meshStandardMaterial color="#8B4513" />
          </Box>
        )
    }
  }
  
  return getMonument()
}

// Ship for trade routes
const Ship3D: FC<{ position: [number, number, number]; isActive: boolean }> = ({ position, isActive }) => {
  const shipRef = useRef<any>(null)
  
  useEffect(() => {
    if (shipRef.current && isActive) {
      const animate = (): void => {
        if (shipRef.current) {
          shipRef.current.rotation.z = Math.sin(Date.now() * 0.001) * 0.1
          shipRef.current.position.y = position[1] + Math.sin(Date.now() * 0.002) * 0.05
          requestAnimationFrame(animate)
        }
      }
      animate()
    }
  }, [isActive, position])
  
  if (!isActive) return null
  
  return (
    <group ref={shipRef} position={position}>
      {/* Ship Hull */}
      <Box args={[1.2, 0.3, 0.5]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      
      {/* Main Mast */}
      <Cylinder args={[0.03, 0.03, 1.8]} position={[0, 0.9, 0]}>
        <meshStandardMaterial color="#654321" />
      </Cylinder>
      
      {/* Main Sail */}
      <Plane args={[0.9, 1.2]} position={[0, 0.9, 0.05]}>
        <meshStandardMaterial color="#F5F5DC" transparent opacity={0.9} />
      </Plane>
      
      {/* Front Mast */}
      <Cylinder args={[0.02, 0.02, 1.2]} position={[0.5, 0.6, 0]}>
        <meshStandardMaterial color="#654321" />
      </Cylinder>
      
      {/* Front Sail */}
      <Plane args={[0.5, 0.8]} position={[0.5, 0.6, 0.05]}>
        <meshStandardMaterial color="#F5F5DC" transparent opacity={0.9} />
      </Plane>
      
      {/* Flag */}
      <Plane args={[0.3, 0.2]} position={[0, 1.7, 0]}>
        <meshStandardMaterial color="#DC2626" transparent opacity={0.8} />
      </Plane>
    </group>
  )
}

// Coronation ceremony component
const Ceremony3D: FC<{ 
  position: [number, number, number]
  leader: string
  isActive: boolean
}> = ({ position, leader, isActive }) => {
  const ceremonyRef = useRef<any>(null)
  const [ceremonyProgress, setCeremonyProgress] = useState(0)
  
  useEffect(() => {
    if (isActive && ceremonyProgress < 1) {
      const interval = setInterval(() => {
        setCeremonyProgress(prev => {
          const newProgress = prev + 0.02
          return newProgress >= 1 ? 1 : newProgress
        })
      }, 120)
      return () => clearInterval(interval)
    }
  }, [isActive, ceremonyProgress])
  
  useEffect(() => {
    if (ceremonyRef.current && isActive) {
      const animate = (): void => {
        if (ceremonyRef.current) {
          ceremonyRef.current.rotation.y += 0.005
          requestAnimationFrame(animate)
        }
      }
      animate()
    }
  }, [isActive])
  
  if (!isActive) return null
  
  return (
    <group ref={ceremonyRef} position={position}>
      {/* Central Throne */}
      <Box args={[0.4, 0.6 * ceremonyProgress, 0.4]} position={[0, 0.3 * ceremonyProgress, 0]}>
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </Box>
      
      {/* Leader Figure */}
      {ceremonyProgress > 0.3 && (
        <group position={[0, 0.6 * ceremonyProgress, 0]}>
          <Cylinder args={[0.08, 0.1, 0.4]} position={[0, 0.2, 0]}>
            <meshStandardMaterial color="#8B0000" emissive="#8B0000" emissiveIntensity={0.3} />
          </Cylinder>
          <Sphere args={[0.08]} position={[0, 0.45, 0]}>
            <meshStandardMaterial color="#D2B48C" />
          </Sphere>
          {/* Leader's Crown */}
          <Cylinder args={[0.1, 0.08, 0.06]} position={[0, 0.55, 0]}>
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
          </Cylinder>
        </group>
      )}
      
      {/* Ceremony Attendees in Circle */}
      {ceremonyProgress > 0.5 && Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 1.0 + Math.random() * 0.3
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <group key={i} position={[x, 0, z]}>
            <Cylinder args={[0.04, 0.06, 0.25]} position={[0, 0.125, 0]}>
              <meshStandardMaterial color="#4A5568" />
            </Cylinder>
            <Sphere args={[0.05]} position={[0, 0.28, 0]}>
              <meshStandardMaterial color="#D2B48C" />
            </Sphere>
          </group>
        )
      })}
      
      {/* Floating Celebration Particles */}
      {ceremonyProgress > 0.7 && Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const radius = 0.5 + Math.random() * 0.8
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const y = 0.8 + Math.random() * 0.5
        
        return (
          <Sphere key={i} args={[0.03]} position={[x, y, z]}>
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.8} />
          </Sphere>
        )
      })}
      
      {/* Leader Name */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="black"
      >
        {leader}
      </Text>
    </group>
  )
}

// Devastation effects for catastrophic events
const Devastation3D: FC<{ 
  position: [number, number, number]
  intensity: number
  isActive: boolean
}> = ({ position, intensity, isActive }) => {
  const devastationRef = useRef<any>(null)
  
  useEffect(() => {
    if (devastationRef.current && isActive) {
      const animate = (): void => {
        if (devastationRef.current) {
          devastationRef.current.rotation.y += 0.03
          devastationRef.current.children.forEach((child: any, i: number) => {
            const time = Date.now() * 0.004
            child.position.y = Math.abs(Math.sin(time + i)) * intensity * 1.2
            child.position.x = Math.cos(time + i * 0.4) * intensity * 0.5
            child.position.z = Math.sin(time + i * 0.6) * intensity * 0.5
          })
          requestAnimationFrame(animate)
        }
      }
      animate()
    }
  }, [isActive, intensity])
  
  if (!isActive) return null
  
  return (
    <group ref={devastationRef} position={position}>
      {/* Large Explosion Effects */}
      {Array.from({ length: 15 }, (_, i) => {
        const angle = (i / 15) * Math.PI * 2
        const radius = 0.8 + Math.random() * 1.0
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <Sphere key={i} args={[0.08 + Math.random() * 0.04]} position={[x, 0.3, z]}>
            <meshStandardMaterial 
              color="#FF0000" 
              emissive="#FF0000"
              emissiveIntensity={0.9}
              transparent
              opacity={0.7}
            />
          </Sphere>
        )
      })}
      
      {/* Dense Smoke Clouds */}
      {Array.from({ length: 20 }, (_, i) => {
        const angle = (i / 20) * Math.PI * 2
        const radius = 1.2 + Math.random() * 0.8
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <Sphere key={`smoke-${i}`} args={[0.15 + Math.random() * 0.1]} 
            position={[x, 1.0 + Math.random() * 0.8, z]}>
            <meshStandardMaterial 
              color="#2D2D2D"
              transparent
              opacity={0.6}
            />
          </Sphere>
        )
      })}
      
      {/* Debris */}
      {Array.from({ length: 25 }, (_, i) => {
        const angle = Math.random() * Math.PI * 2
        const radius = 0.5 + Math.random() * 1.5
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <Box key={`debris-${i}`} 
            args={[0.05 + Math.random() * 0.08, 0.05 + Math.random() * 0.08, 0.05 + Math.random() * 0.08]} 
            position={[x, 0.1 + Math.random() * 0.4, z]}
            rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
          >
            <meshStandardMaterial color="#654321" />
          </Box>
        )
      })}
    </group>
  )
}

// Treasure/Coins component for Nader Shah's looting - moving towards Persia
const Treasure3D: FC<{ position: [number, number, number]; isActive: boolean }> = ({ position, isActive }) => {
  const treasureRef = useRef<any>(null)
  const [coinProgress, setCoinProgress] = useState(0)
  
  // No spinning animation
  
  // Animate coins moving towards Persia
  useEffect(() => {
    if (isActive && coinProgress < 1) {
      const interval = setInterval(() => {
        setCoinProgress(prev => {
          const newProgress = prev + 0.008 // Slower movement for more dramatic effect
          return newProgress >= 1 ? 1 : newProgress
        })
      }, 120)
      return () => clearInterval(interval)
    }
  }, [isActive, coinProgress])

  if (!isActive) return null

  return (
    <group ref={treasureRef} position={position}>
      {/* Central Treasure Pile */}
      <Box args={[0.6, 0.4, 0.6]} position={[0, 0.2, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>

      {/* Golden Coins moving towards Persia */}
      {Array.from({ length: 25 }, (_, i) => {
        const angle = (i / 25) * Math.PI * 2
        const baseRadius = 0.3 + Math.random() * 0.4
        
        // Calculate movement towards Persia (northwest direction)
        const persiaDirection = [-2, 0, -1.5] // Northwest towards Persia
        const movementDistance = coinProgress * 4 // Distance coins travel
        
        const x = Math.cos(angle) * baseRadius + persiaDirection[0] * movementDistance
        const z = Math.sin(angle) * baseRadius + persiaDirection[2] * movementDistance
        const y = 0.3 + Math.random() * 0.2

        return (
          <Cylinder key={`coin-${i}`} args={[0.04, 0.04, 0.008]} 
            position={[x, y, z]}
          >
            <meshStandardMaterial 
              color="#FFD700" 
              emissive="#FFD700" 
              emissiveIntensity={0.6}
              metalness={0.8}
              roughness={0.1}
            />
          </Cylinder>
        )
      })}

      {/* Treasure Label */}
      <Text
        position={[0, 1.0, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        LOOT TO PERSIA
      </Text>
    </group>
  )
}

// Empire End for Bahadur Shah Zafar - Trial, Exile, and End of Mughal Dynasty
const EmpireEnd3D: FC<{ 
  empireData: any
  isActive: boolean
}> = ({ empireData, isActive }) => {
  const groupRef = useRef<any>(null)
  const [phase, setPhase] = useState<'court' | 'trial' | 'exile' | 'end'>('court')
  const [phaseProgress, setPhaseProgress] = useState(0)
  const [emperorOpacity, setEmperorOpacity] = useState(1)
  
  useEffect(() => {
    if (!isActive) return
    
    // Phase 1: Imperial Court (3 seconds)
    const courtTimer = setTimeout(() => {
      setPhase('trial')
      setPhaseProgress(0)
      
      // Phase 2: Trial begins (4 seconds)
      const trialTimer = setTimeout(() => {
        setPhase('exile')
        setPhaseProgress(0)
        
        // Phase 3: Exile and empire collapse (6 seconds)
        const exileTimer = setTimeout(() => {
          setPhase('end')
          setPhaseProgress(0)
          
          // Fade out emperor gradually
          const fadeInterval = setInterval(() => {
            setEmperorOpacity(prev => {
              const newOpacity = prev - 0.05
              if (newOpacity <= 0) {
                clearInterval(fadeInterval)
                return 0
              }
              return newOpacity
            })
          }, 200)
          
        }, 6000) // Exile phase duration
        
        return () => clearTimeout(exileTimer)
      }, 4000) // Trial phase duration
      
      return () => clearTimeout(trialTimer)
    }, 3000) // Court phase duration
    
    return () => clearTimeout(courtTimer)
  }, [isActive])
  
  // Progress animation for current phase
  useEffect(() => {
    if (isActive) {
      const progressInterval = setInterval(() => {
        setPhaseProgress(prev => Math.min(prev + 0.02, 1))
      }, 100)
      return () => clearInterval(progressInterval)
    }
  }, [isActive, phase])
  
  if (!isActive) return null
  
  const pos3D: [number, number, number] = [
    (empireData.court[1] - 75) * 0.1,
    0,
    (empireData.court[0] - 25) * 0.1
  ]
  
  return (
    <group ref={groupRef} position={pos3D}>
      {/* Red Fort - Imperial Court Building */}
      <group position={[0, 0, 0]}>
        {/* Main Fort Structure */}
        <Box args={[1.8, 1.0, 1.8]} position={[0, 0.5, 0]}>
          <meshStandardMaterial 
            color={phase === 'court' ? "#8B0000" : phase === 'trial' ? "#654321" : "#4A4A4A"} 
            emissive={phase === 'court' ? "#8B0000" : "#000000"} 
            emissiveIntensity={phase === 'court' ? 0.3 : 0} 
          />
        </Box>
        
        {/* Battlements */}
        {[[-0.8, 0.8], [0, 0.8], [0.8, 0.8], [-0.8, -0.8], [0.8, -0.8]].map((pos, i) => (
          <Box key={i} args={[0.15, 0.3, 0.15]} position={[pos[0], 1.15, pos[1]]}>
            <meshStandardMaterial 
              color={phase === 'court' ? "#A0522D" : "#696969"} 
            />
          </Box>
        ))}
        
        {/* Mughal Flag - fades during trial and exile */}
        {phase !== 'end' && (
          <Plane args={[0.4, 0.3]} position={[0, 1.4, 0]}>
            <meshStandardMaterial 
              color="#00FF00" 
              transparent 
              opacity={phase === 'court' ? 1 : phase === 'trial' ? 0.7 : 0.3} 
            />
          </Plane>
        )}
      </group>
      
      {/* Emperor Bahadur Shah Zafar */}
      {emperorOpacity > 0 && (
        <group position={[0, 0, 0.5]} scale={[1, 1, 1]}>
          {/* Emperor Body */}
          <Cylinder args={[0.08, 0.1, 0.4]} position={[0, 0.2, 0]}>
            <meshStandardMaterial 
              color={phase === 'court' ? "#8B0000" : phase === 'trial' ? "#4B0082" : "#2F2F2F"} 
              emissive={phase === 'court' ? "#8B0000" : "#000000"} 
              emissiveIntensity={phase === 'court' ? 0.2 : 0} 
              transparent 
              opacity={emperorOpacity} 
            />
          </Cylinder>
          
          {/* Emperor Head */}
          <Sphere args={[0.08]} position={[0, 0.45, 0]}>
            <meshStandardMaterial color="#D2B48C" transparent opacity={emperorOpacity} />
          </Sphere>
          
          {/* Imperial Crown - loses luster during trial */}
          <group position={[0, 0.55, 0]}>
            <Cylinder args={[0.1, 0.08, 0.06]}>
              <meshStandardMaterial 
                color="#FFD700" 
                emissive="#FFD700" 
                emissiveIntensity={phase === 'court' ? 0.5 : phase === 'trial' ? 0.2 : 0} 
                metalness={0.8} 
                roughness={phase === 'court' ? 0.2 : 0.8} 
                transparent 
                opacity={emperorOpacity} 
              />
            </Cylinder>
          </group>
          
          {/* Beard (he was elderly) */}
          <Cylinder args={[0.03, 0.05, 0.1]} position={[0, 0.35, 0.08]}>
            <meshStandardMaterial color="#F5F5F5" transparent opacity={emperorOpacity} />
          </Cylinder>
        </group>
      )}
      
      {/* British Officers (appear during trial phase) */}
      {phase === 'trial' && phaseProgress > 0.3 && [
        [-0.6, 0], [0.6, 0], [-0.3, -0.5], [0.3, -0.5]
      ].map((pos, i) => (
        <group key={i} position={[pos[0], 0, pos[1]]}>
          <Cylinder args={[0.05, 0.07, 0.3]} position={[0, 0.15, 0]}>
            <meshStandardMaterial color="#8B0000" />
          </Cylinder>
          <Sphere args={[0.06]} position={[0, 0.33, 0]}>
            <meshStandardMaterial color="#F5DEB3" />
          </Sphere>
          {/* British military cap */}
          <Cylinder args={[0.07, 0.05, 0.04]} position={[0, 0.42, 0]}>
            <meshStandardMaterial color="#2F4F4F" />
          </Cylinder>
        </group>
      ))}
      
      {/* Chains (during exile phase) */}
      {phase === 'exile' && phaseProgress > 0.2 && (
        <group position={[0, 0.1, 0.5]}>
          <Cylinder args={[0.01, 0.01, 0.3]} position={[-0.1, 0, 0]} rotation={[0, 0, Math.PI/6]}>
            <meshStandardMaterial color="#696969" />
          </Cylinder>
          <Cylinder args={[0.01, 0.01, 0.3]} position={[0.1, 0, 0]} rotation={[0, 0, -Math.PI/6]}>
            <meshStandardMaterial color="#696969" />
          </Cylinder>
        </group>
      )}
      
      {/* Phase-specific text and effects */}
      {phase === 'court' && (
        <Text
          position={[0, 2.8, 0]}
          fontSize={0.25}
          color="#FFD700"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
        >
          LAST MUGHAL EMPEROR
        </Text>
      )}
      
      {phase === 'trial' && (
        <Text
          position={[0, 2.8, 0]}
          fontSize={0.25}
          color="#FF0000"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
        >
          TRIAL FOR TREASON
        </Text>
      )}
      
      {phase === 'exile' && (
        <Text
          position={[0, 2.8, 0]}
          fontSize={0.25}
          color="#8A2BE2"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
        >
          EXILED TO BURMA
        </Text>
      )}
      
      {phase === 'end' && (
        <Text
          position={[0, 2.8, 0]}
          fontSize={0.25}
          color="#2F2F2F"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
        >
          END OF MUGHAL EMPIRE
        </Text>
      )}
      
      {/* Falling empire particles (during end phase) */}
      {phase === 'end' && Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const radius = 0.8 + Math.random() * 0.5
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const fallY = 1.5 - (phaseProgress * 2.0) // Particles fall down
        
        if (fallY < 0) return null
        
        return (
          <Sphere key={i} args={[0.02]} position={[x, fallY, z]}>
            <meshStandardMaterial 
              color="#FFD700" 
              emissive="#FFD700" 
              emissiveIntensity={0.3} 
              transparent 
              opacity={0.7 * (1 - phaseProgress)} 
            />
          </Sphere>
        )
      })}
      
      {/* British Union Jack flag appears at the end */}
      {phase === 'end' && phaseProgress > 0.5 && (
        <Plane args={[0.4, 0.3]} position={[0, 1.4, 0]}>
          <meshStandardMaterial 
            color="#FF0000" 
            transparent 
            opacity={phaseProgress} 
          />
        </Plane>
      )}
    </group>
  )
}

// 3D Scene Container
const ThreeJSOverlay: FC<{ 
  elements: Array<{
    type: string
    position: [number, number]
    data: any
  }>
  isActive: boolean
}> = ({ elements, isActive }) => {
  if (!isActive || elements.length === 0) return null
  
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 1000
    }}>
      <Canvas camera={{ position: [0, 8, 6], fov: 60 }} style={{ background: 'transparent' }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
          <pointLight position={[-5, 5, -5]} intensity={0.8} color="#FFA500" />
          
          {elements.map((element, i) => {
            const pos3D: [number, number, number] = [
              (element.position[1] - 75) * 0.1,
              0,
              (element.position[0] - 25) * 0.1
            ]
            
            switch (element.type) {
              case 'army':
                return (
                  <Army3D
                    key={`army-${i}`}
                    position={pos3D}
                    color={element.data.color}
                    size={element.data.size}
                    name={element.data.name}
                    isDeployed={element.data.isDeployed}
                    isVictorious={element.data.isVictorious}
                    onDeployComplete={element.data.onDeployComplete}
                  />
                )
              case 'battle':
                return (
                  <BattleEffect3D
                    key={`battle-${i}`}
                    position={pos3D}
                    isActive={element.data.isActive}
                    intensity={element.data.intensity}
                  />
                )
              case 'emperorExile':
                return (
                  <EmperorExile3D
                    key={`emperorExile-${i}`}
                    exileData={element.data.exileData}
                    isActive={element.data.isActive}
                  />
                )
              case 'foundation':
                return (
                  <Foundation3D
                    key={`foundation-${i}`}
                    foundationData={element.data.foundationData}
                    isActive={element.data.isActive}
                  />
                )
              case 'coronation':
                return (
                  <Coronation3D
                    key={`coronation-${i}`}
                    coronationData={element.data.coronationData}
                    isActive={element.data.isActive}
                  />
                )
              case 'conquest':
                return (
                  <Conquest3D
                    key={`conquest-${i}`}
                    conquestData={element.data.conquestData}
                    isActive={element.data.isActive}
                  />
                )
              case 'religious':
                return (
                  <Religious3D
                    key={`religious-${i}`}
                    religiousData={element.data.religiousData}
                    isActive={element.data.isActive}
                  />
                )
              case 'diplomatic':
                return (
                  <Diplomatic3D
                    key={`diplomatic-${i}`}
                    diplomaticData={element.data.diplomaticData}
                    isActive={element.data.isActive}
                  />
                )
              case 'construction':
                return (
                  <Construction3D
                    key={`construction-${i}`}
                    constructionData={element.data.constructionData}
                    isActive={element.data.isActive}
                  />
                )
              case 'independence':
                return (
                  <Independence3D
                    key={`independence-${i}`}
                    independenceData={element.data.independenceData}
                    isActive={element.data.isActive}
                  />
                )
              case 'expansion':
                return (
                  <Expansion3D
                    key={`expansion-${i}`}
                    expansionData={element.data.expansionData}
                    isActive={element.data.isActive}
                  />
                )
              case 'invasion':
                return (
                  <Invasion3D
                    key={`invasion-${i}`}
                    invasionData={element.data.invasionData}
                    isActive={element.data.isActive}
                  />
                )
              case 'monument':
                return (
                  <Monument3D
                    key={`monument-${i}`}
                    position={pos3D}
                    type={element.data.type}
                    name={element.data.name}
                    isActive={element.data.isActive}
                  />
                )
              case 'ship':
                return (
                  <Ship3D
                    key={`ship-${i}`}
                    position={pos3D}
                    isActive={element.data.isActive}
                  />
                )
              case 'ceremony':
                return (
                  <Ceremony3D
                    key={`ceremony-${i}`}
                    position={pos3D}
                    leader={element.data.leader}
                    isActive={element.data.isActive}
                  />
                )
              case 'devastation':
                return (
                  <Devastation3D
                    key={`devastation-${i}`}
                    position={pos3D}
                    intensity={element.data.intensity}
                    isActive={element.data.isActive}
                  />
                )
              case 'treasure':
                return (
                  <Treasure3D
                    key={`treasure-${i}`}
                    position={pos3D}
                    isActive={element.data.isActive}
                  />
                )
              case 'empireEnd':
                return (
                  <EmpireEnd3D
                    key={`empireEnd-${i}`}
                    empireData={element.data.empireData}
                    isActive={element.data.isActive}
                  />
                )
              default:
  return null
}
          })}
          
          <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
        </Suspense>
      </Canvas>
    </div>
  )
}

// --- CAMERA SEQUENCE MANAGER ---
const CameraSequence: FC<{ 
  battleData: any
  isActive: boolean
  onSequenceComplete: () => void
}> = ({ battleData, isActive, onSequenceComplete }) => {
  const map = useMap()
  const [phase, setPhase] = useState<'panning' | 'complete'>('panning')
  
  useEffect(() => {
    if (!isActive || !battleData) return
    
    const executeCameraSequence = async () => {
      // Phase 1: Pan to battle area with boundaries visible
      const panPromise = new Promise<void>((resolve) => {
        map.flyTo(battleData.center, battleData.zoom, {
          duration: 3,
          easeLinearity: 0.1
        })
        setTimeout(resolve, 3200)
      })
      
      await panPromise
      setPhase('complete')
      onSequenceComplete()
    }
    
    executeCameraSequence()
  }, [map, battleData, isActive, onSequenceComplete])
  
  return null
}

// --- ARMY MOVEMENT MANAGER ---
const ArmyMovement: FC<{
  armies: any[]
  isActive: boolean
  onMovementComplete: () => void
}> = ({ armies, isActive, onMovementComplete }) => {
  const [armyStates, setArmyStates] = useState<{[key: string]: {
    position: [number, number]
    isDeployed: boolean
    isMoving: boolean
    isVictorious?: boolean // Added for losing armies
  }}>({})
  
  const [deployedCount, setDeployedCount] = useState(0)
  const [movementComplete, setMovementComplete] = useState(false)
  
  // Initialize army states
  useEffect(() => {
    const initialStates: any = {}
    armies.forEach(army => {
      initialStates[army.id] = {
        position: army.startPosition,
        isDeployed: false,
        isMoving: false,
        isVictorious: army.isVictorious || true
      }
    })
    setArmyStates(initialStates)
    setDeployedCount(0)
    setMovementComplete(false)
  }, [armies])
  
  // Start deployment when active
  useEffect(() => {
    if (isActive && Object.keys(armyStates).length > 0) {
      const timer = setTimeout(() => {
        setArmyStates(prev => {
          const newStates = { ...prev }
          Object.keys(newStates).forEach(armyId => {
            newStates[armyId].isDeployed = true
          })
          return newStates
        })
      }, 1000) // Deploy armies 1 second after camera completes
      
      return () => clearTimeout(timer)
    }
  }, [isActive, armyStates])
  
  // Handle army deployment completion
  const handleArmyDeployed = (armyId: string) => {
    setDeployedCount(prev => {
      const newCount = prev + 1
      if (newCount === armies.length) {
        // All armies deployed, start movement
        setTimeout(() => {
          setArmyStates(prevStates => {
            const newStates = { ...prevStates }
            Object.keys(newStates).forEach(id => {
              newStates[id].isMoving = true
              const army = armies.find(a => a.id === id)
              if (army) {
                // Animate movement to battle position
                let progress = 0
                const moveInterval = setInterval(() => {
                  progress += 0.02 // Faster movement
                  if (progress >= 1) {
                    newStates[id].position = army.battlePosition
                    clearInterval(moveInterval)
                    // Check if all movements complete
                    const allMoved = Object.values(newStates).every(state => !state.isMoving || progress >= 1)
                    if (allMoved && !movementComplete) {
                      setMovementComplete(true)
                      setTimeout(() => onMovementComplete(), 500)
                    }
                  } else {
                    const startPos = army.startPosition
                    const endPos = army.battlePosition
                    const currentPos: [number, number] = [
                      startPos[0] + (endPos[0] - startPos[0]) * progress,
                      startPos[1] + (endPos[1] - startPos[1]) * progress
                    ]
                    newStates[id].position = currentPos
                  }
                }, 60) // Faster intervals
              }
            })
            return newStates
          })
        }, 1500) // Reduced wait time after deployment
      }
      return newCount
    })
  }
  
  return (
    <ThreeJSOverlay
      elements={armies.map(army => ({
        type: 'army',
        position: armyStates[army.id]?.position || army.startPosition,
        data: {
          ...army,
          isDeployed: armyStates[army.id]?.isDeployed || false,
          onDeployComplete: () => handleArmyDeployed(army.id),
          isVictorious: armyStates[army.id]?.isVictorious || true // Pass current victory status
        }
      }))}
      isActive={isActive}
    />
  )
}

// --- MAIN BATTLE SEQUENCE ---
const BattleSequence: FC<{ event: any; isActive: boolean }> = ({ event, isActive }) => {
  const [phase, setPhase] = useState<'camera' | 'armies' | 'battle' | 'complete'>('camera')
  const [battleData, setBattleData] = useState<any>(null)
  
  useEffect(() => {
    if (isActive && event.year) {
      const data = BATTLE_DATA[event.year as keyof typeof BATTLE_DATA]
      if (data) {
        setBattleData(data)
        setPhase('camera')
      }
    }
  }, [isActive, event.year])
  
  const handleCameraComplete = () => {
    setPhase('armies')
  }
  
  const handleArmiesComplete = () => {
    setPhase('battle')
  }
  
  if (!isActive || !battleData) return null
  
  // Generate appropriate 3D elements based on battle data type
  const get3DElements = () => {
    const elements: any[] = []
    
    // Handle foundation events (1526 - Babur's coronation)
    if (battleData.foundation && phase === 'battle') {
      elements.push({
        type: 'foundation',
        position: battleData.foundation.coronation.position,
        data: {
          foundationData: battleData.foundation,
          isActive: true
        }
      })
    }
    
    // Handle coronation events (1556 - Akbar's coronation)
    if (battleData.coronation && phase === 'battle') {
      elements.push({
        type: 'coronation',
        position: battleData.coronation.position,
        data: {
          coronationData: battleData.coronation,
          isActive: true
        }
      })
    }
    
    // Handle conquest events (1572 - Gujarat conquest)
    if (battleData.conquest && phase === 'battle') {
      elements.push({
        type: 'conquest',
        position: battleData.conquest.celebration.position,
        data: {
          conquestData: battleData.conquest,
          isActive: true
        }
      })
    }
    
    // Handle religious events (1582 - Din-i Ilahi)
    if (battleData.religious && phase === 'battle') {
      elements.push({
        type: 'religious',
        position: battleData.religious.ceremony.position,
        data: {
          religiousData: battleData.religious,
          isActive: true
        }
      })
    }
    
    // Handle diplomatic events (1615 - East India Company)
    if (battleData.diplomatic && phase === 'battle') {
      elements.push({
        type: 'diplomatic',
        position: battleData.diplomatic.ceremony.position,
        data: {
          diplomaticData: battleData.diplomatic,
          isActive: true
        }
      })
    }
    
    // Handle construction events (1632 - Taj Mahal)
    if (battleData.construction && phase === 'battle') {
      elements.push({
        type: 'construction',
        position: battleData.monument.position,
        data: {
          constructionData: battleData.construction,
          isActive: true
        }
      })
    }
    
    // Handle independence events (1674 - Maratha coronation)
    if (battleData.independence && phase === 'battle') {
      elements.push({
        type: 'independence',
        position: battleData.independence.ceremony.position,
        data: {
          independenceData: battleData.independence,
          isActive: true
        }
      })
    }
    
    // Handle expansion events (1686 - Deccan conquest)
    if (battleData.expansion && phase === 'battle') {
      elements.push({
        type: 'expansion',
        position: battleData.expansion.territory.position,
        data: {
          expansionData: battleData.expansion,
          isActive: true
        }
      })
    }
    
    // Handle invasion events (1739 - Nader Shah)
    if (battleData.invasion && phase === 'battle') {
      elements.push({
        type: 'invasion',
        position: battleData.invasion.loot.position,
        data: {
          invasionData: battleData.invasion,
          isActive: true
        }
      })
    }
    
    // Handle monument construction events (fallback)
    if (battleData.monument && !battleData.construction && phase === 'battle') {
      elements.push({
        type: 'monument',
        position: battleData.monument.position,
        data: {
          type: battleData.monument.type,
          name: battleData.monument.name,
          isActive: true
        }
      })
    }
    
    // Handle trade routes with ships
    if (battleData.diplomatic?.tradeRoute && phase === 'battle') {
      battleData.diplomatic.tradeRoute.route.forEach((routePoint: [number, number], i: number) => {
        if (i > 0) { // Skip first point, place ships along route
          elements.push({
            type: 'ship',
            position: routePoint,
            data: { isActive: true }
          })
        }
      })
    }
    
    // Handle devastation effects
    if (battleData.invasion?.devastation && phase === 'battle') {
      elements.push({
        type: 'devastation',
        position: battleData.invasion.devastation.position,
        data: {
          intensity: battleData.invasion.devastation.intensity,
          isActive: true
        }
      })
    }
    
    // Handle Humayun's exile sequence (for 1540)
    if (battleData.exileSequence && phase === 'battle') {
      elements.push({
        type: 'emperorExile',
        position: battleData.exileSequence.defeatLocation,
        data: {
          exileData: battleData.exileSequence,
          isActive: true
        }
      })
    }
    
    // Handle empire end (for Bahadur Shah Zafar 1857)
    if (battleData.empireEnd && phase === 'battle') {
      elements.push({
        type: 'empireEnd',
        position: battleData.empireEnd.court,
        data: {
          empireData: battleData.empireEnd,
          isActive: true
        }
      })
    }
    
    return elements
  }

  return (
    <>
      {/* Boundaries */}
      {battleData.boundaries && (
        <Polygon
          positions={battleData.boundaries}
          pathOptions={{
            color: "#FFD700",
            weight: 3,
            opacity: 0.8,
            fillOpacity: 0.1,
            dashArray: "10, 5"
          }}
        />
      )}
      
      {/* Camera Sequence */}
      {phase === 'camera' && (
        <CameraSequence
          battleData={battleData}
          isActive={true}
          onSequenceComplete={handleCameraComplete}
        />
      )}
      
      {/* Army Movement (only for battles with armies) */}
      {phase === 'armies' && battleData.armies && (
        <ArmyMovement
          armies={battleData.armies}
          isActive={true}
          onMovementComplete={handleArmiesComplete}
        />
      )}
      
      {/* For non-army events, skip directly to battle phase */}
      {phase === 'armies' && !battleData.armies && 
        (() => {
          setTimeout(() => handleArmiesComplete(), 1000)
          return null
        })()
      }
      
      {/* Battle Effects - Standard battle effects for army conflicts */}
      {phase === 'battle' && battleData.armies && battleData.type !== 'defeatAndExile' && (
        <ThreeJSOverlay
          elements={[{
            type: 'battle',
            position: battleData.center,
            data: { 
              isActive: true, 
              intensity: 1.5
            }
          }]}
          isActive={true}
        />
      )}
      
      {/* Special Event Elements - Monuments, ceremonies, ships, etc. */}
      {(phase === 'battle' || (phase === 'armies' && !battleData.armies)) && (
        <ThreeJSOverlay
          elements={get3DElements()}
          isActive={true}
        />
      )}
    </>
  )
}

// --- CLEAN MAP COMPONENT ---
const MapResizer = () => {
  const map = useMap()
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100)
    return () => clearTimeout(timer)
  }, [map])
  return null
}

export const InteractiveMap: FC<{ event: any; isSpeaking?: boolean }> = ({ 
  event, 
  isSpeaking = false 
}) => {
  const [cinematicActive, setCinematicActive] = useState(false)

  useEffect(() => {
    if (isSpeaking) {
      setCinematicActive(true)
    } else {
      const timer = setTimeout(() => setCinematicActive(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isSpeaking])

  return (
    <div className="relative w-full h-full overflow-hidden">
    <MapContainer
        center={event.animation?.center || [28, 77]}
        zoom={event.animation?.zoom || 5}
      scrollWheelZoom={true}
        className="w-full h-full bg-gray-900"
      attributionControl={false}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png" />
      <MapResizer />

        <BattleSequence event={event} isActive={cinematicActive} />
      </MapContainer>

      {cinematicActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-4 right-4 z-[1000] pointer-events-none"
        >
          <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            CINEMATIC BATTLE MODE
          </div>
        </motion.div>
      )}
    </div>
  )
}