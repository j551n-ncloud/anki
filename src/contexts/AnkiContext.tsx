
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getDeckNames, getModelNames, getModelFieldNames, hasAnkiConnect, isClozeNoteType } from '../services/anki';
import { toast } from 'sonner';

type AnkiContextType = {
  isConnected: boolean;
  decks: string[];
  models: string[];
  selectedDeck: string;
  setSelectedDeck: (deck: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  fields: string[];
  loadingDecks: boolean;
  loadingModels: boolean;
  loadingFields: boolean;
  refreshConnection: () => Promise<void>;
  isClozeNoteType: (modelName: string) => boolean;
};

const AnkiContext = createContext<AnkiContextType | undefined>(undefined);

export const AnkiProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [decks, setDecks] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [fields, setFields] = useState<string[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<string>(() => {
    return localStorage.getItem('anki_selected_deck') || '';
  });
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem('anki_selected_model') || '';
  });
  const [loadingDecks, setLoadingDecks] = useState<boolean>(false);
  const [loadingModels, setLoadingModels] = useState<boolean>(false);
  const [loadingFields, setLoadingFields] = useState<boolean>(false);

  const refreshConnection = async () => {
    setLoadingDecks(true);
    try {
      const fetchedDecks = await getDeckNames();
      setDecks(fetchedDecks);
      setIsConnected(true);
      
      if (fetchedDecks.length > 0 && !selectedDeck) {
        setSelectedDeck(fetchedDecks[0]);
      }
      
      setLoadingModels(true);
      const fetchedModels = await getModelNames();
      setModels(fetchedModels);
      
      if (fetchedModels.length > 0 && !selectedModel) {
        setSelectedModel(fetchedModels[0]);
      }
    } catch (error) {
      console.error('Failed to connect to Anki:', error);
      setIsConnected(false);
      toast.error('Failed to connect to Anki. Please make sure AnkiConnect plugin is installed and Anki is running.');
    } finally {
      setLoadingDecks(false);
      setLoadingModels(false);
    }
  };

  useEffect(() => {
    refreshConnection();
  }, []);

  useEffect(() => {
    if (selectedDeck) {
      localStorage.setItem('anki_selected_deck', selectedDeck);
    }
  }, [selectedDeck]);

  useEffect(() => {
    if (selectedModel) {
      localStorage.setItem('anki_selected_model', selectedModel);
      
      const fetchFields = async () => {
        if (selectedModel) {
          setLoadingFields(true);
          setFields([]); // Clear fields while loading
          try {
            const fieldNames = await getModelFieldNames(selectedModel);
            console.log('Fetched fields for model:', selectedModel, fieldNames);
            setFields(fieldNames);
          } catch (error) {
            console.error('Failed to fetch model fields:', error);
            toast.error('Failed to fetch note type fields from Anki');
          } finally {
            setLoadingFields(false);
          }
        }
      };
      
      fetchFields();
    }
  }, [selectedModel]);

  return (
    <AnkiContext.Provider
      value={{
        isConnected,
        decks,
        models,
        selectedDeck,
        setSelectedDeck,
        selectedModel,
        setSelectedModel,
        fields,
        loadingDecks,
        loadingModels,
        loadingFields,
        refreshConnection,
        isClozeNoteType,
      }}
    >
      {children}
    </AnkiContext.Provider>
  );
};

export const useAnki = () => {
  const context = useContext(AnkiContext);
  if (context === undefined) {
    throw new Error('useAnki must be used within an AnkiProvider');
  }
  return context;
};
