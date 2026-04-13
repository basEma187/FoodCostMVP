import { inject, Injectable } from '@angular/core';
import { StorageService } from './storage';

export interface OcrLine {
  name: string;
  quantity: string;
  unitPrice: string;
  pricePerKg: number | null;
}

@Injectable({ providedIn: 'root' })
export class OcrService {
  private readonly storage = inject(StorageService);

  async extractFromImage(file: File): Promise<OcrLine[]> {
    const settings = this.storage.getSettings();
    if (settings.ocrProvider === 'openai' && settings.openaiApiKey) {
      return this.extractWithOpenAI(file, settings.openaiApiKey);
    }
    return this.extractWithTesseract(file);
  }

  private async extractWithTesseract(file: File): Promise<OcrLine[]> {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('ita+eng');
    const url = URL.createObjectURL(file);
    try {
      const { data } = await worker.recognize(url);
      return this.parsePlainText(data.text);
    } finally {
      URL.revokeObjectURL(url);
      await worker.terminate();
    }
  }

  private async extractWithOpenAI(
    file: File,
    apiKey: string
  ): Promise<OcrLine[]> {
    const base64 = await this.fileToBase64(file);
    const mime = file.type || 'image/jpeg';
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text:
                  'Extract all line items from this delivery note or invoice. ' +
                  'Return a JSON array with objects: ' +
                  '{ name: string, quantity: string, unitPrice: string, pricePerKg: number|null }. ' +
                  'pricePerKg should be the price per kg if calculable, otherwise null. ' +
                  'Return ONLY the JSON array, no markdown fences.',
              },
              {
                type: 'image_url',
                image_url: { url: `data:${mime};base64,${base64}` },
              },
            ],
          },
        ],
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const json = await response.json();
    const text: string = json.choices?.[0]?.message?.content ?? '[]';
    try {
      return JSON.parse(text) as OcrLine[];
    } catch {
      return this.parsePlainText(text);
    }
  }

  private parsePlainText(text: string): OcrLine[] {
    return text
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 3)
      .map(l => ({
        name: l,
        quantity: '',
        unitPrice: '',
        pricePerKg: null,
      }));
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
