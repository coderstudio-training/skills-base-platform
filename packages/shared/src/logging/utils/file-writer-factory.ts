import { LoggerOptions } from '../types';
import { FileWriterManager } from './file-writer';

export async function writeToFile(
  message: string,
  options: Required<LoggerOptions>,
): Promise<void> {
  try {
    const writer = await FileWriterManager.getWriter({
      filename: options.filename,
      maxSize: options.maxSize,
      maxFiles: options.maxFiles,
      compress: true,
    });

    await writer.write(message);
  } catch (error) {
    console.error('Failed to write to log file:', error);
    // Fallback to console
    console.log(message);
  }
}
