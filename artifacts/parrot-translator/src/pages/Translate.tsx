import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslate, useAddHistory, useAddFavorite, useGetPhraseOfDay, getListHistoryQueryKey, getListFavoritesQueryKey } from '@workspace/api-client-react';
import { ParrotMascot, ParrotState } from '@/components/ParrotMascot';
import { useChaos } from '@/lib/ChaosContext';
import { generateChaosResponse } from '@/lib/chaos';
import { SUPPORTED_LANGUAGES, getLanguageName } from '@/lib/languages';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Volume2, Copy, Share2, Heart, ArrowRightLeft, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LOADING_MESSAGES = [
  "Parrot is decoding human language...",
  "Teaching the parrot new words...",
  "Cracking international vibes...",
  "Parrot is flying across borders..."
];

export default function Translate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { chaosMode } = useChaos();

  // State
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('es');
  const [parrotState, setParrotState] = useState<ParrotState>('idle');
  const [chaosResponse, setChaosResponse] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  // APIs
  const translateMutation = useTranslate();
  const addHistoryMutation = useAddHistory();
  const addFavoriteMutation = useAddFavorite();
  const { data: phraseOfDay } = useGetPhraseOfDay();

  // Speech Recognition Setup
  const recognitionRef = useRef<any>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setSourceText(transcript);
          setIsRecording(false);
          setParrotState('idle');
        };
        
        recognitionRef.current.onerror = () => {
          setIsRecording(false);
          setParrotState('idle');
          toast({ title: "Microphone error", variant: "destructive" });
        };
      }
    }
  }, [toast]);

  // Loading messages rotation
  useEffect(() => {
    if (translateMutation.isPending) {
      const interval = setInterval(() => {
        setLoadingMsgIdx(i => (i + 1) % LOADING_MESSAGES.length);
      }, 1500);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [translateMutation.isPending]);

  const handleTranslate = () => {
    if (!sourceText.trim()) return;

    setParrotState('translating');
    setChaosResponse(null);

    translateMutation.mutate(
      { data: { text: sourceText, source: sourceLang, target: targetLang } },
      {
        onSuccess: (res) => {
          setTranslatedText(res.translatedText);
          setParrotState('excited');
          
          if (chaosMode) {
            setChaosResponse(generateChaosResponse(sourceText));
          }

          // Save to history
          addHistoryMutation.mutate({
            data: {
              originalText: res.originalText,
              translatedText: res.translatedText,
              sourceLanguage: res.source,
              targetLanguage: res.target
            }
          }, {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: getListHistoryQueryKey() });
            }
          });

          // Return to idle after excitement
          setTimeout(() => setParrotState('idle'), 2000);
        },
        onError: () => {
          setParrotState('idle');
          toast({ title: "Translation failed", description: "The parrot dropped the message.", variant: "destructive" });
        }
      }
    );
  };

  const handleSwap = () => {
    if (sourceLang === 'auto') return;
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
    setChaosResponse(null);
  };

  const handleSpeak = (text: string, lang: string) => {
    if (!window.speechSynthesis) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'auto' ? 'en' : lang; // Fallback to en if auto
    
    if (chaosMode) {
      utterance.pitch = 1.5;
      utterance.rate = 1.2;
    }
    
    utterance.onstart = () => setParrotState('talking');
    utterance.onend = () => setParrotState('idle');
    utterance.onerror = () => setParrotState('idle');

    window.speechSynthesis.speak(utterance);
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      setParrotState('idle');
    } else {
      setSourceText('');
      if (recognitionRef.current) {
        recognitionRef.current.lang = sourceLang === 'auto' ? 'en-US' : `${sourceLang}-${sourceLang.toUpperCase()}`;
        recognitionRef.current.start();
        setIsRecording(true);
        setParrotState('listening');
      } else {
        toast({ title: "Speech recognition not supported", variant: "destructive" });
      }
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard!" });
    } catch (e) {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Parrot Translator',
          text: `${sourceText} -> ${translatedText}`
        });
      } catch (e) {
        // user cancelled
      }
    } else {
      copyToClipboard(`${sourceText} -> ${translatedText}`);
    }
  };

  const handleSaveFavorite = () => {
    if (!translatedText) return;
    
    const finalSourceLang = sourceLang === 'auto' && translateMutation.data?.detectedLanguage 
      ? translateMutation.data.detectedLanguage 
      : sourceLang;

    addFavoriteMutation.mutate({
      data: {
        originalText: sourceText,
        translatedText: translatedText,
        sourceLanguage: finalSourceLang,
        targetLanguage: targetLang
      }
    }, {
      onSuccess: () => {
        toast({ title: "Saved to favorites! ❤️" });
        queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Top section with Mascot */}
      <div className="flex flex-col items-center justify-center mb-8 relative">
        <ParrotMascot state={parrotState} chaosMode={chaosMode} className="w-48 h-48" />
        <AnimatePresence mode="wait">
          {translateMutation.isPending && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -bottom-4 bg-primary/20 text-primary border border-primary/30 px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-md"
            >
              {LOADING_MESSAGES[loadingMsgIdx]}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-4 items-start relative z-10">
        
        {/* Source Card */}
        <Card className="bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-white/5 flex items-center justify-between bg-slate-950/50">
            <Select value={sourceLang} onValueChange={setSourceLang}>
              <SelectTrigger className="w-[180px] bg-transparent border-none text-white focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white">
                <SelectItem value="auto">Auto Detect</SelectItem>
                {SUPPORTED_LANGUAGES.map(l => (
                  <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className={`rounded-full hover:bg-white/10 ${isRecording ? 'text-red-500 bg-red-500/10' : 'text-slate-400'}`} onClick={toggleRecording}>
                <Mic className={isRecording ? 'animate-pulse' : ''} size={18} />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-slate-400" onClick={() => handleSpeak(sourceText, sourceLang)}>
                <Volume2 size={18} />
              </Button>
            </div>
          </div>
          <CardContent className="p-0 relative">
            <Textarea 
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Type or speak to translate..."
              className="min-h-[200px] w-full resize-none border-none bg-transparent p-6 text-xl text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0"
              maxLength={500}
            />
            <div className="absolute bottom-4 right-4 text-xs font-medium text-slate-500">
              {sourceText.length} / 500
            </div>
          </CardContent>
        </Card>

        {/* Swap / Action area */}
        <div className="flex lg:flex-col items-center justify-center gap-4 py-4 lg:py-16">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleSwap}
            disabled={sourceLang === 'auto'}
            className="rounded-full w-12 h-12 bg-slate-800 border-white/10 text-white hover:bg-slate-700 disabled:opacity-50"
          >
            <ArrowRightLeft className="lg:rotate-0 rotate-90" />
          </Button>
          <Button 
            size="lg" 
            onClick={handleTranslate}
            disabled={translateMutation.isPending || !sourceText.trim()}
            className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_0_20px_-5px_rgba(0,212,170,0.4)]"
          >
            {translateMutation.isPending ? <Loader2 className="animate-spin" /> : "Translate"}
          </Button>
        </div>

        {/* Target Card */}
        <Card className="bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden h-full flex flex-col">
          <div className="p-3 border-b border-white/5 flex items-center justify-between bg-slate-950/50">
            <Select value={targetLang} onValueChange={setTargetLang}>
              <SelectTrigger className="w-[180px] bg-transparent border-none text-white focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white">
                {SUPPORTED_LANGUAGES.map(l => (
                  <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" disabled={!translatedText} className="rounded-full hover:bg-white/10 text-slate-400" onClick={() => handleSpeak(translatedText, targetLang)}>
                <Volume2 size={18} />
              </Button>
            </div>
          </div>
          <CardContent className="p-6 flex-1 flex flex-col">
            {translatedText ? (
              <div className="flex-1 text-xl text-white break-words">
                {translatedText}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-600 text-lg italic">
                Translation will appear here
              </div>
            )}

            {/* Actions for result */}
            {translatedText && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(translatedText)} className="text-slate-400 hover:text-white hover:bg-white/10">
                  <Copy size={16} className="mr-2" /> Copy
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare} className="text-slate-400 hover:text-white hover:bg-white/10">
                  <Share2 size={16} className="mr-2" /> Share
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSaveFavorite} className="text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 ml-auto">
                  <Heart size={16} className="mr-2" /> Save
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Chaos Response Card */}
      <AnimatePresence>
        {chaosMode && chaosResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mt-8 mx-auto max-w-2xl"
          >
            <Card className="bg-black border-red-500/50 shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <span className="text-9xl">💥</span>
              </div>
              <CardContent className="p-6 relative z-10 flex gap-4 items-center">
                <div className="text-4xl animate-bounce">🦜</div>
                <div>
                  <div className="text-red-500 font-bold text-sm tracking-wider mb-1 uppercase">Chaos Interpretation</div>
                  <div className="text-white font-mono text-lg">{chaosResponse}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phrase of the Day */}
      {phraseOfDay && !chaosMode && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.5 }}
          className="mt-12 mx-auto max-w-3xl"
        >
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-white/5 backdrop-blur-md">
            <CardContent className="p-6 text-center">
              <h3 className="text-accent font-bold text-sm uppercase tracking-widest mb-4 flex justify-center items-center gap-2">
                <Sparkles size={16} /> Phrase of the Day
              </h3>
              <div className="text-3xl font-bold text-white mb-2">{phraseOfDay.phrase}</div>
              <div className="text-lg text-slate-300 mb-2">{phraseOfDay.translation}</div>
              <div className="inline-block px-3 py-1 bg-black/30 rounded-full text-sm text-slate-400 font-mono mb-4">
                {phraseOfDay.pronunciationHint}
              </div>
              {phraseOfDay.funFact && (
                <p className="text-sm text-slate-500 italic max-w-xl mx-auto">"{phraseOfDay.funFact}"</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

    </div>
  );
}
