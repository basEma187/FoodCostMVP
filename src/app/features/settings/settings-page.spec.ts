import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsPage } from './settings-page';
import { StorageService } from '../../core/services/storage';
import { AppSettings } from '../../core/models/settings';

const BASE_SETTINGS: AppSettings = {
  electricityCostPerKwh: 0.25,
  staffCount: 2,
  averageMonthlySalary: 1600,
  ocrProvider: 'tesseract',
  openaiApiKey: '',
};

describe('SettingsPage', () => {
  let component: SettingsPage;
  let fixture: ComponentFixture<SettingsPage>;
  let savedSettings: AppSettings | null = null;

  beforeEach(async () => {
    savedSettings = null;
    await TestBed.configureTestingModule({
      imports: [SettingsPage],
      providers: [{
        provide: StorageService,
        useValue: {
          getSettings:     () => ({ ...BASE_SETTINGS }),
          saveSettings:    (s: AppSettings) => { savedSettings = s; },
          getIngredients:  () => [],
          getRecipes:      () => [],
        },
      }],
    }).compileComponents();
    fixture = TestBed.createComponent(SettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads settings from storage on init', () => {
    expect(component.settings().staffCount).toBe(2);
    expect(component.settings().electricityCostPerKwh).toBe(0.25);
  });

  it('hourlyCost computed – (salary × staff) / 160', () => {
    // (1600 × 2) / 160 = 20 €/h
    expect(component.hourlyCost()).toBeCloseTo(20);
  });

  it('hourlyCost updates when settings change', () => {
    component.update({ staffCount: 4 });
    // (1600 × 4) / 160 = 40 €/h
    expect(component.hourlyCost()).toBeCloseTo(40);
  });

  it('update patches settings without replacing the whole object', () => {
    component.update({ electricityCostPerKwh: 0.35 });
    expect(component.settings().electricityCostPerKwh).toBe(0.35);
    expect(component.settings().staffCount).toBe(2); // untouched
  });

  it('save persists current settings', () => {
    component.update({ staffCount: 5 });
    component.save();
    expect(savedSettings).not.toBeNull();
    expect(savedSettings!.staffCount).toBe(5);
  });

  it('save sets saved flag and clears it after timeout', async () => {
    component.save();
    expect(component.saved()).toBeTruthy();
    await new Promise(r => setTimeout(r, 2200));
    expect(component.saved()).toBeFalsy();
  });
});

