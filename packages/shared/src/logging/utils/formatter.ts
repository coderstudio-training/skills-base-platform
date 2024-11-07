export function formatLogMessage(data: any, format: 'json' | 'text'): string {
  if (format === 'json') {
    return JSON.stringify(data);
  }

  const { level, message, context } = data;
  const timestamp = context.timestamp;
  const service = context.service;
  const correlationId = context.correlationId || '';

  return `[${timestamp}] ${level.toUpperCase()} [${service}] ${correlationId} - ${message}`;
}
// src/logging/utils/file-writer.ts
import { promises as fs } from 'fs';
import { LoggerOptions } from '../types';

export async function writeToFile(
  message: string,
  options: Required<LoggerOptions>,
) {
  try {
    const { filename, maxSize, maxFiles } = options;

    // Check file size
    let stats;
    try {
      stats = await fs.stat(filename);
    } catch {
      // File doesn't exist yet
      stats = { size: 0 };
    }

    // Rotate if necessary
    if (stats.size >= maxSize) {
      for (let i = maxFiles - 1; i > 0; i--) {
        try {
          await fs.rename(`${filename}.${i - 1}`, `${filename}.${i}`);
        } catch {
          // File doesn't exist, skip
        }
      }
      try {
        await fs.rename(filename, `${filename}.0`);
      } catch {
        // File doesn't exist, skip
      }
    }

    // Append log
    await fs.appendFile(filename, message + '\n');
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}
