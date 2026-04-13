import { TestBed } from '@angular/core/testing';

import { FoodCost } from './food-cost';

describe('FoodCost', () => {
  let service: FoodCost;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoodCost);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
