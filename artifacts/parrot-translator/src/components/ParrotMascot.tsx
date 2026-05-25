import React from 'react';
import { motion } from 'framer-motion';

export type ParrotState = 'idle' | 'listening' | 'translating' | 'talking' | 'excited';

interface ParrotMascotProps {
  state: ParrotState;
  chaosMode?: boolean;
  className?: string;
}

export function ParrotMascot({ state, chaosMode = false, className = '' }: ParrotMascotProps) {
  const isTranslating = state === 'translating';
  const isTalking = state === 'talking';
  const isExcited = state === 'excited';
  const isListening = state === 'listening';

  // Base animations
  const bodyVariants = {
    idle: { y: [0, -5, 0], rotate: 0, transition: { repeat: Infinity, duration: 2, ease: "easeInOut" as const } },
    listening: { y: [0, -2, 0], scale: 1.05, rotate: 5, transition: { repeat: Infinity, duration: 1 } },
    translating: { y: [0, -10, 0], rotate: [-5, 5, -5], transition: { repeat: Infinity, duration: 0.5 } },
    talking: { y: [0, -5, 0], transition: { repeat: Infinity, duration: 0.3 } },
    excited: { y: [0, -20, 0], rotate: [0, 360], transition: { duration: 0.6, repeat: Infinity } },
  };

  const wingVariants = {
    idle: { rotate: 0 },
    listening: { rotate: 10 },
    translating: { rotate: [-20, 20, -20], transition: { repeat: Infinity, duration: 0.2 } },
    talking: { rotate: [-10, 10, -10], transition: { repeat: Infinity, duration: 0.3 } },
    excited: { rotate: [-45, 45, -45], transition: { repeat: Infinity, duration: 0.1 } },
  };

  const beakVariants = {
    idle: { rotate: 0 },
    talking: { rotate: [0, 15, 0], transition: { repeat: Infinity, duration: 0.2 } },
    excited: { rotate: 20 },
    translating: { rotate: 0 },
    listening: { rotate: -5 }
  };

  const eyeVariants = {
    idle: { scaleY: [1, 0.1, 1], transition: { repeat: Infinity, duration: 4, times: [0, 0.05, 0.1] } },
    listening: { scale: 1.2 },
    translating: { rotate: 360, transition: { repeat: Infinity, duration: 0.5, ease: "linear" as const } },
    excited: { scale: 1.5, rotate: [0, 180, 360], transition: { repeat: Infinity, duration: 0.5 } },
    talking: { scale: 1 }
  };

  const currentVariant = chaosMode ? 'excited' : state;

  return (
    <div className={`relative w-40 h-40 flex items-center justify-center ${className}`}>
      {/* Background glow when listening or translating */}
      {(isListening || isTranslating || chaosMode) && (
        <motion.div 
          className={`absolute inset-0 rounded-full blur-2xl opacity-50 z-0 ${chaosMode ? 'bg-red-500' : 'bg-primary'}`}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: chaosMode ? 0.3 : 1 }}
        />
      )}

      <motion.svg
        viewBox="0 0 200 200"
        className="w-full h-full z-10 relative drop-shadow-xl"
        variants={bodyVariants}
        animate={currentVariant}
        style={{ filter: chaosMode ? 'hue-rotate(90deg) saturate(2)' : 'none' }}
      >
        {/* Tail */}
        <motion.path 
          d="M 100 140 C 120 180 140 190 140 190 C 130 160 110 140 100 140 Z" 
          fill="#0ea5e9"
          animate={{ rotate: isExcited ? [-10, 10, -10] : [0, 2, 0] }}
          transition={{ repeat: Infinity, duration: isExcited ? 0.2 : 2 }}
          style={{ transformOrigin: "100px 140px" }}
        />
        
        {/* Body */}
        <path d="M 60 90 C 60 40 100 30 120 40 C 140 50 140 80 130 110 C 120 140 80 150 70 120 C 60 90 60 90 60 90 Z" fill="#22c55e" />
        
        {/* Wing */}
        <motion.path 
          d="M 80 80 C 100 80 120 100 110 130 C 100 140 70 120 80 80 Z" 
          fill="#fbbf24"
          variants={wingVariants}
          animate={currentVariant}
          style={{ transformOrigin: "80px 80px" }}
        />

        {/* Head/Face area */}
        <path d="M 85 45 C 95 35 115 35 125 45 C 135 55 130 75 115 85 C 95 95 80 85 85 45 Z" fill="#10b981" />
        
        {/* Beak Top */}
        <path d="M 120 55 C 145 55 155 70 155 70 C 155 70 140 80 125 75 Z" fill="#f59e0b" />
        
        {/* Beak Bottom (Animated) */}
        <motion.path 
          d="M 125 75 C 135 80 145 75 145 75 C 145 75 135 85 125 80 Z" 
          fill="#d97706"
          variants={beakVariants}
          animate={currentVariant}
          style={{ transformOrigin: "125px 75px" }}
        />

        {/* Eye */}
        <motion.g 
          variants={eyeVariants} 
          animate={currentVariant}
          style={{ transformOrigin: "105px 55px" }}
        >
          <circle cx="105" cy="55" r="8" fill="white" />
          <circle cx="108" cy="55" r="4" fill="#0f172a" />
          {chaosMode && (
            <path d="M 98 48 L 112 50" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          )}
        </motion.g>

        {/* Chaos Stars */}
        {chaosMode && (
          <motion.g animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ transformOrigin: "100px 100px" }}>
            <text x="30" y="40" fontSize="24" fill="#fbbf24">✨</text>
            <text x="160" y="150" fontSize="24" fill="#ef4444">💥</text>
            <text x="150" y="30" fontSize="24" fill="#00d4aa">🔥</text>
          </motion.g>
        )}
        
        {/* Translating / Listening Indicators */}
        {isListening && !chaosMode && (
          <motion.path 
            d="M 140 30 Q 150 20 160 30" 
            stroke="#00d4aa" strokeWidth="3" fill="none" strokeLinecap="round"
            animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        )}
      </motion.svg>
    </div>
  );
}
