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
  const result = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,