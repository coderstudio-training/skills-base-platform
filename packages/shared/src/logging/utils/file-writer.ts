import { createReadStream, createWriteStream, promises as fs } from 'fs';
import { dirname } from 'path';
import { pipeline } from 'stream/promises';
import { createGzip } from 'zlib';

export interface FileWriterOptions {
  filename: string;
  maxSize: number;
  maxFiles: number;
  compress?: boolean;
}

export class FileWriter {
  private currentSize: number = 0;
  private writeStream: fs.FileHandle | null = null;
  private readonly options: Required<FileWriterOptions>;
  private locked: boolean = false;

  constructor(options: FileWriterOptions) {
    this.options = {
      compress: true,
      ...options,
    };
  }

  async initialize(): Promise<void> {
    try {
      // Ensure directory exists
      await fs.mkdir(dirname(this.options.filename), { recursive: true });

      // Get current file size if exists
      try {
        const stats = await fs.stat(this.options.filename);
        this.currentSize = stats.size;
      } catch {
        this.currentSize = 0;
      }

      // Open file for appending
      this.writeStream = await fs.open(this.options.filename, 'a');
    } catch (error) {
      console.error('Failed to initialize file writer:', error);
      throw error;
    }
  }

  private async rotateLog(): Promise<void> {
    if (!this.writeStream) {
      return;
    }

    // Close current write stream
    await this.writeStream.close();
    this.writeStream = null;

    // Rotate files
    for (let i = this.options.maxFiles - 1; i >= 0; i--) {
      const currentFile =
        i === 0 ? this.options.filename : `${this.options.filename}.${i}`;
      const nextFile = `${this.options.filename}.${i + 1}`;

      try {
        // Check if current file exists
        await fs.access(currentFile);

        if (i === this.options.maxFiles - 1) {
          // Delete oldest file
          await fs.unlink(currentFile);
        } else if (this.options.compress && i === 0) {
          // Compress the current log file
          await this.compressFile(currentFile, `${nextFile}.gz`);
        } else {
          // Rename file
          await fs.rename(currentFile, nextFile);
        }
      } catch (error) {
        // File doesn't exist, skip
        console.error('File does not exist, skipping...', error);
        continue;
      }
    }

    // Create new file
    this.writeStream = await fs.open(this.options.filename, 'a');
    this.currentSize = 0;
  }

  private async compressFile(
    source: string,
    destination: string,
  ): Promise<void> {
    const gzip = createGzip();
    const sourceStream = createReadStream(source);
    const destinationStream = createWriteStream(destination);

    try {
      await pipeline(sourceStream, gzip, destinationStream);
      await fs.unlink(source); // Delete original file after compression
    } catch (error) {
      console.error('Failed to compress log file:', error);
      throw error;
    }
  }

  async write(message: string): Promise<void> {
    if (!this.writeStream) {
      await this.initialize();
    }

    // Add newline if not present
    const data = message.endsWith('\n') ? message : message + '\n';

    // Wait if another write operation is in progress
    while (this.locked) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    try {
      this.locked = true;

      // Check if rotation is needed
      if (this.currentSize + data.length > this.options.maxSize) {
        await this.rotateLog();
      }

      // Write to file
      await this.writeStream!.write(data);
      this.currentSize += data.length;
    } catch (error) {
      console.error('Failed to write to log file:', error);
      throw error;
    } finally {
      this.locked = false;
    }
  }

  async cleanup(): Promise<void> {
    try {
      if (this.writeStream) {
        await this.writeStream.close();
        this.writeStream = null;
      }
    } catch (error) {
      console.error('Failed to cleanup file writer:', error);
      throw error;
    }
  }
}

// Helper function to handle multiple file writers
export class FileWriterManager {
  private static writers: Map<string, FileWriter> = new Map();

  static async getWriter(options: FileWriterOptions): Promise<FileWriter> {
    const key = `${options.filename}-${options.maxSize}-${options.maxFiles}`;

    if (!this.writers.has(key)) {
      const writer = new FileWriter(options);
      await writer.initialize();
      this.writers.set(key, writer);
    }

    return this.writers.get(key)!;
  }

  static async cleanup(): Promise<void> {
    for (const writer of this.writers.values()) {
      await writer.cleanup();
    }
    this.writers.clear();
  }
}
