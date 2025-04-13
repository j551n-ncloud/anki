
import React, { useState, KeyboardEvent, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Tag as TagIcon, Plus } from 'lucide-react';

interface TagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
}

const TagsInput: React.FC<TagsInputProps> = ({
  tags,
  onChange,
  maxTags = 10,
  placeholder = 'Add a tag...'
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const addTag = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput && !tags.includes(trimmedInput) && tags.length < maxTags) {
      const newTags = [...tags, trimmedInput];
      onChange(newTags);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const filteredTags = tags.filter(tag => tag !== tagToRemove);
    onChange(filteredTags);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="tags-input-container">
      <div 
        className="flex flex-wrap gap-2 p-2 border rounded-md bg-background min-h-[40px] cursor-text"
        onClick={focusInput}
      >
        {tags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1 py-1">
            <TagIcon className="h-3 w-3" />
            {tag}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {tag}</span>
            </Button>
          </Badge>
        ))}
        
        <div className="flex-1 flex min-w-[120px] items-center">
          <Input
            ref={inputRef}
            type="text"
            className="border-0 p-0 shadow-none focus-visible:ring-0 h-auto"
            placeholder={tags.length > 0 ? '' : placeholder}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={addTag}
          />
        </div>
      </div>
      
      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        <span>
          {tags.length} / {maxTags} tags
        </span>
        <span>Press Enter or comma to add</span>
      </div>
    </div>
  );
};

export default TagsInput;
