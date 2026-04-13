import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage';
import { Ingredient } from '../models/ingredient';
import { Recipe } from '../models/recipe';
import { AppSettings } from '../models/settings';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
  });

  afterEach(() => localStorage.clear());

  // ── Ingredients ────────────────────────────────────────────────────────────
  describe('ingredients', () => {
    it('returns empty array when nothing is stored', () => {
      expect(service.getIngredients()).toEqual([]);
    });

    it('persists and retrieves ingredients', () => {
      const ing: Ingredient = {
        id: 'a1', name: 'Farina', pricePerUnit: 0.8, unit: 'kg',
        category: 'food', updatedAt: '2026-01-01',
      };
      service.saveIngredients([ing]);
      expect(service.getIngredients()).toEqual([ing]);
    });

    it('overwrites previously saved ingredients', () => {
      const a: Ingredient = { id: '1', name: 'A', pricePerUnit: 1, unit: 'kg', category: 'food', updatedAt: '' };
      const b: Ingredient = { id: '2', name: 'B', pricePerUnit: 2, unit: 'g',  category: 'food', updatedAt: '' };
      service.saveIngredients([a]);
      service.saveIngredients([b]);
      expect(service.getIngredients()).toEqual([b]);
    });
  });

  // ── Recipes ────────────────────────────────────────────────────────────────
  describe('recipes', () => {
    it('returns empty array when nothing is stored', () => {
      expect(service.getRecipes()).toEqual([]);
    });

    it('persists and retrieves recipes', () => {
      const recipe: Recipe = {
        id: 'r1', name: 'Risotto', description: '', isSubRecipe: false,
        lines: [], preparationMinutes: 30,
        createdAt: '2026-01-01', updatedAt: '2026-01-01',
      };
      service.saveRecipes([recipe]);
      expect(service.getRecipes()).toEqual([recipe]);
    });
  });

  // ── Settings ───────────────────────────────────────────────────────────────
  describe('settings', () => {
    it('returns default settings when nothing is stored', () => {
      const s = service.getSettings();
      expect(s.electricityCostPerKwh).toBe(0.25);
      expect(s.staffCount).toBe(1);
      expect(s.averageMonthlySalary).toBe(1800);
      expect(s.ocrProvider).toBe('tesseract');
      expect(s.openaiApiKey).toBe('');
    });

    it('persists and retrieves custom settings', () => {
      const custom: AppSettings = {
        electricityCostPerKwh: 0.35,
        staffCount: 3,
        averageMonthlySalary: 2200,
        ocrProvider: 'openai',
        openaiApiKey: 'sk-test',
      };
      service.saveSettings(custom);
      expect(service.getSettings()).toEqual(custom);
    });
  });

  // ── Resilience ─────────────────────────────────────────────────────────────
  describe('resilience', () => {
    it('returns empty array when localStorage contains corrupt JSON', () => {
      localStorage.setItem('fc_ingredients', '{invalid json');
      expect(service.getIngredients()).toEqual([]);
    });
  });
});

