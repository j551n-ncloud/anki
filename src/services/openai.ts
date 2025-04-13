
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface FlashcardGenerationResult {
  front: string;
  back: string;
  tags: string[];
}

export interface AIModelConfig {
  apiUrl: string;
  model: string;
}

// Default configuration
const DEFAULT_AI_CONFIG: AIModelConfig = {
  apiUrl: 'https://api.helmholtz-blablador.fz-juelich.de/api/v1/chat/completions',
  model: 'gpt-3.5-turbo'
};

export async function generateFlashcards(
  apiKey: string,
  content: string,
  numberOfCards: number = 1,
  instructions: string = '',
  modelConfig: AIModelConfig = DEFAULT_AI_CONFIG,
  language: string = 'english'
): Promise<FlashcardGenerationResult[]> {
  const systemPrompt = `You are an expert at creating educational flashcards. 
Generate ${numberOfCards} high-quality Anki flashcards from the provided content in ${language}.
Follow these rules:
1. Create clear, concise question-and-answer pairs
2. Focus on the most important concepts
3. Make sure the front side asks a specific question
4. Make sure the back side gives a complete, concise answer
5. Generate 3-5 relevant tags based on the content's topic, subject area, and difficulty level
6. Use markdown formatting for the content where helpful (lists, bold, etc.)
${instructions ? `Additional instructions: ${instructions}` : ''}

VERY IMPORTANT: You MUST respond with properly formatted JSON data exactly as shown below:
[
  {
    "front": "Question on the front side",
    "back": "Answer on the back side",
    "tags": ["tag1", "tag2", "tag3"]
  },
  ...
]

DO NOT include any explanation, comments, or any text outside of the JSON array.`;

  const messages: OpenAIMessage[] = [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content
    }
  ];

  try {
    const response = await fetch(modelConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelConfig.model,
        messages,
        temperature: 0.7,
        max_tokens: 4000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const resultContent = data.choices[0].message.content;
    
    console.log("Raw AI response:", resultContent);
    
    // Clean the content before parsing
    const cleanContent = sanitizeJsonString(resultContent);
    
    try {
      // Try to parse the JSON
      const parsedContent = JSON.parse(cleanContent);
      
      // Ensure we have an array (the API might return an object with an array inside)
      let cards: FlashcardGenerationResult[] = [];
      
      if (Array.isArray(parsedContent)) {
        cards = parsedContent;
      } else if (typeof parsedContent === 'object') {
        // Look for array properties in the response
        for (const key in parsedContent) {
          if (Array.isArray(parsedContent[key])) {
            cards = parsedContent[key];
            break;
          }
        }
        
        // If we still don't have cards, check if it's directly the structure we need
        if (cards.length === 0 && 'front' in parsedContent && 'back' in parsedContent) {
          cards = [parsedContent];
        }
      }
      
      // Validate and clean up each card
      return cards.map(card => ({
        front: String(card.front || ''),
        back: String(card.back || ''),
        tags: Array.isArray(card.tags) 
          ? card.tags.map(tag => String(tag)).filter(Boolean)
          : []
      }));
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.error('JSON parsing failed for content:', cleanContent);
      
      // Try to manually extract cards as a fallback
      try {
        return extractCardsManually(resultContent);
      } catch (extractError) {
        console.error('Failed to manually extract cards:', extractError);
        
        // Try a more aggressive approach to extract JSON
        try {
          return extractJsonFromText(resultContent);
        } catch (finalError) {
          console.error('All extraction methods failed:', finalError);
          throw new Error('Failed to parse AI response');
        }
      }
    }
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw error;
  }
}

// Helper function to clean up JSON string that might contain invalid characters
function sanitizeJsonString(jsonString: string): string {
  // Remove any leading/trailing non-JSON content
  let cleaned = jsonString.trim();
  
  // Check if the content appears to be a non-JSON list or other format
  if (!cleaned.startsWith('{') && !cleaned.startsWith('[')) {
    // Try to find JSON-like content in the response
    const jsonMatch = cleaned.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    } else {
      // If no JSON-like content found, try to convert numbered list to JSON
      if (/^\d+\./.test(cleaned)) {
        return convertListToJson(cleaned);
      }
    }
  }
  
  // Find the first '[' and last ']' for array responses
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    cleaned = cleaned.substring(firstBracket, lastBracket + 1);
  } else {
    // Try to find JSON object if array isn't found
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
  }
  
  // Replace any control characters that would break JSON parsing
  cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  
  // Fix common JSON syntax issues
  cleaned = cleaned.replace(/,\s*}/g, '}');  // Remove trailing commas in objects
  cleaned = cleaned.replace(/,\s*\]/g, ']'); // Remove trailing commas in arrays
  
  // Handle escape sequences properly (this is tricky and might need adjustments)
  cleaned = cleaned.replace(/\\\\(?=["'])/g, '\\'); // Fix double escaped quotes or apostrophes
  cleaned = cleaned.replace(/(?<!\\)\\(?!["\\/bfnrtu])/g, '\\\\'); // Escape single backslashes not part of valid escape sequences
  
  // Ensure all strings are properly quoted
  cleaned = cleaned.replace(/"([^"]*)"/g, (match, p1) => {
    // Replace unescaped quotes within the string with escaped quotes
    const innerContent = p1.replace(/(?<!\\)"/g, '\\"');
    return `"${innerContent}"`;
  });
  
  // If it looks like we have an incomplete JSON string, try to complete it
  const openBraces = (cleaned.match(/\{/g) || []).length;
  const closeBraces = (cleaned.match(/\}/g) || []).length;
  const openBrackets = (cleaned.match(/\[/g) || []).length;
  const closeBrackets = (cleaned.match(/\]/g) || []).length;
  
  if (openBraces > closeBraces) {
    cleaned += '}';
  }
  if (openBrackets > closeBrackets) {
    cleaned += ']';
  }
  
  return cleaned;
}

// Convert a numbered list to JSON array
function convertListToJson(listText: string): string {
  const lines = listText.split('\n').filter(line => line.trim() !== '');
  const result = [];
  
  let currentQuestion = '';
  let currentIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const numberMatch = line.match(/^(\d+)\.\s+(.+)$/);
    
    if (numberMatch) {
      currentIndex = parseInt(numberMatch[1]) - 1;
      currentQuestion = numberMatch[2];
      
      // Add a blank card with the question
      result[currentIndex] = {
        front: currentQuestion,
        back: "See reverse side",
        tags: ["extracted", "auto-generated"]
      };
    } else if (currentIndex >= 0 && result[currentIndex]) {
      // If not a numbered line, it might be part of the answer
      result[currentIndex].back = line;
    }
  }
  
  return JSON.stringify(result.filter(Boolean));
}

// More aggressive approach to extract JSON from text
function extractJsonFromText(text: string): FlashcardGenerationResult[] {
  // Try different regex patterns to find and extract JSON
  
  // First, try to match a JSON array
  const arrayMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (arrayMatch) {
    try {
      const cleanedJson = sanitizeJsonString(arrayMatch[0]);
      return JSON.parse(cleanedJson);
    } catch (e) {
      console.error("Couldn't parse array match:", e);
    }
  }
  
  // If we couldn't extract an array, try to identify individual cards
  const cards: FlashcardGenerationResult[] = [];
  const cardMatches = text.match(/\{[^{}]*"front"[^{}]*"back"[^{}]*\}/g);
  
  if (cardMatches && cardMatches.length > 0) {
    for (const cardText of cardMatches) {
      try {
        const cleanedCard = sanitizeJsonString(cardText);
        const card = JSON.parse(cleanedCard);
        cards.push({
          front: String(card.front || ''),
          back: String(card.back || ''),
          tags: Array.isArray(card.tags) ? card.tags.map(String) : ["extracted"]
        });
      } catch (e) {
        console.error("Failed to parse individual card:", e);
      }
    }
  }
  
  if (cards.length > 0) {
    return cards;
  }
  
  // If we really can't find a proper JSON, create fallback cards based on the text
  return createFallbackCards(text);
}

// Create fallback cards when all other extraction methods fail
function createFallbackCards(text: string): FlashcardGenerationResult[] {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const result: FlashcardGenerationResult[] = [];
  
  // Look for potential question-answer pairs
  let currentQuestion = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Check if this line looks like a question
    if (line.endsWith('?') || /^\d+\./.test(line) || /^[Ww]hat|^[Hh]ow|^[Ww]hy|^[Ww]hen|^[Ww]hich|^[Ww]ho/.test(line)) {
      // Save the previous Q&A pair if we have one
      if (currentQuestion) {
        result.push({
          front: currentQuestion,
          back: "Unable to extract answer from AI response.",
          tags: ["extraction-error", "review-needed"]
        });
      }
      
      currentQuestion = line;
    } else if (currentQuestion) {
      // This might be the answer to our question
      result.push({
        front: currentQuestion,
        back: line,
        tags: ["extraction-fallback", "review-needed"]
      });
      
      currentQuestion = '';
    }
  }
  
  // Don't forget the last question if it exists
  if (currentQuestion) {
    result.push({
      front: currentQuestion,
      back: "Unable to extract answer from AI response.",
      tags: ["extraction-error", "review-needed"]
    });
  }
  
  // If we couldn't extract anything meaningful, create a single card explaining the issue
  if (result.length === 0) {
    result.push({
      front: "AI Response Processing Error",
      back: "The AI response could not be parsed into proper flashcards. Please try again with different content or instructions.",
      tags: ["error", "retry-needed"]
    });
  }
  
  return result;
}

// Fallback function to try to extract cards when JSON parsing fails
function extractCardsManually(text: string): FlashcardGenerationResult[] {
  const cards: FlashcardGenerationResult[] = [];
  
  // Look for a JSON array pattern
  const jsonArrayMatch = text.match(/\[[\s\S]*\]/);
  if (jsonArrayMatch) {
    try {
      const possibleArray = JSON.parse(jsonArrayMatch[0]);
      if (Array.isArray(possibleArray)) {
        return possibleArray.map(item => ({
          front: String(item.front || ''),
          back: String(item.back || ''),
          tags: Array.isArray(item.tags) ? item.tags.map(String) : []
        }));
      }
    } catch (e) {
      // Continue with other extraction methods if this fails
      console.log('Failed to parse JSON array match, trying other methods');
    }
  }
  
  // Extract card components using regex
  const frontRegex = /"front"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  const backRegex = /"back"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  const tagsRegex = /"tags"\s*:\s*\[((?:[^"\\]|\\.|"(?:[^"\\]|\\.)*")*)]/g;
  
  // Get all matches
  const frontMatches = Array.from(text.matchAll(frontRegex));
  const backMatches = Array.from(text.matchAll(backRegex));
  
  if (frontMatches.length > 0 && backMatches.length > 0) {
    // Find the minimum length to avoid index errors
    const minLength = Math.min(frontMatches.length, backMatches.length);
    
    for (let i = 0; i < minLength; i++) {
      const frontContent = frontMatches[i][1] || '';
      const backContent = backMatches[i][1] || '';
      let tags: string[] = ['extracted'];
      
      // Try to get tags for this card
      if (tagsRegex.test(text)) {
        const tagsMatch = Array.from(text.matchAll(tagsRegex))[i];
        if (tagsMatch && tagsMatch[1]) {
          try {
            const tagsStr = `[${tagsMatch[1]}]`;
            const parsedTags = JSON.parse(tagsStr);
            if (Array.isArray(parsedTags)) {
              tags = parsedTags.map(String);
            }
          } catch (e) {
            // Keep default tags if parsing fails
          }
        }
      }
      
      cards.push({
        front: frontContent,
        back: backContent,
        tags
      });
    }
  }
  
  if (cards.length > 0) {
    return cards;
  }
  
  throw new Error('Could not extract cards from response');
}
