
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

type AIKeyContextType = {
  apiKey: string;
  setApiKey: (key: string) => void;
  isKeySet: boolean;
};

const AIKeyContext = createContext<AIKeyContextType | undefined>(undefined);

export const AIKeyProvider = ({ children }: { children: ReactNode }) => {
  const [apiKey, setApiKey] = useState<string>(() => {
    const savedKey = localStorage.getItem('ai_api_key');
    return savedKey || '';
  });

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('ai_api_key', apiKey);
    } else if (apiKey === '' && localStorage.getItem('ai_api_key')) {
      localStorage.removeItem('ai_api_key');
    }
  }, [apiKey]);

  const isKeySet = Boolean(apiKey);

  return (
    <AIKeyContext.Provider value={{ apiKey, setApiKey, isKeySet }}>
      {children}
    </AIKeyContext.Provider>
  );
};

export const useAIKey = () => {
  const context = useContext(AIKeyContext);
  if (context === undefined) {
    throw new Error('useAIKey must be used within an AIKeyProvider');
  }
  return context;
};
