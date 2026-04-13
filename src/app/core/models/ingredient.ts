export type IngredientCategory = 'food' | 'beverage';

export type UnitKey = 'kg' | 'g' | 'l' | 'ml' | 'pz';

export interface UnitDef {
  key: UnitKey;
  label: string;
  short: string;
  /** Conversion factor: how many base units (grams/ml) equals 1 of this unit.
   *  For 'pz' (pieces), toBase = 1 (price-per-piece, no weight conversion). */
  toBase: number;
}

export const UNITS: UnitDef[] = [
  { key: 'kg',  label: 'Kilogrammi', short: 'kg',  toBase: 1000 },
  { key: 'g',   label: 'Grammi',     short: 'g',   toBase: 1    },
  { key: 'l',   label: 'Litri',      short: 'l',   toBase: 1000 },
  { key: 'ml',  label: 'Millilitri', short: 'ml',  toBase: 1    },
  { key: 'pz',  label: 'Pezzi',      short: 'pz',  toBase: 1    },
];

export interface Ingredient {
  id: string;
  name: string;
  /** Price for 1 unit of `unit`. */
  pricePerUnit: number;
  unit: UnitKey;
  category: IngredientCategory;
  updatedAt: string;
}
