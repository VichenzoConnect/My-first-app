import React from 'react';
import { Link, useLocation } from 'wouter';
import { useChaos } from '@/lib/ChaosContext';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';

export function Navbar() {
  const [location] = useLocation();
  const { chaosMode, toggleChaosMode } = useChaos();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <motion.div 
            animate={{ rotate: chaosMode ? [0, -10, 10, 0] : 0 }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="text-2xl"
          >
            🦜
          </motion.div>
          <span className="font-bold text-xl tracking-tight text-white hidden sm:block">
            Parrot <span className="text-primary">Translator</span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4">
            <Link href="/translate" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/translate' ? 'text-primary' : 'text-slate-300'}`}>
              Translate
            </Link>
            <Link href="/history" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/history' ? 'text-primary' : 'text-slate-300'}`}>
              History
            </Link>
            <Link href="/favorites" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/favorites' ? 'text-primary' : 'text-slate-300'}`}>
              Favorites
            </Link>
          </div>

          <div className="flex items-center gap-2 border-l border-white/10 pl-6">
            <span className={`text-sm font-bold ${chaosMode ? 'text-red-500' : 'text-slate-400'}`}>
              Chaos Mode
            </span>
            <Switch 
              checked={chaosMode} 
              onCheckedChange={toggleChaosMode}
              className={chaosMode ? 'bg-red-500' : ''}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
