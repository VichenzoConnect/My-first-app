import React from 'react';
import { useListHistory, useDeleteHistory, getListHistoryQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { getLanguageName } from '@/lib/languages';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, History as HistoryIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ParrotMascot } from '@/components/ParrotMascot';

export default function History() {
  const { data: historyItems = [], isLoading } = useListHistory();
  const deleteMutation = useDeleteHistory();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListHistoryQueryKey() });
        toast({ title: "Deleted from history" });
      }
    });
  };

  const handleClearAll = () => {
    // Optimistically assuming an endpoint or doing it one by one
    // The spec doesn't provide a clearAll mutation, so we'll map over them
    // For a real app we'd want a bulk delete endpoint.
    Promise.all(historyItems.map(item => deleteMutation.mutateAsync({ id: item.id })))
      .then(() => {
        queryClient.invalidateQueries({ queryKey: getListHistoryQueryKey() });
        toast({ title: "History cleared!" });
      });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <HistoryIcon className="text-primary" /> History
        </h1>
        {historyItems.length > 0 && (
          <Button variant="outline" onClick={handleClearAll} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
            Clear All
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : historyItems.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-white/5">
          <ParrotMascot state="idle" className="mx-auto w-32 h-32 opacity-50 mb-6 grayscale" />
          <h3 className="text-xl font-medium text-slate-300 mb-2">No history yet</h3>
          <p className="text-slate-500">Go translate some squawks!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {historyItems.map((item) => (
            <Card key={item.id} className="bg-slate-900/60 border-white/5 backdrop-blur-md overflow-hidden hover:bg-slate-800/60 transition-colors">
              <CardContent className="p-6 flex gap-6 items-start">
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      {getLanguageName(item.sourceLanguage)}
                    </div>
                    <div className="text-lg text-slate-300">{item.originalText}</div>
                  </div>
                  <div className="w-full h-px bg-white/5" />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                      {getLanguageName(item.targetLanguage)}
                    </div>
                    <div className="text-xl text-white font-medium">{item.translatedText}</div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-4 min-w-[100px]">
                  <span className="text-xs text-slate-500">
                    {format(new Date(item.createdAt), 'MMM d, h:mm a')}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-500 hover:text-red-400 hover:bg-red-400/10"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
