
export interface AnkiNote {
  deckName: string;
  modelName: string;
  fields: Record<string, string>;
  tags: string[];
  options?: {
    allowDuplicate?: boolean;
  };
}

export type AnkiRequestAction =
  | 'deckNames'
  | 'modelNames'
  | 'modelFieldNames'
  | 'addNotes'
  | 'addNote';

interface AnkiConnectResponse<T> {
  result: T | null;
  error: string | null;
}

export const ankiConnectRequest = async <T>(
  action: AnkiRequestAction,
  params: any = {}
): Promise<T> => {
  try {
    const response = await fetch('http://127.0.0.1:8765', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: action,
        version: 6,
        params: params,
      }),
    });

    const data: AnkiConnectResponse<T> = await response.json();

    if (data.error) {
      console.error(`Anki Connect error for action "${action}":`, data.error);
      throw new Error(data.error);
    }

    return data.result as T;
  } catch (error) {
    console.error(`Failed in ankiConnectRequest for action "${action}":`, error);
    throw error;
  }
};

export const getDeckNames = async (): Promise<string[]> => {
  return ankiConnectRequest<string[]>('deckNames');
};

export const getModelNames = async (): Promise<string[]> => {
  return ankiConnectRequest<string[]>('modelNames');
};

export const getModelFieldNames = async (modelName: string): Promise<string[]> => {
  return ankiConnectRequest<string[]>('modelFieldNames', { modelName });
};

export const addNotes = async (notes: AnkiNote[]): Promise<(number | null)[]> => {
  return ankiConnectRequest<(number | null)[]>('addNotes', { notes });
};

export const addNote = async (note: AnkiNote): Promise<number | null> => {
  return ankiConnectRequest<number | null>('addNote', { note });
};

export const hasAnkiConnect = async (): Promise<boolean> => {
  try {
    await getDeckNames();
    return true;
  } catch (error) {
    console.error('AnkiConnect check failed:', error);
    return false;
  }
};

// Helper function to clean HTML content for Anki
export const sanitizeHtmlForAnki = (html: string): string => {
  // Remove any potentially problematic elements or attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
};

// Helper function to format content for Cloze note types
export const formatForCloze = (text: string): string => {
  // If the content doesn't already have cloze syntax {{c1::...}}, add it
  if (!text.includes('{{c') && !text.match(/\{\{c\d+::/)) {
    return `{{c1::${text}}}`;
  }
  return text;
};

// Check if a note type is a Cloze type
export const isClozeNoteType = (modelName: string): boolean => {
  return modelName.toLowerCase().includes('cloze');
};

// Format fields based on note type
export const formatFieldsForNoteType = (
  modelName: string, 
  fields: Record<string, string>
): Record<string, string> => {
  const formattedFields = { ...fields };
  
  // Handle Cloze note types
  if (isClozeNoteType(modelName)) {
    // For Cloze note types, the 'Text' field needs to contain {{c1::...}} syntax
    if (formattedFields['Text'] && !formattedFields['Text'].includes('{{c')) {
      // If it's a direct Q&A being adapted to Cloze, create a proper cloze deletion
      const frontContent = formattedFields['Text'];
      const backContent = formattedFields['Back Extra'] || '';
      
      // Create a cloze note with the question as the context and the answer as the cloze
      formattedFields['Text'] = `${frontContent} {{c1::${backContent}}}`;
    }
  }
  
  return formattedFields;
};
