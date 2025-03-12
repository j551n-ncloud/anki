import Papa from 'papaparse';

/**
 * Interface for CSV data
 */
export interface CSVData {
  data: Array<Record<string, any>>;
  headers: string[];
  rowCount: number;
}

/**
 * Parse CSV string to structured data
 * @param csvContent CSV content as string
 * @returns Structured CSV data
 */
export const parseCSV = (csvContent: string): CSVData => {
  const result = Papa.parse<Record<string, any>>(csvContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true
  });

  return {
    data: result.data || [],
    headers: result.meta.fields || [],
    rowCount: result.data ? result.data.length : 0
  };
};

/**
 * Convert CSV data to flashcard prompts
 * @param csvData Parsed CSV data
 * @returns Array of prompt strings for flashcards
 */
export const csvToFlashcardPrompts = (csvData: CSVData): string[] => {
  const { data, headers } = csvData;
  
  // If we have columns that look like question/answer pairs
  const questionHeaders = headers.filter(h => 
    h.toLowerCase().includes('question') || 
    h.toLowerCase().includes('front')
  );
  
  const answerHeaders = headers.filter(h => 
    h.toLowerCase().includes('answer') || 
    h.toLowerCase().includes('back')
  );

  if (questionHeaders.length > 0 && answerHeaders.length > 0) {
    return data.map(row => {
      const question = row[questionHeaders[0]];
      const answer = row[answerHeaders[0]];
      return `Front: ${question}\nBack: ${answer}`;
    });
  }

  // If we have a term/definition structure
  const termHeaders = headers.filter(h => 
    h.toLowerCase().includes('term') || 
    h.toLowerCase().includes('concept') ||
    h.toLowerCase().includes('word')
  );
  
  const definitionHeaders = headers.filter(h => 
    h.toLowerCase().includes('definition') || 
    h.toLowerCase().includes('description') ||
    h.toLowerCase().includes('meaning')
  );

  if (termHeaders.length > 0 && definitionHeaders.length > 0) {
    return data.map(row => {
      const term = row[termHeaders[0]];
      const definition = row[definitionHeaders[0]];
      return `Front: ${term}\nBack: ${definition}`;
    });
  }

  // If no clear patterns, use the first two columns
  if (headers.length >= 2) {
    return data.map(row => {
      const col1 = row[headers[0]];
      const col2 = row[headers[1]];
      return `Front: ${col1}\nBack: ${col2}`;
    });
  }

  // Fallback for single column
  if (headers.length === 1) {
    return data.map(row => {
      const content = row[headers[0]];
      return `Front: What is ${content}?\nBack: (Generated from CSV, please edit this answer)`;
    });
  }

  return [];
};

/**
 * Generate flashcard prompt text from CSV content
 * @param csvContent Raw CSV content
 * @returns Prompt text for generating flashcards
 */
export const generateFlashcardPromptFromCSV = (csvContent: string): string => {
  const csvData = parseCSV(csvContent);
  
  // Create a summary of the CSV data
  const summary = `CSV data with ${csvData.headers.length} columns (${csvData.headers.join(', ')}) and ${csvData.rowCount} rows.`;
  
  // Sample some rows to show the data structure
  const sampleRowCount = Math.min(3, csvData.data.length);
  const samples = csvData.data
    .slice(0, sampleRowCount)
    .map(row => 
      csvData.headers.map(header => `${header}: ${row[header]}`).join(', ')
    )
    .join('\n');
  
  return `Please create Anki flashcards based on the following CSV data:

${summary}

Sample data:
${samples}

The cards should be concise but contextual, with clear questions and answers.`;
};