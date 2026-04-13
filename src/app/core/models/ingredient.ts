export type IngredientCategory = 'food' | 'beverage';

export interface Ingredient {
  id: string;
  name: string;
  pricePerKg: number;
  category: IngredientCategory;
  unit: string; // display label only, always stored as kg
  updatedAt: string; // ISO date string
}
