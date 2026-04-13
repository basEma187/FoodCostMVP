import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { AppSettings } from '../../core/models/settings';
import { StorageService } from '../../core/services/storage';

@Component({
  selector: 'app-settings-page',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './settings-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  private readonly storage = inject(StorageService);

  settings = signal<AppSettings>(this.storage.getSettings());
  saved = signal(false);

  hourlyCost = computed(() => {
    const s = this.settings();
    return (s.averageMonthlySalary * s.staffCount) / 160;
  });

  update(patch: Partial<AppSettings>): void {
    this.settings.update(s => ({ ...s, ...patch }));
  }

  save(): void {
    this.storage.saveSettings(this.settings());
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2000);
  }
}

