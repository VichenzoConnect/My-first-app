import React from 'react';
import { useListFavorites, useDeleteFavorite, getListFavoritesQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { getLanguageName } from '@/lib/languages';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeartOff, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ParrotMascot } from '@/components/ParrotMascot';

export default function Favorites() {
  const { data: favorites = [], isLoading } = useListFavorites();
  const deleteMutation = useDeleteFavorite();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleRemove = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
        toast({ title: "Removed from favorites" });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Heart className="text-rose-500 fill-rose-500" /> Favorites
        </h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-white/5">
          <ParrotMascot state="listening" className="mx-auto w-32 h-32 mb-6" />
          <h3 className="text-xl font-medium text-slate-300 mb-2">No favorites yet</h3>
          <p className="text-slate-500">Save translations you want to keep forever.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {favorites.map((item) => (
            <Card key={item.id} className="bg-slate-900/60 border-rose-500/20 backdrop-blur-md overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-bl-[100px] pointer-events-none" />
              <CardContent className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 bg-black/40 px-3 py-1 rounded-full">
                    <span>{getLanguageName(item.sourceLanguage)}</span>
                    <span className="text-rose-500">→</span>
                    <span className="text-primary">{getLanguageName(item.targetLanguage)}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-rose-400 hover:text-slate-300 hover:bg-white/5 -mr-2 -mt-2"
                    onClick={() => handleRemove(item.id)}
                    title="Remove from favorites"
                  >
                    <HeartOff size={18} />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-lg text-slate-300">{item.originalText}</div>
                  </div>
                  <div>
                    <div className="text-2xl text-white font-bold">{item.translatedText}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
