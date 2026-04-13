import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Ingredient } from '../../core/models/ingredient';
import { OcrLine, OcrService } from '../../core/services/ocr';
import { StorageService } from '../../core/services/storage';

interface ReviewRow extends OcrLine {
  selected: boolean;
  resolvedPricePerKg: number;
}

type Status = 'idle' | 'processing' | 'review' | 'done' | 'error';

@Component({
  selector: 'app-documents-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './documents-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsPage {
  private readonly ocr = inject(OcrService);
  private readonly storage = inject(StorageService);

  status = signal<Status>('idle');
  errorMessage = signal('');
  rows = signal<ReviewRow[]>([]);
  preview = signal<string | null>(null);

  async onFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Image preview
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      this.preview.set(url);
    } else {
      this.preview.set(null);
    }

    this.status.set('processing');
    this.errorMessage.set('');

    try {
      const lines = await this.ocr.extractFromImage(file);
      this.rows.set(
        lines.map(l => ({
          ...l,
          selected: true,
          resolvedPricePerKg: l.pricePerKg ?? 0,
        }))
      );
      this.status.set('review');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Errore sconosciuto';
      this.errorMessage.set(message);
      this.status.set('error');
    } finally {
      input.value = '';
    }
  }

  updateRow(index: number, patch: Partial<ReviewRow>): void {
    this.rows.update(rs => {
      const copy = [...rs];
      copy[index] = { ...copy[index], ...patch };
      return copy;
    });
  }

  confirm(): void {
    const existing = this.storage.getIngredients();
    const selected = this.rows().filter(r => r.selected && r.name.trim());
    const now = new Date().toISOString();

    const updated = [...existing];
    for (const row of selected) {
      const existingIdx = updated.findIndex(
        i => i.name.toLowerCase() === row.name.trim().toLowerCase()
      );
      if (existingIdx >= 0) {
        updated[existingIdx] = {
          ...updated[existingIdx],
          pricePerUnit: row.resolvedPricePerKg,
          unit: 'kg',
          updatedAt: now,
        };
      } else {
        const newIng: Ingredient = {
          id: crypto.randomUUID(),
          name: row.name.trim(),
          pricePerUnit: row.resolvedPricePerKg,
          category: 'food',
          unit: 'kg',
          updatedAt: now,
        };
        updated.push(newIng);
      }
    }

    this.storage.saveIngredients(updated);
    this.status.set('done');
    if (this.preview()) {
      URL.revokeObjectURL(this.preview()!);
      this.preview.set(null);
    }
  }

  reset(): void {
    if (this.preview()) {
      URL.revokeObjectURL(this.preview()!);
      this.preview.set(null);
    }
    this.rows.set([]);
    this.status.set('idle');
  }
}

