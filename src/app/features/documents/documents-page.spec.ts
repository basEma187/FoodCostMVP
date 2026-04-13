import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentsPage } from './documents-page';
import { StorageService } from '../../core/services/storage';
import { RouterModule } from '@angular/router';
import { AppSettings } from '../../core/models/settings';

describe('DocumentsPage', () => {
  let component: DocumentsPage;
  let fixture: ComponentFixture<DocumentsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentsPage, RouterModule.forRoot([])],
      providers: [{
        provide: StorageService,
        useValue: {
          getSettings:    (): AppSettings => ({
            electricityCostPerKwh: 0.25, staffCount: 1,
            averageMonthlySalary: 1800, ocrProvider: 'tesseract' as const, openaiApiKey: '',
          }),
          getIngredients: () => [],
          saveIngredients: () => {},
        },
      }],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initial status is idle', () => {
    expect(component.status()).toBe('idle');
  });

  it('reset restores status to idle and clears rows', () => {
    // Simulate state after processing
    component.status.set('error');
    component.rows.set([{ name: 'X', quantity: '1kg', unitPrice: '5', pricePerKg: 5, selected: true, resolvedPricePerKg: 5 }]);
    component.reset();
    expect(component.status()).toBe('idle');
    expect(component.rows().length).toBe(0);
  });
});

