
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FlashcardGenerationResult } from '@/services/openai';
import { cn } from '@/lib/utils';
import { Edit, Tag, Send, Trash } from 'lucide-react';
import { motion } from 'framer-motion';

interface FlashcardPreviewProps {
  card: FlashcardGenerationResult;
  onEdit?: (card: FlashcardGenerationResult) => void;
  onAddToAnki?: (card: FlashcardGenerationResult) => void;
  onDelete?: (card: FlashcardGenerationResult) => void;
  isEditable?: boolean;
}

const FlashcardPreview = ({ 
  card, 
  onEdit, 
  onAddToAnki,
  onDelete,
  isEditable = false 
}: FlashcardPreviewProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    // When flipping to the back, automatically show the answer
    if (!isFlipped) {
      setIsAnswerVisible(true);
    }
  };

  // Reset answer visibility state when card changes
  useEffect(() => {
    setIsAnswerVisible(false);
    setIsFlipped(false);
  }, [card]);

  return (
    <div className="relative h-[320px] w-full">
      <div 
        className={cn(
          "flashcard relative w-full h-full rounded-lg transition-shadow duration-300 cursor-pointer",
          isFlipped ? "shadow-lg" : "shadow-sm hover:shadow-md"
        )}
        style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
        onClick={handleFlip}
      >
        {/* Action buttons positioned outside the card content area */}
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          {isEditable && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(card);
              }}
            >
              <Edit className="h-3.5 w-3.5" />
              <span className="sr-only">Edit</span>
            </Button>
          )}
          
          {onAddToAnki && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={(e) => {
                e.stopPropagation();
                onAddToAnki(card);
              }}
            >
              <Send className="h-3.5 w-3.5" />
              <span className="sr-only">Add to Anki</span>
            </Button>
          )}
          
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background text-destructive hover:text-destructive/90"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(card);
              }}
            >
              <Trash className="h-3.5 w-3.5" />
              <span className="sr-only">Delete</span>
            </Button>
          )}
        </div>

        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ 
            opacity: isFlipped ? 0 : 1, 
            rotateY: isFlipped ? 180 : 0,
            zIndex: isFlipped ? 0 : 1
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <Card className="flashcard-front h-full w-full overflow-hidden">
            <CardContent className="p-6 h-full">
              <div className="h-full flex flex-col">
                <div className="flex-1 prose max-w-none overflow-y-auto scrollbar-thin pt-2" 
                  dangerouslySetInnerHTML={{ __html: card.front }} 
                />
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex flex-wrap gap-1 max-w-[70%] overflow-hidden">
                    {card.tags && card.tags.length > 0 ? (
                      card.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No tags</span>
                    )}
                    {card.tags && card.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{card.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ 
            opacity: isFlipped ? 1 : 0, 
            rotateY: isFlipped ? 0 : -180,
            zIndex: isFlipped ? 1 : 0
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <Card className="flashcard-back h-full w-full overflow-hidden">
            <CardContent className="p-6 h-full">
              <div className="h-full flex flex-col">
                <div className="flex-1 prose max-w-none overflow-y-auto scrollbar-thin pt-2" 
                  dangerouslySetInnerHTML={{ __html: card.back }} 
                />
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex flex-wrap gap-1 max-w-[70%] overflow-hidden">
                    {card.tags && card.tags.length > 0 ? (
                      card.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No tags</span>
                    )}
                    {card.tags && card.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{card.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default FlashcardPreview;
