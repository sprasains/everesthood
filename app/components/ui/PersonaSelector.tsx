"use client"
import { motion } from "framer-motion"
import { Persona, PersonaConfig } from "@/types"
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react"

interface PersonaSelectorProps {
  onPersonaChange?: (persona: Persona) => void
  className?: string
}

interface CustomPersona {
  id: string;
  name: string;
  prompt: string;
  icon?: string;
}

export default function PersonaSelector({ onPersonaChange, className = "" }: PersonaSelectorProps) {
  const { user, updateUser } = useUser();
  const [customPersonas, setCustomPersonas] = useState<CustomPersona[]>([]);

  useEffect(() => {
    // Fetch custom personas for the logged-in user
    const fetchCustomPersonas = async () => {
      const res = await fetch("/api/v1/personas");
      if (res.ok) setCustomPersonas(await res.json());
    };
    fetchCustomPersonas();
  }, []);

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

  const handlePersonaSelect = async (personaId: string) => {
    if (!user) return;
    // Allow any personaId (default or custom)
    await updateUser({ persona: personaId });
    onPersonaChange?.(personaId as any);
  };

  return (
    <div className={`space-y-4 ${className}`} data-testid="persona-selector">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Choose Your AI Mentor</h3>
        <p className="text-gray-400 text-sm">Each persona offers a unique perspective and tone</p>
      </div>

      {/* Default Personas */}
      <div className="mb-2">
        <h5 className="text-white/80 text-xs mb-1">Default Personas</h5>
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
              {user?.persona === persona.id && (
                <div className="absolute top-2 right-2">
                  <span className="text-white text-lg">✓</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Custom Personas */}
      {customPersonas.length > 0 && (
        <div>
          <h5 className="text-white/80 text-xs mb-1 mt-4">Your Personas</h5>
          <div className="grid grid-cols-2 gap-4">
            {customPersonas.map((persona) => (
              <motion.div
                key={persona.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePersonaSelect(persona.id)}
                className={`
                  relative p-6 rounded-xl cursor-pointer transition-all
                  ${user?.persona === persona.id ? 'ring-2 ring-yellow-400' : ''}
                  bg-gradient-to-br from-yellow-400 to-orange-500
                `}
              >
                <h4 className="font-bold text-white mb-2">{persona.icon || "🤖"} {persona.name}</h4>
                <p className="text-sm text-white/80">{persona.prompt.slice(0, 60)}{persona.prompt.length > 60 ? "..." : ""}</p>
                {user?.persona === persona.id && (
                  <div className="absolute top-2 right-2">
                    <span className="text-yellow-400 text-lg">✓</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

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