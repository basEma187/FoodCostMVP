import { Injectable } from '@angular/core';
import { Ingredient } from '../models/ingredient';
import { Recipe } from '../models/recipe';
import { AppSettings } from '../models/settings';

const KEYS = {
  ingredients: 'fc_ingredients',
  recipes: 'fc_recipes',
  settings: 'fc_settings',
} as const;

const DEFAULT_SETTINGS: AppSettings = {
  electricityCostPerKwh: 0.25,
  staffCount: 1,
  averageMonthlySalary: 1800,
  ocrProvider: 'tesseract',
  openaiApiKey: '',
};

@Injectable({ providedIn: 'root' })
export class StorageService {

  getIngredients(): Ingredient[] {
    return this.load<Ingredient[]>(KEYS.ingredients) ?? [];
  }

  saveIngredients(ingredients: Ingredient[]): void {
    this.persist(KEYS.ingredients, ingredients);
  }

  getRecipes(): Recipe[] {
    return this.load<Recipe[]>(KEYS.recipes) ?? [];
  }

  saveRecipes(recipes: Recipe[]): void {
    this.persist(KEYS.recipes, recipes);
  }

  getSettings(): AppSettings {
    return this.load<AppSettings>(KEYS.settings) ?? { ...DEFAULT_SETTINGS };
  }

  saveSettings(settings: AppSettings): void {
    this.persist(KEYS.settings, settings);
  }

  private load<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  private persist(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
