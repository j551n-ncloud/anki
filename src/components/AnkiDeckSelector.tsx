
import { useAnki } from '@/contexts/AnkiContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

const AnkiDeckSelector = () => {
  const { 
    decks, 
    selectedDeck, 
    setSelectedDeck, 
    loadingDecks 
  } = useAnki();

  if (loadingDecks) {
    return (
      <div className="space-y-2">
        <Label>Anki Deck</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="deck-select">Anki Deck</Label>
      <Select 
        value={selectedDeck || "select-deck"} 
        onValueChange={setSelectedDeck}
        disabled={decks.length === 0}
      >
        <SelectTrigger id="deck-select">
          <SelectValue placeholder="Select a deck" />
        </SelectTrigger>
        <SelectContent>
          {decks.length === 0 ? (
            <SelectItem value="select-deck">No decks available</SelectItem>
          ) : (
            decks.map((deck) => (
              <SelectItem key={deck} value={deck}>
                {deck}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AnkiDeckSelector;
