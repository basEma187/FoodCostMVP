import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipesPage } from './recipes-page';
import { StorageService } from '../../core/services/storage';
import { Ingredient } from '../../core/models/ingredient';
import { Recipe } from '../../core/models/recipe';
import { AppSettings } from '../../core/models/settings';

const MOCK_ING: Ingredient = {
  id: 'i1', name: 'Pasta', pricePerUnit: 1.2, unit: 'kg',
  category: 'food', updatedAt: '',
};

const MOCK_RECIPE: Recipe = {
  id: 'r1', name: 'Spaghetti', description: 'Classico', isSubRecipe: false,
  lines: [{ id: 'l1', refId: 'i1', refType: 'ingredient', name: 'Pasta', quantity: 200, unit: 'g' }],
  preparationMinutes: 20, totalCost: 0.24,
  createdAt: '', updatedAt: '',
};

const DEFAULT_SETTINGS: AppSettings = {
  electricityCostPerKwh: 0.25, staffCount: 1, averageMonthlySalary: 1800,
  ocrProvider: 'tesseract', openaiApiKey: '',
};

function createMockStorage(recipes: Recipe[] = [], ingredients: Ingredient[] = []) {
  return {
    getIngredients: () => [...ingredients],
    saveIngredients: (_: Ingredient[]) => {},
    getRecipes:      () => [...recipes],
    saveRecipes:     (_: Recipe[]) => {},
    getSettings:     () => DEFAULT_SETTINGS,
  };
}

describe('RecipesPage', () => {
  let component: RecipesPage;
  let fixture: ComponentFixture<RecipesPage>;

  async function setup(recipes: Recipe[] = [], ingredients: Ingredient[] = [MOCK_ING]) {
    await TestBed.configureTestingModule({
      imports: [RecipesPage],
      providers: [{ provide: StorageService, useValue: createMockStorage(recipes, ingredients) }],
    }).compileComponents();
    fixture = TestBed.createComponent(RecipesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', async () => {
    await setup();
    expect(component).toBeTruthy();
  });

  it('starts in list view', async () => {
    await setup();
    expect(component.viewMode()).toBe('list');
  });

  it('openAdd switches to form view with empty state', async () => {
    await setup();
    component.openAdd();
    expect(component.viewMode()).toBe('form');
    expect(component.editingId()).toBeNull();
    expect(component.formName()).toBe('');
    expect(component.formLines()).toEqual([]);
  });

  it('openEdit populates form with recipe data', async () => {
    await setup([MOCK_RECIPE]);
    component.openEdit(MOCK_RECIPE);
    expect(component.viewMode()).toBe('form');
    expect(component.editingId()).toBe('r1');
    expect(component.formName()).toBe('Spaghetti');
    expect(component.formLines().length).toBe(1);
  });

  it('cancel returns to list view', async () => {
    await setup();
    component.openAdd();
    component.cancel();
    expect(component.viewMode()).toBe('list');
  });

  it('filter computed – all returns all recipes', async () => {
    const sub: Recipe = { ...MOCK_RECIPE, id: 'sub', name: 'Fondo', isSubRecipe: true };
    await setup([MOCK_RECIPE, sub]);
    component.filter.set('all');
    expect(component.filteredRecipes().length).toBe(2);
  });

  it('filter computed – recipe returns only non-sub-recipes', async () => {
    const sub: Recipe = { ...MOCK_RECIPE, id: 'sub', name: 'Fondo', isSubRecipe: true };
    await setup([MOCK_RECIPE, sub]);
    component.filter.set('recipe');
    expect(component.filteredRecipes().length).toBe(1);
    expect(component.filteredRecipes()[0].name).toBe('Spaghetti');
  });

  it('filter computed – subrecipe returns only sub-recipes', async () => {
    const sub: Recipe = { ...MOCK_RECIPE, id: 'sub', name: 'Fondo', isSubRecipe: true };
    await setup([MOCK_RECIPE, sub]);
    component.filter.set('subrecipe');
    expect(component.filteredRecipes().length).toBe(1);
    expect(component.filteredRecipes()[0].name).toBe('Fondo');
  });

  it('addLine adds a line to formLines', async () => {
    await setup([], [MOCK_ING]);
    component.openAdd();
    component.newLineRefId.set('i1');
    component.newLineQuantity.set(100);
    component.newLineUnit.set('g');
    component.addLine();
    expect(component.formLines().length).toBe(1);
    expect(component.formLines()[0].name).toBe('Pasta');
    expect(component.formLines()[0].quantity).toBe(100);
    expect(component.formLines()[0].unit).toBe('g');
  });

  it('addLine does nothing when no ingredient is selected', async () => {
    await setup();
    component.openAdd();
    component.newLineRefId.set('');
    component.addLine();
    expect(component.formLines().length).toBe(0);
  });

  it('removeLine removes the correct line', async () => {
    await setup();
    component.openAdd();
    component.formLines.set([
      { id: 'x', refId: 'i1', refType: 'ingredient', name: 'A', quantity: 1, unit: 'kg' },
      { id: 'y', refId: 'i1', refType: 'ingredient', name: 'B', quantity: 2, unit: 'kg' },
    ]);
    component.removeLine('x');
    expect(component.formLines().length).toBe(1);
    expect(component.formLines()[0].id).toBe('y');
  });

  it('save does nothing when recipe name is empty', async () => {
    const saved: Recipe[][] = [];
    const ms = { ...createMockStorage(), saveRecipes: (r: Recipe[]) => saved.push(r) };
    await TestBed.configureTestingModule({
      imports: [RecipesPage],
      providers: [{ provide: StorageService, useValue: ms }],
    }).compileComponents();
    fixture = TestBed.createComponent(RecipesPage);
    component = fixture.componentInstance;
    component.openAdd();
    component.formName.set('');
    component.save();
    expect(saved.length).toBe(0);
  });

  it('save persists a new recipe and returns to list view', async () => {
    const saved: Recipe[][] = [];
    const ms = { ...createMockStorage(), saveRecipes: (r: Recipe[]) => saved.push(r) };
    await TestBed.configureTestingModule({
      imports: [RecipesPage],
      providers: [{ provide: StorageService, useValue: ms }],
    }).compileComponents();
    fixture = TestBed.createComponent(RecipesPage);
    component = fixture.componentInstance;
    component.openAdd();
    component.formName.set('Carbonara');
    component.save();
    expect(saved[0][0].name).toBe('Carbonara');
    expect(component.viewMode()).toBe('list');
  });

  it('delete removes a recipe by id', async () => {
    const saved: Recipe[][] = [];
    const ms = { ...createMockStorage([MOCK_RECIPE]), saveRecipes: (r: Recipe[]) => saved.push(r) };
    await TestBed.configureTestingModule({
      imports: [RecipesPage],
      providers: [{ provide: StorageService, useValue: ms }],
    }).compileComponents();
    fixture = TestBed.createComponent(RecipesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.delete('r1');
    expect(component.recipes().length).toBe(0);
    expect(saved[0]).toEqual([]);
  });
});

