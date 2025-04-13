
import { RefreshCw, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnki } from '@/contexts/AnkiContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import AnkiTutorialModal from './AnkiTutorialModal';

const AnkiConnectionStatus = () => {
  const { isConnected, refreshConnection, loadingDecks } = useAnki();
  const [tutorialOpen, setTutorialOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {isConnected ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <span className={cn(
            "text-sm font-medium",
            isConnected ? "text-green-500" : "text-red-500"
          )}>
            {isConnected ? "Connected to Anki" : "Not connected to Anki"}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTutorialOpen(true)}
            className="h-8"
          >
            <HelpCircle className="h-3.5 w-3.5 mr-1" />
            Help
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshConnection()}
            disabled={loadingDecks}
            className="h-8"
          >
            <RefreshCw className={cn(
              "h-3.5 w-3.5 mr-1",
              loadingDecks && "animate-spin"
            )} />
            {loadingDecks ? "Connecting..." : "Refresh"}
          </Button>
        </div>
      </div>
      
      <AnkiTutorialModal
        isOpen={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
      />
    </>
  );
};

export default AnkiConnectionStatus;
