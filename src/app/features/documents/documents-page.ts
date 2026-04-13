import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Ingredient, UNITS, UnitKey } from '../../core/models/ingredient';
import { OcrLine, OcrService } from '../../core/services/ocr';
import { StorageService } from '../../core/services/storage';

export interface ReviewRow extends OcrLine {
  selected: boolean;
  resolvedPricePerUnit: number;
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

  readonly units = UNITS;

  status = signal<Status>('idle');
  errorMessage = signal('');
  rows = signal<ReviewRow[]>([]);
  preview = signal<string | null>(null);

  selectedCount = computed(() => this.rows().filter(r => r.selected && r.name.trim()).length);

  async onFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

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
          resolvedPricePerUnit: l.pricePerKg ?? (l.unitPrice ? parseFloat(l.unitPrice) : 0),
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

  unitLabel(key: UnitKey): string {
    return UNITS.find(u => u.key === key)?.short ?? key;
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
          pricePerUnit: row.resolvedPricePerUnit,
          unit: row.unit,
          updatedAt: now,
        };
      } else {
        const newIng: Ingredient = {
          id: crypto.randomUUID(),
          name: row.name.trim(),
          pricePerUnit: row.resolvedPricePerUnit,
          category: 'food',
          unit: row.unit,
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

