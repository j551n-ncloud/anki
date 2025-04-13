
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAIKey } from '@/contexts/AIKeyContext';
import { useAnki } from '@/contexts/AnkiContext';
import { FlashcardGenerationResult, generateFlashcards, AIModelConfig } from '@/services/openai';
import { AnkiNote, addNotes } from '@/services/anki';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import AnkiConnectionStatus from '@/components/AnkiConnectionStatus';
import AnkiDeckSelector from '@/components/AnkiDeckSelector';
import AnkiModelSelector from '@/components/AnkiModelSelector';
import FlashcardPreview from '@/components/FlashcardPreview';
import FlashcardEditor from '@/components/FlashcardEditor';
import AddCardButton from '@/components/AddCardButton';
import TagsInput from '@/components/TagsInput';
import FileUploader from '@/components/FileUploader';
import Navbar from '@/components/Navbar';
import { BrainCircuit, Loader2, Send, Sparkle, AlertTriangle, Key, Tag, Plus, Edit, Globe, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import Layout from "@/components/Layout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const CreateCards = () => {
  const navigate = useNavigate();
  const { apiKey, isKeySet } = useAIKey();
  const { isConnected, selectedDeck, selectedModel, fields, isClozeNoteType } = useAnki();
  
  const [content, setContent] = useState('');
  const [instructions, setInstructions] = useState('');
  const [numCards, setNumCards] = useState(3);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [generatedCards, setGeneratedCards] = useState<FlashcardGenerationResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('text');
  const [globalTags, setGlobalTags] = useState<string[]>([]);
  const [editingCard, setEditingCard] = useState<FlashcardGenerationResult | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [addingCardIndex, setAddingCardIndex] = useState<number | null>(null);
  const [language, setLanguage] = useState<string>('english');
  
  // AI model configuration state
  const [aiModelConfig, setAiModelConfig] = useState<AIModelConfig>({
    apiUrl: 'https://api.helmholtz-blablador.fz-juelich.de/api/v1/chat/completions',
    model: 'gpt-3.5-turbo'
  });
  const [isAiConfigOpen, setIsAiConfigOpen] = useState(false);
  
  useEffect(() => {
    if (fields.length > 0) {
      const initialMapping: Record<string, string> = {};
      
      if (selectedModel && isClozeNoteType(selectedModel)) {
        const mainField = fields.find(f => f === 'Text') || fields[0];
        const backField = fields.find(f => f === 'Back Extra') || (fields.length > 1 ? fields[1] : null);
        
        if (mainField) {
          initialMapping[mainField] = 'front';
        }
        
        if (backField) {
          initialMapping[backField] = 'back';
        }
      } else {
        const frontField = fields.find(f => 
          f.toLowerCase().includes('front') || 
          f.toLowerCase() === 'question'
        ) || fields[0];
        
        const backField = fields.find(f => 
          f.toLowerCase().includes('back') || 
          f.toLowerCase() === 'answer'
        ) || (fields.length > 1 ? fields[1] : fields[0]);
        
        initialMapping[frontField] = 'front';
        initialMapping[backField] = 'back';
      }
      
      setFieldMapping(initialMapping);
    }
  }, [fields, selectedModel, isClozeNoteType]);

  useEffect(() => {
    if (!isKeySet) {
      toast.warning('Please set your AI API key to use the flashcard generator', {
        action: {
          label: 'Set Key',
          onClick: () => navigate('/api-key')
        },
      });
    }
  }, [isKeySet, navigate]);

  // Load AI model configuration from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('ai_model_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setAiModelConfig(config);
      } catch (error) {
        console.error('Error loading AI model config:', error);
      }
    }
  }, []);

  // Save AI model configuration to localStorage
  const saveAiModelConfig = (config: AIModelConfig) => {
    setAiModelConfig(config);
    localStorage.setItem('ai_model_config', JSON.stringify(config));
    setIsAiConfigOpen(false);
    toast.success('AI model configuration saved');
  };

  const handleFileContent = (fileContent: string) => {
    setContent(fileContent);
    setActiveTab('text');
  };

  const handleGenerate = async () => {
    if (!content.trim()) {
      toast.error('Please enter some content or upload a file');
      return;
    }

    if (!isKeySet) {
      toast.error('Please set your OpenAI API key first');
      return;
    }

    setIsGenerating(true);
    try {
      const cards = await generateFlashcards(
        apiKey,
        content,
        numCards,
        instructions,
        aiModelConfig,
        language
      );
      
      if (globalTags.length > 0) {
        cards.forEach(card => {
          card.tags = [...new Set([...(card.tags || []), ...globalTags])];
        });
      }
      
      setGeneratedCards(cards);
      toast.success(`Generated ${cards.length} flashcards in ${language}`);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast.error(`Failed to generate flashcards: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteCard = (cardToDelete: FlashcardGenerationResult) => {
    const updatedCards = generatedCards.filter(card => card !== cardToDelete);
    setGeneratedCards(updatedCards);
    toast.success('Card deleted');
  };

  const handleAddIndividualCard = (newCard: FlashcardGenerationResult) => {
    setGeneratedCards([...generatedCards, newCard]);
    toast.success('Card added successfully');
  };

  const handleAddCardToAnki = async (card: FlashcardGenerationResult) => {
    if (!isConnected) {
      toast.error('Not connected to Anki. Please ensure Anki is running and AnkiConnect is installed.');
      return;
    }

    if (!selectedDeck || !selectedModel) {
      toast.error('Please select a deck and note type');
      return;
    }

    const frontField = Object.keys(fieldMapping).find(key => fieldMapping[key] === 'front');
    const backField = Object.keys(fieldMapping).find(key => fieldMapping[key] === 'back');

    if (!frontField) {
      toast.error('Please map the front field');
      return;
    }

    const cardIndex = generatedCards.indexOf(card);
    setAddingCardIndex(cardIndex);

    try {
      const noteFields: Record<string, string> = {};
      
      for (const ankiField of fields) {
        noteFields[ankiField] = '';
      }
      
      for (const ankiField of Object.keys(fieldMapping)) {
        const cardField = fieldMapping[ankiField];
        if (cardField === 'front') {
          noteFields[ankiField] = card.front;
        } else if (cardField === 'back') {
          noteFields[ankiField] = card.back;
        }
      }

      if (isClozeNoteType(selectedModel)) {
        const textField = fields.find(f => f === 'Text');
        const backExtraField = fields.find(f => f === 'Back Extra');
        
        if (textField) {
          if (!noteFields[textField].includes('{{c')) {
            if (backField && noteFields[backField]) {
              noteFields[textField] = `${card.front} {{c1::${card.back}}}`;
            } else {
              noteFields[textField] = `{{c1::${card.front}}}`;
            }
          }
          
          if (backExtraField && !noteFields[backExtraField] && backField !== backExtraField) {
            noteFields[backExtraField] = card.back;
          }
        }
      }

      console.log('Adding note with fields:', noteFields);
      console.log('Fields mapping:', fieldMapping);
      
      const note: AnkiNote = {
        deckName: selectedDeck,
        modelName: selectedModel,
        fields: noteFields,
        tags: card.tags || [],
        options: {
          allowDuplicate: false,
        }
      };
      
      const results = await addNotes([note]);
      
      if (results[0] === null) {
        if (isClozeNoteType(selectedModel)) {
          toast.error('Card not added. For Cloze note types, make sure content has proper cloze format or choose a different note type.');
        } else {
          toast.error('Card not added. Check field mapping or try a different note type.');
        }
      } else {
        toast.success('Card added to Anki');
        
        const updatedCards = generatedCards.filter((_, idx) => idx !== cardIndex);
        setGeneratedCards(updatedCards);
      }
    } catch (error) {
      console.error('Error adding card to Anki:', error);
      
      if (error instanceof Error && error.message.includes('cannot create note')) {
        if (isClozeNoteType(selectedModel)) {
          toast.error('Failed to add card. For Cloze note types, make sure content has proper cloze format or choose a different note type.', {
            duration: 5000,
          });
        } else {
          toast.error('Failed to add card. Make sure all required fields are mapped correctly in your note type.', {
            duration: 5000,
          });
        }
      } else {
        toast.error(`Failed to add card to Anki: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setAddingCardIndex(null);
    }
  };

  const handleAddToAnki = async () => {
    if (!isConnected) {
      toast.error('Not connected to Anki. Please ensure Anki is running and AnkiConnect is installed.');
      return;
    }

    if (!selectedDeck || !selectedModel) {
      toast.error('Please select a deck and note type');
      return;
    }

    const frontField = Object.keys(fieldMapping).find(key => fieldMapping[key] === 'front');
    const backField = Object.keys(fieldMapping).find(key => fieldMapping[key] === 'back');

    if (!frontField) {
      toast.error('Please map the front field');
      return;
    }

    setIsAdding(true);
    try {
      const notes: AnkiNote[] = generatedCards.map(card => {
        const noteFields: Record<string, string> = {};
        
        for (const ankiField of fields) {
          noteFields[ankiField] = '';
        }
        
        for (const ankiField of Object.keys(fieldMapping)) {
          const cardField = fieldMapping[ankiField];
          if (cardField === 'front') {
            noteFields[ankiField] = card.front;
          } else if (cardField === 'back') {
            noteFields[ankiField] = card.back;
          }
        }

        if (isClozeNoteType(selectedModel)) {
          const textField = fields.find(f => f === 'Text');
          const backExtraField = fields.find(f => f === 'Back Extra');
          
          if (textField) {
            if (!noteFields[textField].includes('{{c')) {
              if (backField && noteFields[backField]) {
                noteFields[textField] = `${card.front} {{c1::${card.back}}}`;
              } else {
                noteFields[textField] = `{{c1::${card.front}}}`;
              }
            }
            
            if (backExtraField && !noteFields[backExtraField] && backField !== backExtraField) {
              noteFields[backExtraField] = card.back;
            }
          }
        }

        return {
          deckName: selectedDeck,
          modelName: selectedModel,
          fields: noteFields,
          tags: card.tags || [],
          options: {
            allowDuplicate: false,
          }
        };
      });

      console.log('Adding notes with first note fields:', notes[0]?.fields);
      
      const results = await addNotes(notes);
      const addedCount = results.filter(id => id !== null).length;
      
      if (addedCount === 0) {
        if (isClozeNoteType(selectedModel)) {
          toast.error('No cards were added. For Cloze note types, make sure content has proper format or choose a different note type.');
        } else {
          toast.error('No cards were added. Check your field mapping or note type requirements.');
        }
      } else if (addedCount < notes.length) {
        toast.warning(`Added ${addedCount} out of ${notes.length} cards. Some may have invalid field mappings.`);
        
        const successfulIndices = results.map((result, index) => result !== null ? index : -1).filter(index => index !== -1);
        setGeneratedCards(generatedCards.filter((_, index) => !successfulIndices.includes(index)));
      } else {
        toast.success(`Added ${addedCount} cards to Anki`);
        setGeneratedCards([]);
      }
    } catch (error) {
      console.error('Error adding cards to Anki:', error);
      
      if (error instanceof Error && error.message.includes('cannot create note')) {
        if (isClozeNoteType(selectedModel)) {
          toast.error('Failed to add cards. For Cloze note types, make sure content has proper format or choose a different note type.', {
            duration: 5000,
          });
        } else {
          toast.error('Failed to add cards. Make sure all required fields are mapped correctly in your note type.', {
            duration: 5000,
          });
        }
      } else {
        toast.error(`Failed to add cards to Anki: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditCard = (card: FlashcardGenerationResult) => {
    setEditingCard(card);
    setIsEditorOpen(true);
  };

  const handleSaveCard = (editedCard: FlashcardGenerationResult) => {
    if (!editingCard) return;
    
    const updatedCards = generatedCards.map(card => 
      card === editingCard ? editedCard : card
    );
    
    setGeneratedCards(updatedCards);
    setEditingCard(null);
    toast.success('Flashcard updated');
  };

  const applyGlobalTags = () => {
    if (globalTags.length === 0 || generatedCards.length === 0) return;
    
    const updatedCards = generatedCards.map(card => ({
      ...card,
      tags: [...new Set([...(card.tags || []), ...globalTags])]
    }));
    
    setGeneratedCards(updatedCards);
    toast.success(`Applied tags to all cards`);
  };

  const resetForm = () => {
    setContent('');
    setInstructions('');
    setNumCards(3);
    setGeneratedCards([]);
    setGlobalTags([]);
  };

  return (
    <Layout>
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="lg:col-span-2 space-y-6">
          {!isKeySet && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium mb-1">AI API Key Required</h3>
                      <p className="text-sm text-muted-foreground">
                        To generate flashcards, you need to set your AI API key.
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => navigate('/api-key')}
                      >
                        <Key className="h-3.5 w-3.5 mr-1.5" />
                        Set API Key
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Create Flashcards</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsAiConfigOpen(true)}
                  className="gap-1"
                >
                  <Settings className="h-4 w-4" />
                  AI Settings
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="text">Enter Text</TabsTrigger>
                    <TabsTrigger value="file">Upload File</TabsTrigger>
                  </TabsList>
                  <TabsContent value="text">
                    <Textarea
                      placeholder="Enter text content for generating flashcards..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[200px]"
                    />
                  </TabsContent>
                  <TabsContent value="file">
                    <FileUploader 
                      onFileContent={handleFileContent} 
                      disabled={isGenerating}
                    />
                  </TabsContent>
                </Tabs>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Additional Instructions (optional)
                    </label>
                    <Textarea
                      placeholder="E.g., 'Focus on definitions and key concepts', 'Include examples', etc."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="h-20"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block flex items-center gap-1.5">
                      <Globe className="h-4 w-4" />
                      Language
                    </label>
                    <Select
                      value={language}
                      onValueChange={setLanguage}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="german">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block flex items-center gap-1.5">
                      <Tag className="h-4 w-4" />
                      Global Tags (applied to all cards)
                    </label>
                    <TagsInput
                      tags={globalTags}
                      onChange={setGlobalTags}
                      placeholder="Add global tags..."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Number of Cards: {numCards}
                    </label>
                    <Slider
                      min={1}
                      max={40}
                      step={1}
                      value={[numCards]}
                      onValueChange={(vals) => setNumCards(vals[0])}
                    />
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={!content.trim() || isGenerating || !isKeySet}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkle className="mr-2 h-4 w-4" />
                        Generate Flashcards
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {generatedCards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>Generated Flashcards</CardTitle>
                  <div className="flex items-center gap-2">
                    {globalTags.length > 0 && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={applyGlobalTags}
                        className="h-8"
                      >
                        <Tag className="h-3.5 w-3.5 mr-1.5" />
                        Apply Tags
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                    {generatedCards.map((card, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * Math.min(index, 5) }}
                      >
                        <FlashcardPreview 
                          card={card} 
                          onEdit={handleEditCard}
                          onAddToAnki={handleAddCardToAnki}
                          onDelete={handleDeleteCard}
                          isEditable={true}
                        />
                        {addingCardIndex === index && (
                          <div className="mt-2 flex justify-center">
                            <span className="text-sm text-muted-foreground flex items-center">
                              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                              Adding to Anki...
                            </span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AddCardButton 
                        onAddCard={handleAddIndividualCard}
                        globalTags={globalTags}
                      />
                    </motion.div>
                  </div>

                  <div className="flex gap-2 pt-6 mt-2">
                    <Button
                      variant="outline"
                      onClick={resetForm}
                      className="flex-1"
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={handleAddToAnki}
                      disabled={isAdding || !isConnected}
                      className="flex-1"
                    >
                      {isAdding ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding to Anki...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Add to Anki
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Anki Connection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <AnkiConnectionStatus />
              
              <Separator />
              
              <div className="space-y-4">
                <AnkiDeckSelector />
                <AnkiModelSelector />
              </div>

              {fields.length > 0 && (
                <>
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Field Mapping</h3>
                    <p className="text-xs text-muted-foreground">
                      Map flashcard content to Anki fields
                    </p>
                    
                    <div className="space-y-2 pt-1">
                      {fields.map((field) => (
                        <div key={field} className="grid grid-cols-3 gap-2 items-center">
                          <span className="text-sm truncate">{field}</span>
                          <Select
                            value={fieldMapping[field] || ''}
                            onValueChange={(value) => {
                              setFieldMapping({
                                ...fieldMapping,
                                [field]: value
                              });
                            }}
                          >
                            <SelectTrigger className="col-span-2">
                              <SelectValue placeholder="Select mapping" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Not used</SelectItem>
                              <SelectItem value="front">Front side</SelectItem>
                              <SelectItem value="back">Back side</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* AI Model Configuration Dialog */}
      <Dialog open={isAiConfigOpen} onOpenChange={setIsAiConfigOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>AI Model Configuration</DialogTitle>
            <DialogDescription>
              Customize the AI model and endpoint used for generating flashcards
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">API URL</label>
              <Input 
                placeholder="API endpoint URL" 
                value={aiModelConfig.apiUrl}
                onChange={(e) => setAiModelConfig({...aiModelConfig, apiUrl: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                The complete URL of the API endpoint
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Model Name</label>
              <Input 
                placeholder="gpt-3.5-turbo" 
                value={aiModelConfig.model}
                onChange={(e) => setAiModelConfig({...aiModelConfig, model: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                The AI model to use for generating flashcards
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAiConfigOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => saveAiModelConfig(aiModelConfig)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingCard && (
        <FlashcardEditor
          card={editingCard}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveCard}
        />
      )}
    </Layout>
  );
};

export default CreateCards;
