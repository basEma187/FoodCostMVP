export interface RecipeLine {
  id: string;
  /** ingredientId OR subRecipeId */
  refId: string;
  refType: 'ingredient' | 'subrecipe';
  name: string;
  grams: number;
  /** calculated in service */
  lineCost?: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  isSubRecipe: boolean;
  lines: RecipeLine[];
  preparationMinutes: number;
  /** cached total calculated cost */
  totalCost?: number;
  createdAt: string;
  updatedAt: string;
}
