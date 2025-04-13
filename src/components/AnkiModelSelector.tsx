
import { useAnki } from '@/contexts/AnkiContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

const AnkiModelSelector = () => {
  const { 
    models, 
    selectedModel, 
    setSelectedModel, 
    loadingModels 
  } = useAnki();

  if (loadingModels) {
    return (
      <div className="space-y-2">
        <Label>Note Type</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="model-select">Note Type</Label>
      <Select 
        value={selectedModel || "select-model"} 
        onValueChange={setSelectedModel}
        disabled={models.length === 0}
      >
        <SelectTrigger id="model-select">
          <SelectValue placeholder="Select a note type" />
        </SelectTrigger>
        <SelectContent>
          {models.length === 0 ? (
            <SelectItem value="select-model">No note types available</SelectItem>
          ) : (
            models.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AnkiModelSelector;
