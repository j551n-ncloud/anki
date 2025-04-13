
import { useState } from 'react';
import { FlashcardGenerationResult } from '@/services/openai';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import TagsInput from '@/components/TagsInput';
import { Tag, Save } from 'lucide-react';

interface FlashcardEditorProps {
  card: FlashcardGenerationResult;
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedCard: FlashcardGenerationResult) => void;
}

const FlashcardEditor = ({ card, isOpen, onClose, onSave }: FlashcardEditorProps) => {
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);
  const [tags, setTags] = useState<string[]>(card.tags || []);

  const handleSave = () => {
    onSave({
      front,
      back,
      tags,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Flashcard</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Front Side</label>
            <Textarea
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Question or front side content"
              className="min-h-[120px]"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Back Side</label>
            <Textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Answer or back side content"
              className="min-h-[120px]"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Tag className="h-4 w-4" />
              Tags
            </label>
            <TagsInput 
              tags={tags} 
              onChange={setTags} 
              placeholder="Add tags..."
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-1.5" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FlashcardEditor;
