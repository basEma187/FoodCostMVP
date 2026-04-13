import { Injectable } from '@angular/core';
import { Ingredient } from '../models/ingredient';
import { Recipe, RecipeLine } from '../models/recipe';
import { AppSettings } from '../models/settings';

@Injectable({ providedIn: 'root' })
export class FoodCostService {

  /**
   * Cost of a single recipe line in euro.
   * For ingredients: pricePerKg * grams / 1000
   * For sub-recipes: subRecipeTotalCost * grams / 1000 (treat cost/kg)
   */
  calcLineCost(
    line: RecipeLine,
    ingredients: Ingredient[],
    recipes: Recipe[]
  ): number {
    if (line.refType === 'ingredient') {
      const ing = ingredients.find(i => i.id === line.refId);
      if (!ing) return 0;
      return (ing.pricePerKg * line.grams) / 1000;
    } else {
      const sub = recipes.find(r => r.id === line.refId);
      if (!sub || !sub.totalCost) return 0;
      // sub-recipe cost is treated as cost per kg of yield
      return (sub.totalCost * line.grams) / 1000;
    }
  }

  calcRecipeCost(
    recipe: Recipe,
    ingredients: Ingredient[],
    recipes: Recipe[]
  ): number {
    return recipe.lines.reduce(
      (sum, line) => sum + this.calcLineCost(line, ingredients, recipes),
      0
    );
  }

  calcLaborCost(settings: AppSettings, preparationMinutes: number): number {
    const hourlyCost =
      (settings.averageMonthlySalary * settings.staffCount) / 160;
    return hourlyCost * (preparationMinutes / 60);
  }

  calcEnergyCost(
    settings: AppSettings,
    preparationMinutes: number,
    powerKw = 2
  ): number {
    return settings.electricityCostPerKwh * powerKw * (preparationMinutes / 60);
  }

  calcTotalCost(
    recipe: Recipe,
    ingredients: Ingredient[],
    recipes: Recipe[],
    settings: AppSettings
  ): number {
    const ingredients$ = this.calcRecipeCost(recipe, ingredients, recipes);
    const labor = this.calcLaborCost(settings, recipe.preparationMinutes);
    const energy = this.calcEnergyCost(settings, recipe.preparationMinutes);
    return ingredients$ + labor + energy;
  }
}
