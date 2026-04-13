import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Ingredient, IngredientCategory } from '../../core/models/ingredient';
import { StorageService } from '../../core/services/storage';

@Component({
  selector: 'app-catalog-page',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './catalog-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogPage {
  private readonly storage = inject(StorageService);

  ingredients = signal<Ingredient[]>(this.storage.getIngredients());
  editingId = signal<string | null>(null);

  form = signal<Omit<Ingredient, 'id' | 'updatedAt'>>({
    name: '',
    pricePerKg: 0,
    category: 'food',
    unit: 'kg',
  });

  readonly categories: IngredientCategory[] = ['food', 'beverage'];

  sortedIngredients = computed(() =>
    [...this.ingredients()].sort((a, b) => a.name.localeCompare(b.name))
  );

  openAdd(): void {
    this.editingId.set(null);
    this.form.set({ name: '', pricePerKg: 0, category: 'food', unit: 'kg' });
  }

  openEdit(ing: Ingredient): void {
    this.editingId.set(ing.id);
    this.form.set({ name: ing.name, pricePerKg: ing.pricePerKg, category: ing.category, unit: ing.unit });
  }

  save(): void {
    const f = this.form();
    if (!f.name.trim()) return;
    const now = new Date().toISOString();
    const id = this.editingId();
    let updated: Ingredient[];
    if (id) {
      updated = this.ingredients().map(i =>
        i.id === id ? { ...i, ...f, updatedAt: now } : i
      );
    } else {
      const newIng: Ingredient = { id: crypto.randomUUID(), ...f, updatedAt: now };
      updated = [...this.ingredients(), newIng];
    }
    this.ingredients.set(updated);
    this.storage.saveIngredients(updated);
    this.editingId.set(null);
    this.form.set({ name: '', pricePerKg: 0, category: 'food', unit: 'kg' });
  }

  delete(id: string): void {
    const updated = this.ingredients().filter(i => i.id !== id);
    this.ingredients.set(updated);
    this.storage.saveIngredients(updated);
  }

  updateForm(patch: Partial<Omit<Ingredient, 'id' | 'updatedAt'>>): void {
    this.form.update(f => ({ ...f, ...patch }));
  }
}

