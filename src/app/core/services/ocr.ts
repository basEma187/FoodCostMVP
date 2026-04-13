import { inject, Injectable } from '@angular/core';
import { UnitKey } from '../models/ingredient';
import { StorageService } from './storage';

export interface OcrLine {
  name: string;
  quantity: string;
  unit: UnitKey;
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
                  'Extract all ingredient line items from this delivery note or invoice. ' +
                  'Return a JSON array where each element has these fields:\n' +
                  '  name: string (ingredient name only, no numbers or units)\n' +
                  '  quantity: string (numeric quantity, e.g. "5")\n' +
                  '  unit: string (one of: kg, g, l, ml, pz)\n' +
                  '  unitPrice: string (price per unit as decimal, e.g. "3.50")\n' +
                  '  pricePerKg: number or null (price per kg/litre if calculable)\n' +
                  'Return ONLY the raw JSON array, no markdown fences, no extra text.',
              },
              {
                type: 'image_url',
                image_url: { url: `data:${mime};base64,${base64}` },
              },
            ],
          },
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const json = await response.json();
    const text: string = json.choices?.[0]?.message?.content ?? '[]';
    try {
      const parsed = JSON.parse(text) as OcrLine[];
      return parsed.map(l => this.normalizeOcrLine(l));
    } catch {
      return this.parsePlainText(text);
    }
  }

  /**
   * Tries to parse each line of raw OCR text into a structured OcrLine.
   * Handles common invoice/delivery-note formats:
   *   "Mozzarella fior di latte   2 kg   € 4,50/kg   9,00"
   *   "Pomodori San Marzano 5.000 kg 1,20"
   *   "Olio EVO 1 l 8,00"
   */
  private parsePlainText(text: string): OcrLine[] {
    const lines = text
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 2);

    const results: OcrLine[] = [];

    for (const line of lines) {
      const parsed = this.parseInvoiceLine(line);
      if (parsed) {
        results.push(parsed);
      }
    }

    // If we couldn't parse any structured data, fall back to name-only rows
    if (results.length === 0) {
      return lines
        .filter(l => l.length > 3)
        .map(l => this.buildNameOnlyLine(l));
    }

    return results;
  }

  /**
   * Attempts to parse an invoice line into structured fields.
   * Returns null if the line looks like a header, total, or non-product row.
   */
  private parseInvoiceLine(line: string): OcrLine | null {
    // Normalise: replace comma decimals with dots, collapse spaces
    const norm = line
      .replace(/,(?=\d{2}(\s|$))/g, '.') // 4,50 -> 4.50
      .replace(/\s+/g, ' ');

    // Skip lines that are clearly headers or totals
    if (/^(totale|total|subtotal|iva|vat|data|data\s+ord|descr|desc|qt|qty|q\.ta|um|um\.|prezzo|price|importo|amount|\s*[-#=]+\s*)$/i.test(norm)) {
      return null;
    }

    // Pattern: <name> <qty> <unit> <price>
    // Example: "Mozzarella 2 kg 9.00" or "Olio EVO 1 l 8.00"
    const fullPattern =
      /^(.+?)\s+([\d.]+)\s*(kg|g|l|ml|lt|ltr|litri|pz|pezzi|n|nr|ud|un)\s+(?:[€$]?\s*)?([\d.]+)(?:\s.*)?$/i;

    const fullMatch = norm.match(fullPattern);
    if (fullMatch) {
      const rawName = fullMatch[1].trim();
      const qty = fullMatch[2];
      const rawUnit = fullMatch[3].toLowerCase();
      const price = fullMatch[4];

      if (this.looksLikeName(rawName)) {
        const unit = this.normaliseUnit(rawUnit);
        const priceNum = parseFloat(price);
        const qtyNum = parseFloat(qty);
        return {
          name: rawName,
          quantity: qty,
          unit,
          unitPrice: price,
          pricePerKg: this.calcPricePerKg(priceNum, qtyNum, unit),
        };
      }
    }

    // Pattern: <name> <price> (no explicit unit / qty)
    const simplePattern = /^(.+?)\s+(?:[€$]?\s*)?([\d.]+)\s*$/;
    const simpleMatch = norm.match(simplePattern);
    if (simpleMatch) {
      const rawName = simpleMatch[1].trim();
      const price = simpleMatch[2];
      if (this.looksLikeName(rawName) && !isNaN(parseFloat(price))) {
        return {
          name: rawName,
          quantity: '',
          unit: 'kg',
          unitPrice: price,
          pricePerKg: null,
        };
      }
    }

    return null;
  }

  private looksLikeName(s: string): boolean {
    // Name must have at least one letter, not be a pure number
    return /[a-zA-ZàâäéèêëîïôùûüçÀÂÄÉÈÊËÎÏÔÙÛÜÇ]/.test(s) && s.length >= 2;
  }

  private normaliseUnit(raw: string): UnitKey {
    const map: Record<string, UnitKey> = {
      kg: 'kg', g: 'g',
      l: 'l', lt: 'l', ltr: 'l', litri: 'l',
      ml: 'ml',
      pz: 'pz', pezzi: 'pz', n: 'pz', nr: 'pz', ud: 'pz', un: 'pz',
    };
    return map[raw] ?? 'kg';
  }

  private calcPricePerKg(
    totalPrice: number,
    qty: number,
    unit: UnitKey
  ): number | null {
    if (isNaN(totalPrice) || isNaN(qty) || qty === 0) return null;
    // price given is total for qty units
    const unitPrice = totalPrice / qty;
    switch (unit) {
      case 'kg': return unitPrice;
      case 'g':  return unitPrice * 1000;
      case 'l':  return unitPrice;       // treat litres same as kg
      case 'ml': return unitPrice * 1000;
      default:   return null;            // pz: no weight conversion
    }
  }

  private normalizeOcrLine(l: OcrLine): OcrLine {
    return {
      name: (l.name ?? '').trim(),
      quantity: l.quantity ?? '',
      unit: this.normaliseUnit((l.unit ?? 'kg').toLowerCase()),
      unitPrice: l.unitPrice ?? '',
      pricePerKg: l.pricePerKg ?? null,
    };
  }

  private buildNameOnlyLine(name: string): OcrLine {
    return { name, quantity: '', unit: 'kg', unitPrice: '', pricePerKg: null };
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
