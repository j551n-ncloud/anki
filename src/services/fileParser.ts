
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export type SupportedFileType = 'txt' | 'md' | 'csv' | 'json' | 'pdf';

export async function parseFile(file: File): Promise<string> {
  const fileExtension = file.name.split('.').pop()?.toLowerCase() as SupportedFileType;
  
  switch (fileExtension) {
    case 'txt':
    case 'md':
      return parseTextFile(file);
    case 'csv':
      return parseCSV(file);
    case 'json':
      return parseJSON(file);
    case 'pdf':
      return parsePDF(file);
    default:
      throw new Error(`Unsupported file type: ${fileExtension}`);
  }
}

function parseTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string || '');
    reader.onerror = (e) => reject(new Error('Error reading text file'));
    reader.readAsText(file);
  });
}

function parseCSV(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string || '';
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        let result = '';
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length !== headers.length) continue;
          
          const lineObj: Record<string, string> = {};
          headers.forEach((header, index) => {
            lineObj[header] = values[index];
          });
          
          result += Object.entries(lineObj)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n') + '\n\n';
        }
        
        resolve(result);
      } catch (error) {
        reject(new Error('Error parsing CSV file'));
      }
    };
    reader.onerror = (e) => reject(new Error('Error reading CSV file'));
    reader.readAsText(file);
  });
}

function parseJSON(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string || '';
        const json = JSON.parse(text);
        resolve(JSON.stringify(json, null, 2));
      } catch (error) {
        reject(new Error('Error parsing JSON file'));
      }
    };
    reader.onerror = (e) => reject(new Error('Error reading JSON file'));
    reader.readAsText(file);
  });
}

async function parsePDF(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const pdfData = new Uint8Array(arrayBuffer);
        
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const pdf = await loadingTask.promise;
        
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const textItems = textContent.items.map((item: any) => item.str).join(' ');
          fullText += textItems + '\n\n';
        }
        
        resolve(fullText);
      } catch (error) {
        console.error('PDF parsing error:', error);
        reject(new Error('Error parsing PDF file'));
      }
    };
    reader.onerror = (e) => reject(new Error('Error reading PDF file'));
    reader.readAsArrayBuffer(file);
  });
}
