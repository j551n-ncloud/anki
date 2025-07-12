// Type definitions for PDF.js
declare module 'pdfjs-dist' {
    export const version: string;
    
    export interface PDFDocumentProxy {
      numPages: number;
      getPage(pageNumber: number): Promise<PDFPageProxy>;
    }
    
    export interface PDFPageProxy {
      getTextContent(): Promise<PDFTextContent>;
    }
    
    export interface PDFTextContent {
      items: Array<{
        str: string;
        dir?: string;
        width?: number;
        height?: number;
        transform?: number[];
        fontName?: string;
      }>;
    }
    
    export interface PDFDocumentLoadingTask {
      promise: Promise<PDFDocumentProxy>;
    }
    
    export interface GetDocumentParams {
      url?: string;
      data?: ArrayBuffer | Uint8Array;
      httpHeaders?: Record<string, string>;
      withCredentials?: boolean;
      password?: string;
    }
    
    export function getDocument(params: GetDocumentParams): PDFDocumentLoadingTask;
    
    export const GlobalWorkerOptions: {
      workerSrc: string;
    };
  }