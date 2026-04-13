import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Ingredient } from '../../core/models/ingredient';
import { Recipe, RecipeLine } from '../../core/models/recipe';
import { StorageService } from '../../core/services/storage';
import { FoodCostService } from '../../core/services/food-cost';

type ViewMode = 'list' | 'form';

@Component({
  selector: 'app-recipes-page',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './recipes-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipesPage {
  private readonly storage = inject(StorageService);
  private readonly fc = inject(FoodCostService);

  recipes = signal<Recipe[]>(this.storage.getRecipes());
  ingredients = signal<Ingredient[]>(this.storage.getIngredients());
  viewMode = signal<ViewMode>('list');
  editingId = signal<string | null>(null);
  filter = signal<'all' | 'recipe' | 'subrecipe'>('all');

  formName = signal('');
  formDescription = signal('');
  formIsSubRecipe = signal(false);
  formMinutes = signal(30);
  formLines = signal<RecipeLine[]>([]);

  newLineRefId = signal('');
  newLineRefType = signal<'ingredient' | 'subrecipe'>('ingredient');
  newLineGrams = signal(100);

  settings = computed(() => this.storage.getSettings());

  filteredRecipes = computed(() => {
    const f = this.filter();
    return this.recipes().filter(r =>
      f === 'all' ? true : f === 'recipe' ? !r.isSubRecipe : r.isSubRecipe
    );
  });

  availableRefs = computed(() => {
    const type = this.newLineRefType();
    if (type === 'ingredient') {
      return this.ingredients().map(i => ({ id: i.id, name: i.name }));
    }
    return this.recipes()
      .filter(r => r.isSubRecipe && r.id !== this.editingId())
      .map(r => ({ id: r.id, name: r.name }));
  });

  lineCost(line: RecipeLine): number {
    return this.fc.calcLineCost(line, this.ingredients(), this.recipes());
  }

  totalFormCost = computed(() => {
    const lines = this.formLines();
    const total = lines.reduce(
      (s, l) => s + this.fc.calcLineCost(l, this.ingredients(), this.recipes()),
      0
    );
    const prep = this.formMinutes();
    const s = this.settings();
    return total + this.fc.calcLaborCost(s, prep) + this.fc.calcEnergyCost(s, prep);
  });

  recipeTotalCost(recipe: Recipe): number {
    return this.fc.calcTotalCost(recipe, this.ingredients(), this.recipes(), this.settings());
  }

  openAdd(): void {
    this.editingId.set(null);
    this.formName.set('');
    this.formDescription.set('');
    this.formIsSubRecipe.set(false);
    this.formMinutes.set(30);
    this.formLines.set([]);
    this.viewMode.set('form');
  }

  openEdit(r: Recipe): void {
    this.editingId.set(r.id);
    this.formName.set(r.name);
    this.formDescription.set(r.description);
    this.formIsSubRecipe.set(r.isSubRecipe);
    this.formMinutes.set(r.preparationMinutes);
    this.formLines.set([...r.lines]);
    this.viewMode.set('form');
  }

  addLine(): void {
    const refId = this.newLineRefId();
    if (!refId) return;
    const refs = this.availableRefs();
    const ref = refs.find(r => r.id === refId);
    if (!ref) return;
    const line: RecipeLine = {
      id: crypto.randomUUID(),
      refId,
      refType: this.newLineRefType(),
      name: ref.name,
      grams: this.newLineGrams(),
    };
    this.formLines.update(ls => [...ls, line]);
    this.newLineRefId.set('');
    this.newLineGrams.set(100);
  }

  removeLine(id: string): void {
    this.formLines.update(ls => ls.filter(l => l.id !== id));
  }

  save(): void {
    if (!this.formName().trim()) return;
    const now = new Date().toISOString();
    const id = this.editingId();
    const recipe: Recipe = {
      id: id ?? crypto.randomUUID(),
      name: this.formName(),
      description: this.formDescription(),
      isSubRecipe: this.formIsSubRecipe(),
      preparationMinutes: this.formMinutes(),
      lines: this.formLines(),
      totalCost: this.totalFormCost(),
      createdAt: id
        ? (this.recipes().find(r => r.id === id)?.createdAt ?? now)
        : now,
      updatedAt: now,
    };
    let updated: Recipe[];
    if (id) {
      updated = this.recipes().map(r => (r.id === id ? recipe : r));
    } else {
      updated = [...this.recipes(), recipe];
    }
    this.recipes.set(updated);
    this.storage.saveRecipes(updated);
    this.viewMode.set('list');
  }

  delete(id: string): void {
    const updated = this.recipes().filter(r => r.id !== id);
    this.recipes.set(updated);
    this.storage.saveRecipes(updated);
  }

  cancel(): void {
    this.viewMode.set('list');
  }
}

