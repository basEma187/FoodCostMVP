export interface AppSettings {
  electricityCostPerKwh: number; // € per kWh
  staffCount: number;
  averageMonthlySalary: number; // € per person per month
  ocrProvider: 'tesseract' | 'openai';
  openaiApiKey: string;
  /** derived: (averageMonthlySalary * staffCount) / 160 */
  hourlyCost?: number;
}
