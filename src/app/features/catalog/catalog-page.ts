import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Ingredient, IngredientCategory, UNITS, UnitKey } from '../../core/models/ingredient';
import { StorageService } from '../../core/services/storage';
import { AppSelectComponent } from '../../shared/app-select';

@Component({
  selector: 'app-catalog-page',
  imports: [FormsModule, DecimalPipe, AppSelectComponent],
  templateUrl: './catalog-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogPage {
  private readonly storage = inject(StorageService);

  readonly units = UNITS;
  readonly unitOptions = UNITS.map(u => ({ value: u.key, label: `${u.short} — ${u.label}` }));
  readonly categories: IngredientCategory[] = ['food', 'beverage'];

  ingredients = signal<Ingredient[]>(this.storage.getIngredients());
  editingId = signal<string | null>(null);
  formOpen = signal(false);

  form = signal<Omit<Ingredient, 'id' | 'updatedAt'>>({
    name: '',
    pricePerUnit: 0,
    unit: 'kg',
    category: 'food',
  });

  sortedIngredients = computed(() =>
    [...this.ingredients()].sort((a, b) => a.name.localeCompare(b.name))
  );

  openAdd(): void {
    this.editingId.set(null);
    this.form.set({ name: '', pricePerUnit: 0, unit: 'kg', category: 'food' });
    this.formOpen.set(true);
  }

  openEdit(ing: Ingredient): void {
    this.editingId.set(ing.id);
    this.form.set({
      name: ing.name,
      pricePerUnit: ing.pricePerUnit,
      unit: ing.unit,
      category: ing.category,
    });
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.editingId.set(null);
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
    this.closeForm();
  }

  delete(id: string): void {
    const updated = this.ingredients().filter(i => i.id !== id);
    this.ingredients.set(updated);
    this.storage.saveIngredients(updated);
  }

  updateForm(patch: Partial<Omit<Ingredient, 'id' | 'updatedAt'>>): void {
    this.form.update(f => ({ ...f, ...patch }));
  }

  unitShort(key: UnitKey): string {
    return UNITS.find(u => u.key === key)?.short ?? key;
  }
}

