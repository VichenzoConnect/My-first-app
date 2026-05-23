import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ParrotMascot } from '@/components/ParrotMascot';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Globe2, Zap, Sparkles, MessageSquare } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/lib/languages';

export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col pt-12 overflow-hidden">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 flex flex-col lg:flex-row items-center justify-between gap-12 flex-1">
        <motion.div 
          className="flex-1 text-center lg:text-left z-10"
          initial="hidden"
          animate="show"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-block mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md text-primary font-medium text-sm">
            AI-Powered Translation Experience
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
            Speak Any Language. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">Let the Parrot Translate</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0">
            Ditch the boring translators. Experience language learning that feels playful, alive, and electric. Your personal polyglot parrot awaits.
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link href="/translate">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_-5px_rgba(0,212,170,0.5)]">
                Start Translating Now
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          className="flex-1 flex justify-center items-center relative z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
        >
          <div className="relative w-80 h-80 lg:w-[450px] lg:h-[450px] flex items-center justify-center">
            {/* Decorative background glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-secondary/30 rounded-full blur-[80px]" />
            <ParrotMascot state="talking" className="w-64 h-64 lg:w-96 lg:h-96 drop-shadow-[0_0_50px_rgba(34,197,94,0.3)]" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-900/50 backdrop-blur-lg border-y border-white/5 py-24 relative z-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">Why Parrot is Different</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Not just another utility tool. We brought translation to life with personality and flair.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Sparkles className="w-6 h-6 text-primary" />, title: "Chaos Mode", desc: "For when you want translation with extra unhinged internet energy." },
              { icon: <Zap className="w-6 h-6 text-secondary" />, title: "Lightning Fast", desc: "Instant translations powered by top-tier AI models." },
              { icon: <Globe2 className="w-6 h-6 text-accent" />, title: "13 Languages", desc: "From English to Hausa, explore the world's diverse voices." },
              { icon: <MessageSquare className="w-6 h-6 text-blue-400" />, title: "Voice Ready", desc: "Speak naturally, listen to the perfect pronunciation." }
            ].map((f, i) => (
              <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Languages Banner */}
      <section className="py-12 border-b border-white/5 bg-black/40 overflow-hidden">
        <div className="flex gap-8 px-4 w-max animate-[slide_30s_linear_infinite]">
          {/* Double the list for infinite scroll effect */}
          {[...SUPPORTED_LANGUAGES, ...SUPPORTED_LANGUAGES].map((lang, i) => (
            <div key={`${lang.code}-${i}`} className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-slate-300 font-medium">
              <span className="text-primary">•</span>
              {lang.name}
            </div>
          ))}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 border-t border-white/5 bg-background">
        <p>Built with ❤️ by Replit Agent</p>
      </footer>
    </div>
  );
}
