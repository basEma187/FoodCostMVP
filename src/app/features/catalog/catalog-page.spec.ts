import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogPage } from './catalog-page';
import { StorageService } from '../../core/services/storage';
import { Ingredient } from '../../core/models/ingredient';
import { AppSettings } from '../../core/models/settings';
import { Recipe } from '../../core/models/recipe';

const MOCK_ING: Ingredient = {
  id: 'abc', name: 'Pomodori', pricePerUnit: 1.5, unit: 'kg',
  category: 'food', updatedAt: '2026-01-01',
};

function createMockStorage(ingredients: Ingredient[] = []) {
  return {
    getIngredients: () => [...ingredients],
    saveIngredients: (_: Ingredient[]) => {},
    getRecipes:      (): Recipe[]      => [],
    getSettings:     (): AppSettings   => ({
      electricityCostPerKwh: 0.25, staffCount: 1,
      averageMonthlySalary: 1800, ocrProvider: 'tesseract' as const, openaiApiKey: '',
    }),
  };
}

describe('CatalogPage', () => {
  let component: CatalogPage;
  let fixture: ComponentFixture<CatalogPage>;

  async function setup(ingredients: Ingredient[] = [MOCK_ING]) {
    await TestBed.configureTestingModule({
      imports: [CatalogPage],
      providers: [{ provide: StorageService, useValue: createMockStorage(ingredients) }],
    }).compileComponents();
    fixture = TestBed.createComponent(CatalogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', async () => {
    await setup();
    expect(component).toBeTruthy();
  });

  it('loads ingredients from storage on init', async () => {
    await setup([MOCK_ING]);
    expect(component.ingredients().length).toBe(1);
    expect(component.ingredients()[0].name).toBe('Pomodori');
  });

  it('openAdd resets form state and opens form', async () => {
    await setup();
    component.openAdd();
    expect(component.formOpen()).toBeTruthy();
    expect(component.editingId()).toBeNull();
    expect(component.form().name).toBe('');
    expect(component.form().unit).toBe('kg');
  });

  it('openEdit populates form with ingredient data', async () => {
    await setup();
    component.openEdit(MOCK_ING);
    expect(component.formOpen()).toBeTruthy();
    expect(component.editingId()).toBe('abc');
    expect(component.form().name).toBe('Pomodori');
    expect(component.form().pricePerUnit).toBe(1.5);
    expect(component.form().unit).toBe('kg');
  });

  it('closeForm hides the form', async () => {
    await setup();
    component.openAdd();
    component.closeForm();
    expect(component.formOpen()).toBeFalsy();
    expect(component.editingId()).toBeNull();
  });

  it('save does nothing when name is empty', async () => {
    let saveCalled = false;
    const mockStorage = { ...createMockStorage([]), saveIngredients: () => { saveCalled = true; } };
    await TestBed.configureTestingModule({
      imports: [CatalogPage],
      providers: [{ provide: StorageService, useValue: mockStorage }],
    }).compileComponents();
    fixture = TestBed.createComponent(CatalogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.openAdd();
    component.updateForm({ name: '  ' });
    component.save();
    expect(saveCalled).toBeFalsy();
  });

  it('save adds a new ingredient and closes the form', async () => {
    const saved: Ingredient[][] = [];
    const mockStorage = { ...createMockStorage([]), saveIngredients: (ings: Ingredient[]) => { saved.push(ings); } };
    await TestBed.configureTestingModule({
      imports: [CatalogPage],
      providers: [{ provide: StorageService, useValue: mockStorage }],
    }).compileComponents();
    fixture = TestBed.createComponent(CatalogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.openAdd();
    component.updateForm({ name: 'Basilico', pricePerUnit: 3, unit: 'g' });
    component.save();

    expect(saved.length).toBe(1);
    expect(saved[0][0].name).toBe('Basilico');
    expect(saved[0][0].unit).toBe('g');
    expect(component.formOpen()).toBeFalsy();
  });

  it('save updates an existing ingredient', async () => {
    const saved: Ingredient[][] = [];
    const mockStorage = { ...createMockStorage([MOCK_ING]), saveIngredients: (ings: Ingredient[]) => { saved.push(ings); } };
    await TestBed.configureTestingModule({
      imports: [CatalogPage],
      providers: [{ provide: StorageService, useValue: mockStorage }],
    }).compileComponents();
    fixture = TestBed.createComponent(CatalogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.openEdit(MOCK_ING);
    component.updateForm({ pricePerUnit: 2.5 });
    component.save();

    expect(saved[0][0].pricePerUnit).toBe(2.5);
    expect(saved[0][0].id).toBe('abc');
  });

  it('delete removes ingredient by id and persists', async () => {
    const saved: Ingredient[][] = [];
    const mockStorage = { ...createMockStorage([MOCK_ING]), saveIngredients: (ings: Ingredient[]) => { saved.push(ings); } };
    await TestBed.configureTestingModule({
      imports: [CatalogPage],
      providers: [{ provide: StorageService, useValue: mockStorage }],
    }).compileComponents();
    fixture = TestBed.createComponent(CatalogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.delete('abc');
    expect(component.ingredients().length).toBe(0);
    expect(saved[0]).toEqual([]);
  });

  it('sortedIngredients returns ingredients sorted alphabetically', async () => {
    await setup([]);
    const zucca: Ingredient = { id: '1', name: 'Zucca', pricePerUnit: 1, unit: 'kg', category: 'food', updatedAt: '' };
    const aglio: Ingredient = { id: '2', name: 'Aglio', pricePerUnit: 1, unit: 'kg', category: 'food', updatedAt: '' };
    component.ingredients.set([zucca, aglio]);
    const sorted = component.sortedIngredients();
    expect(sorted[0].name).toBe('Aglio');
    expect(sorted[1].name).toBe('Zucca');
  });
});

