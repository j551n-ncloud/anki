import Papa from 'papaparse';
import { parseCSV as parseCSVUtil, generateFlashcardPromptFromCSV } from './csvUtils';

export interface ParsedData {
  format: string;
  content: string;
  structured?: Array<Record<string, any>>;
  headers?: string[];
}

/**
 * Parse file content based on file type
 * @param fileContent The content of the file as a string
 * @param fileName The name of the file to determine type
 * @returns Parsed data with format and content
 */
export const parseFileContent = (fileContent: string, fileName: string): ParsedData => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'csv':
      return parseCSV(fileContent);
    case 'json':
      return parseJSON(fileContent);
    case 'md':
      return parseMarkdown(fileContent);
    case 'txt':
    default:
      return {
        format: 'text',
        content: fileContent
      };
  }
};

/**
 * Parse CSV content using PapaParse
 */
const parseCSV = (content: string): ParsedData => {
  try {
    const csvData = parseCSVUtil(content);
    
    return {
      format: 'csv',
      content: content,
      structured: csvData.data,
      headers: csvData.headers
    };
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return {
      format: 'text',
      content: content
    };
  }
};

/**
 * Parse JSON content
 */
const parseJSON = (content: string): ParsedData => {
  try {
    const parsed = JSON.parse(content);
    return {
      format: 'json',
      content: content,
      structured: Array.isArray(parsed) ? parsed : [parsed]
    };
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return {
      format: 'text',
      content: content
    };
  }
};

/**
 * Parse Markdown content
 */
const parseMarkdown = (content: string): ParsedData => {
  // Basic markdown parsing - extract headers and sections
  const lines = content.split('\n');
  const structured: Record<string, any>[] = [];

  let currentH1 = '';
  let currentH2 = '';
  let currentContent = '';

  for (const line of lines) {
    if (line.startsWith('# ')) {
      // Save previous section if exists
      if (currentH1 && currentContent) {
        structured.push({
          heading: currentH1,
          subheading: currentH2,
          content: currentContent.trim()
        });
      }
      
      currentH1 = line.substring(2).trim();
      currentH2 = '';
      currentContent = '';
    } else if (line.startsWith('## ')) {
      // Save previous subsection if exists
      if (currentH1 && currentContent) {
        structured.push({
          heading: currentH1,
          subheading: currentH2,
          content: currentContent.trim()
        });
      }
      
      currentH2 = line.substring(3).trim();
      currentContent = '';
    } else {
      currentContent += line + '\n';
    }
  }

  // Add the last section
  if (currentH1 && currentContent) {
    structured.push({
      heading: currentH1,
      subheading: currentH2,
      content: currentContent.trim()
    });
  }

  return {
    format: 'markdown',
    content: content,
    structured: structured
  };
};

/**
 * Generate prompt content for Anki card creation from parsed data
 */
export const generatePromptFromParsedData = (parsedData: ParsedData): string => {
  switch (parsedData.format) {
    case 'csv':
      if (parsedData.content) {
        return generateFlashcardPromptFromCSV(parsedData.content);
      }
      return parsedData.content;

    case 'markdown':
      if (parsedData.structured && parsedData.structured.length > 0) {
        return `Generate Anki flashcards from the following Markdown content:

${parsedData.structured.map(section => 
  `${section.heading}${section.subheading ? ' - ' + section.subheading : ''}:\n${section.content}`
).join('\n\n')}

Please create concise and effective flashcards based on this content.`;
      }
      return parsedData.content;

    case 'json':
      if (parsedData.structured && parsedData.structured.length > 0) {
        return `Generate Anki flashcards from the following JSON data:

${JSON.stringify(parsedData.structured.slice(0, 3), null, 2)}

Please create concise and effective flashcards based on this data.`;
      }
      return parsedData.content;

    case 'text':
    default:
      return parsedData.content;
  }
};