// PDF parsing utility functions
import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist';

/**
 * Parse PDF content from ArrayBuffer
 * This function handles PDF parsing with pdf.js
 * @param arrayBuffer The PDF file content as ArrayBuffer
 * @returns The extracted text content from the PDF
 */
export const parsePDFContent = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  try {
    // Set worker source path (needed for pdf.js to work)
    GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
    
    // Load the PDF document
    const loadingTask = getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    console.log(`PDF loaded with ${pdf.numPages} pages`);
    
    // Extract text from all pages
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Concatenate the text items
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Generate a prompt for creating flashcards from PDF content
 * @param pdfContent The extracted text content from the PDF
 * @returns A string prompt for the AI to generate flashcards
 */
export const generateFlashcardPromptFromPDF = (pdfContent: string): string => {
  try {
    if (!pdfContent || pdfContent.trim().length === 0) {
      return "Please create flashcards from this PDF. The text couldn't be extracted properly.";
    }
    
    // Generate a descriptive prompt based on the content structure
    let prompt = `Generate Anki flashcards from the following PDF content:\n\n`;
    
    // Add specific instructions
    prompt += `Please create concise and effective flashcards based on this content. Generate approximately 5-10 cards that cover the main concepts.\n`;
    prompt += `Each card should have a clear question on the front and a comprehensive answer on the back.\n`;
    prompt += `Focus on key terms, definitions, and important concepts from the PDF.\n\n`;
    
    // Add the full content if it's not too long
    if (pdfContent.length < 15000) {
      prompt += `Full content:\n${pdfContent}`;
    } else {
      // If it's too long, add more of the content but not all
      prompt += `Extended content (truncated):\n${pdfContent.substring(0, 15000)}...`;
    }
    
    console.log("Generated PDF flashcard prompt length:", prompt.length);
    return prompt;
    
  } catch (error) {
    console.error("Error generating prompt from PDF:", error);
    return "Please create flashcards from this PDF. The format couldn't be automatically processed due to an error.";
  }
};