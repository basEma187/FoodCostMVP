import { TestBed } from '@angular/core/testing';
import { FoodCostService } from './food-cost';
import { Ingredient } from '../models/ingredient';
import { Recipe, RecipeLine } from '../models/recipe';
import { AppSettings } from '../models/settings';

describe('FoodCostService', () => {
  let service: FoodCostService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoodCostService);
  });

  // ── Helpers ────────────────────────────────────────────────────────────────
  const makeIngredient = (overrides: Partial<Ingredient> = {}): Ingredient => ({
    id: '1', name: 'Test', pricePerUnit: 10, unit: 'kg',
    category: 'food', updatedAt: '',
    ...overrides,
  });

  const makeSettings = (): AppSettings => ({
    electricityCostPerKwh: 0.25,
    staffCount: 2,
    averageMonthlySalary: 1600,
    ocrProvider: 'tesseract',
    openaiApiKey: '',
  });

  const makeLine = (overrides: Partial<RecipeLine> = {}): RecipeLine => ({
    id: 'l1', refId: '1', refType: 'ingredient',
    name: 'Test', quantity: 1, unit: 'kg',
    ...overrides,
  });

  // ── calcLineCost ───────────────────────────────────────────────────────────
  describe('calcLineCost – ingredient', () => {
    it('calculates cost when line unit matches ingredient unit (kg)', () => {
      const ing = makeIngredient({ pricePerUnit: 10, unit: 'kg' });
      const line = makeLine({ quantity: 0.5, unit: 'kg' });
      expect(service.calcLineCost(line, [ing], [])).toBeCloseTo(5);
    });

    it('converts grams to kg for a kg-priced ingredient', () => {
      const ing = makeIngredient({ pricePerUnit: 10, unit: 'kg' });
      const line = makeLine({ quantity: 500, unit: 'g' });
      // 500 g → 0.5 kg → 0.5 × 10 = 5 €
      expect(service.calcLineCost(line, [ing], [])).toBeCloseTo(5);
    });

    it('converts litres to ml for an ml-priced ingredient', () => {
      const ing = makeIngredient({ pricePerUnit: 0.002, unit: 'ml' }); // 0.002 €/ml
      const line = makeLine({ quantity: 0.5, unit: 'l' }); // 0.5 l = 500 ml
      // 500 ml × 0.002 = 1 €
      expect(service.calcLineCost(line, [ing], [])).toBeCloseTo(1);
    });

    it('handles pz (per piece) unit without conversion', () => {
      const ing = makeIngredient({ pricePerUnit: 0.5, unit: 'pz' });
      const line = makeLine({ quantity: 4, unit: 'pz' });
      expect(service.calcLineCost(line, [ing], [])).toBeCloseTo(2);
    });

    it('returns 0 when ingredient is not found', () => {
      const line = makeLine({ refId: 'missing' });
      expect(service.calcLineCost(line, [], [])).toBe(0);
    });
  });

  describe('calcLineCost – sub-recipe', () => {
    it('calculates cost treating sub-recipe totalCost as €/kg', () => {
      const sub: Recipe = {
        id: 'sub1', name: 'Fondo', description: '', isSubRecipe: true,
        lines: [], preparationMinutes: 0, totalCost: 20,
        createdAt: '', updatedAt: '',
      };
      const line = makeLine({ refId: 'sub1', refType: 'subrecipe', quantity: 500, unit: 'g' });
      // 500 g = 0.5 kg → 0.5 × 20 = 10 €
      expect(service.calcLineCost(line, [], [sub])).toBeCloseTo(10);
    });

    it('returns 0 when sub-recipe has no totalCost', () => {
      const sub: Recipe = {
        id: 'sub1', name: 'Fondo', description: '', isSubRecipe: true,
        lines: [], preparationMinutes: 0,
        createdAt: '', updatedAt: '',
      };
      const line = makeLine({ refId: 'sub1', refType: 'subrecipe', quantity: 200, unit: 'g' });
      expect(service.calcLineCost(line, [], [sub])).toBe(0);
    });
  });

  // ── calcRecipeCost ─────────────────────────────────────────────────────────
  describe('calcRecipeCost', () => {
    it('sums costs of all recipe lines', () => {
      const ing = makeIngredient({ pricePerUnit: 8, unit: 'kg' });
      const recipe: Recipe = {
        id: 'r1', name: 'Dish', description: '', isSubRecipe: false,
        lines: [
          makeLine({ id: 'a', quantity: 0.5, unit: 'kg' }),  // 4 €
          makeLine({ id: 'b', quantity: 250, unit: 'g' }),  // 2 €
        ],
        preparationMinutes: 0, createdAt: '', updatedAt: '',
      };
      expect(service.calcRecipeCost(recipe, [ing], [])).toBeCloseTo(6);
    });

    it('returns 0 for a recipe with no lines', () => {
      const recipe: Recipe = {
        id: 'r1', name: 'Empty', description: '', isSubRecipe: false,
        lines: [], preparationMinutes: 0, createdAt: '', updatedAt: '',
      };
      expect(service.calcRecipeCost(recipe, [], [])).toBe(0);
    });
  });

  // ── calcLaborCost ──────────────────────────────────────────────────────────
  describe('calcLaborCost', () => {
    it('calculates labour cost for 60 minutes (= 1 hour)', () => {
      const s = makeSettings(); // 2 × 1600 / 160 = 20 €/h
      expect(service.calcLaborCost(s, 60)).toBeCloseTo(20);
    });

    it('calculates labour cost for 30 minutes (half hour)', () => {
      const s = makeSettings();
      expect(service.calcLaborCost(s, 30)).toBeCloseTo(10);
    });

    it('returns 0 for 0 staff', () => {
      const s = { ...makeSettings(), staffCount: 0 };
      expect(service.calcLaborCost(s, 60)).toBe(0);
    });
  });

  // ── calcEnergyCost ─────────────────────────────────────────────────────────
  describe('calcEnergyCost', () => {
    it('calculates energy cost with default 2 kW for 1 hour', () => {
      const s = makeSettings(); // 0.25 €/kWh
      // 1 h × 2 kW × 0.25 = 0.50 €
      expect(service.calcEnergyCost(s, 60)).toBeCloseTo(0.5);
    });

    it('calculates energy cost for 30 minutes', () => {
      const s = makeSettings();
      expect(service.calcEnergyCost(s, 30)).toBeCloseTo(0.25);
    });
  });

  // ── calcTotalCost ──────────────────────────────────────────────────────────
  describe('calcTotalCost', () => {
    it('sums ingredient + labour + energy costs correctly', () => {
      const ing = makeIngredient({ pricePerUnit: 10, unit: 'kg' });
      const recipe: Recipe = {
        id: 'r1', name: 'Dish', description: '', isSubRecipe: false,
        lines: [makeLine({ quantity: 1, unit: 'kg' })], // 10 €
        preparationMinutes: 60,
        createdAt: '', updatedAt: '',
      };
      const s = makeSettings(); // labour 20 €/h, energy 0.5 €/h
      // 10 + 20 + 0.5 = 30.5 €
      expect(service.calcTotalCost(recipe, [ing], [], s)).toBeCloseTo(30.5);
    });
  });
});

