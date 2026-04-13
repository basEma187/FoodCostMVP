import { TestBed } from '@angular/core/testing';
import { OcrService } from './ocr';
import { StorageService } from './storage';

describe('OcrService', () => {
  let service: OcrService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: StorageService,
          useValue: {
            getSettings: () => ({ ocrProvider: 'tesseract', openaiApiKey: '' }),
          },
        },
      ],
    });
    service = TestBed.inject(OcrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('extractFromImage is a function', () => {
    expect(typeof service.extractFromImage).toBe('function');
  });
});

