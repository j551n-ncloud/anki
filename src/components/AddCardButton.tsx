
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { FlashcardGenerationResult } from '@/services/openai';
import TagsInput from '@/components/TagsInput';
import { Plus, Save } from 'lucide-react';

interface AddCardButtonProps {
  onAddCard: (card: FlashcardGenerationResult) => void;
  globalTags?: string[];
}

const AddCardButton = ({ onAddCard, globalTags = [] }: AddCardButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [tags, setTags] = useState<string[]>(globalTags);

  const handleAddCard = () => {
    if (!front.trim() || !back.trim()) return;
    
    onAddCard({
      front,
      back,
      tags
    });
    
    // Reset form
    setFront('');
    setBack('');
    setTags(globalTags);
    setIsOpen(false);
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        variant="outline" 
        className="border-dashed h-[320px] w-full flex flex-col justify-center items-center gap-2"
      >
        <Plus className="h-6 w-6" />
        <span>Add Card</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Flashcard</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Front Side</label>
              <Textarea
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Question or prompt"
                className="min-h-[120px]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Back Side</label>
              <Textarea
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Answer or explanation"
                className="min-h-[120px]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <TagsInput
                tags={tags}
                onChange={setTags}
                placeholder="Add tags..."
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddCard}
              disabled={!front.trim() || !back.trim()}
            >
              <Save className="h-4 w-4 mr-1.5" />
              Add Card
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddCardButton;
