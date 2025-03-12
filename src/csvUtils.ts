import Papa from 'papaparse';

interface CSVParseResult {
  data: Array<Record<string, any>>;
  headers: string[];
}

/**
 * Parse CSV string into structured data
 * @param csvString The CSV content as a string
 * @returns Object containing parsed data and headers
 */
export const parseCSV = (csvString: string): CSVParseResult => {
  console.log("Parsing CSV...");
  try {
    // Use Papa Parse for robust CSV parsing
    const result = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    });

    // Clean up headers - remove whitespace and empty headers
    const headers = result.meta.fields || [];
    const cleanedHeaders = headers.map((header: string) => header.trim());

    // Transform the data to use the cleaned headers
    const data = result.data as Array<Record<string, any>>;
    
    console.log(`CSV parsing complete: ${data.length} rows, ${cleanedHeaders.length} columns`);
    
    return {
      data,
      headers: cleanedHeaders
    };
  } catch (error) {
    console.error("Error parsing CSV:", error);
    return {
      data: [],
      headers: []
    };
  }
};

/**
 * Generate a prompt for creating flashcards from CSV content
 * @param csvString The CSV content as a string
 * @returns A string prompt for the AI to generate flashcards
 */
export const generateFlashcardPromptFromCSV = (csvString: string): string => {
  try {
    // Parse the CSV data
    const { data, headers } = parseCSV(csvString);
    
    if (data.length === 0 || headers.length === 0) {
      return "Please create flashcards from this data. The format couldn't be automatically detected.";
    }
    
    // Take a sample of the data (up to 5 rows) for the prompt
    const sampleRows = data.slice(0, 5);
    const sampleData = sampleRows.map(row => {
      const rowData: Record<string, any> = {};
      headers.forEach(header => {
        rowData[header] = row[header];
      });
      return rowData;
    });
    
    // Generate a descriptive prompt based on the data structure
    let prompt = `Generate Anki flashcards from the following CSV data:\n\n`;
    
    // Add column description
    prompt += `This CSV file has ${headers.length} columns: ${headers.join(', ')}\n\n`;
    
    // Add sample data
    prompt += `Here are ${sampleRows.length} sample rows from the data:\n`;
    sampleData.forEach((row, index) => {
      prompt += `Row ${index + 1}:\n`;
      headers.forEach(header => {
        prompt += `  ${header}: ${row[header]}\n`;
      });
      prompt += '\n';
    });
    
    // Add specific instructions based on column structure
    if (headers.length === 2) {
      prompt += `This data appears to have a two-column structure. Consider using the first column as the question/front of the card and the second column as the answer/back of the card.\n\n`;
    } else if (headers.some(h => h.toLowerCase().includes('question') || h.toLowerCase().includes('term'))) {
      const questionColumns = headers.filter(h => h.toLowerCase().includes('question') || h.toLowerCase().includes('term'));
      const answerColumns = headers.filter(h => h.toLowerCase().includes('answer') || h.toLowerCase().includes('definition'));
      
      prompt += `This data appears to have question/answer columns. Consider using ${questionColumns.join(', ')} for card fronts and ${answerColumns.length > 0 ? answerColumns.join(', ') : 'other columns'} for card backs.\n\n`;
    }
    
    // Add final instruction
    prompt += `Please create concise and effective flashcards based on this data. Generate at least ${Math.min(10, data.length)} cards from the complete dataset.\n`;
    prompt += `Each card should have a clear question on the front and a comprehensive answer on the back.`;
    
    console.log("Generated CSV flashcard prompt length:", prompt.length);
    return prompt;
    
  } catch (error) {
    console.error("Error generating prompt from CSV:", error);
    return "Please create flashcards from this data. The format couldn't be automatically processed due to an error.";
  }
};