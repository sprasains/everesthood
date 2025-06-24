"use client"
import { motion } from "framer-motion"
import { Persona, PersonaConfig } from "@/types"
import { useUser } from "@/hooks/useUser"

interface PersonaSelectorProps {
  onPersonaChange?: (persona: Persona) => void
  className?: string
}

export default function PersonaSelector({ onPersonaChange, className = "" }: PersonaSelectorProps) {
  const { user, updateUser } = useUser()

  const personas: PersonaConfig[] = [
    {
      id: "ZenGPT",
      name: "ZenGPT 🧘‍♀️",
      description: "Calm, mindful AI guide",
      theme: "from-purple-600 to-indigo-600",
      unlocked: true
    },
    {
      id: "HustleBot", 
      name: "HustleBot 🔥",
      description: "High-energy startup mentor",
      theme: "from-pink-600 to-orange-600",
      unlocked: (user?.level || 1) >= 3
    },
    {
      id: "DataDaddy",
      name: "DataDaddy 📊", 
      description: "Analytical insights master",
      theme: "from-blue-600 to-purple-600",
      unlocked: (user?.level || 1) >= 5
    },
    {
      id: "CoachAda",
      name: "CoachAda 💪",
      description: "Supportive career coach",
      theme: "from-green-600 to-blue-600", 
      unlocked: (user?.level || 1) >= 7
    }
  ]

  const handlePersonaSelect = async (persona: Persona) => {
    if (!user) return

    const selectedPersona = personas.find(p => p.id === persona)
    if (!selectedPersona?.unlocked) return

    await updateUser({ persona })
    onPersonaChange?.(persona)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Choose Your AI Mentor</h3>
        <p className="text-gray-400 text-sm">Each persona offers a unique perspective and tone</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {personas.map((persona) => (
          <motion.div
            key={persona.id}
            whileHover={{ scale: persona.unlocked ? 1.05 : 1 }}
            whileTap={{ scale: persona.unlocked ? 0.95 : 1 }}
            onClick={() => persona.unlocked && handlePersonaSelect(persona.id)}
            className={`
              relative p-6 rounded-xl cursor-pointer transition-all
              ${persona.unlocked ? 'opacity-100' : 'opacity-50 cursor-not-allowed'}
              ${user?.persona === persona.id ? 'ring-2 ring-white' : ''}
              bg-gradient-to-br ${persona.theme}
            `}
          >
            <h4 className="font-bold text-white mb-2">{persona.name}</h4>
            <p className="text-sm text-white/80">{persona.description}</p>

            {!persona.unlocked && (
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <span className="text-white text-sm block">🔒 Locked</span>
                  <span className="text-white/70 text-xs">
                    Level {Math.ceil(personas.findIndex(p => p.id === persona.id) * 2 + 3)} required
                  </span>
                </div>
              </div>
            )}

            {user?.persona === persona.id && (
              <div className="absolute top-2 right-2">
                <span className="text-white text-lg">✓</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Persona Benefits */}
      <div className="bg-gray-800 rounded-lg p-4 mt-4">
        <h4 className="text-sm font-semibold text-white mb-2">🎯 Current Persona Benefits:</h4>
        <div className="text-xs text-gray-300 space-y-1">
          {user?.persona === "ZenGPT" && (
            <div>• Mindful summaries focused on balance and clarity</div>
          )}
          {user?.persona === "HustleBot" && (
            <div>• High-energy insights with growth opportunities</div>
          )}
          {user?.persona === "DataDaddy" && (
            <div>• Data-driven analysis with charts and metrics</div>
          )}
          {user?.persona === "CoachAda" && (
            <div>• Career-focused guidance with encouragement</div>
          )}
        </div>
      </div>
    </div>
  )
}