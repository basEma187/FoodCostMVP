import { Injectable } from '@angular/core';
import { Ingredient, UNITS } from '../models/ingredient';
import { Recipe, RecipeLine } from '../models/recipe';
import { AppSettings } from '../models/settings';

@Injectable({ providedIn: 'root' })
export class FoodCostService {

  /**
   * Cost of a single recipe line in euro.
   *
   * For ingredients: normalises line.quantity to the ingredient's unit using
   * toBase conversion factors, then multiplies by pricePerUnit.
   *
   * For sub-recipes: treats sub-recipe totalCost as €/kg and converts
   * line.quantity (in its unit) to grams.
   */
  calcLineCost(
    line: RecipeLine,
    ingredients: Ingredient[],
    recipes: Recipe[]
  ): number {
    const lineUnitDef = UNITS.find(u => u.key === line.unit) ?? UNITS[0];

    if (line.refType === 'ingredient') {
      const ing = ingredients.find(i => i.id === line.refId);
      if (!ing) return 0;
      const ingUnitDef = UNITS.find(u => u.key === ing.unit) ?? UNITS[0];
      // Convert quantity in line unit → ingredient unit, then × pricePerUnit
      const qtyInIngUnit = (line.quantity * lineUnitDef.toBase) / ingUnitDef.toBase;
      return ing.pricePerUnit * qtyInIngUnit;
    } else {
      const sub = recipes.find(r => r.id === line.refId);
      if (!sub || !sub.totalCost) return 0;
      // Sub-recipe cost is treated as €/kg of yield
      const quantityInGrams = line.quantity * lineUnitDef.toBase;
      return (sub.totalCost * quantityInGrams) / 1000;
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
