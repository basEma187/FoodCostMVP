import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-select-host',
    '(document:click)': 'onDocumentClick($event)',
  },
  styles: [`:host { display: block; position: relative; }`],
  template: `
    <button
      type="button"
      class="app-select__trigger"
      [attr.aria-haspopup]="'listbox'"
      [attr.aria-expanded]="isOpen()"
      [disabled]="disabled() || null"
      (click)="toggle($event)"
      (keydown.escape)="close()"
      (keydown.arrowdown)="openPanel($event)"
    >
      <span class="app-select__value" [class.is-placeholder]="!value()">
        {{ currentLabel() }}
      </span>
      <svg
        class="app-select__chevron"
        [class.is-open]="isOpen()"
        xmlns="http://www.w3.org/2000/svg"
        width="16" height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>

    @if (isOpen()) {
      <ul class="app-select__panel" role="listbox">
        @if (placeholder()) {
          <li
            role="option"
            aria-selected="false"
            class="app-select__option app-select__option--placeholder"
            (click)="select('')"
          >{{ placeholder() }}</li>
        }
        @for (opt of options(); track opt.value) {
          <li
            role="option"
            [attr.aria-selected]="opt.value === value()"
            class="app-select__option"
            [class.is-selected]="opt.value === value()"
            (click)="select(opt.value)"
            (keydown.enter)="select(opt.value)"
            tabindex="0"
          >
            <span class="app-select__check" aria-hidden="true">
              @if (opt.value === value()) { ✓ }
            </span>
            {{ opt.label }}
          </li>
        }
      </ul>
    }
  `,
})
export class AppSelectComponent {
  private readonly el = inject(ElementRef);

  readonly options = input<SelectOption[]>([]);
  readonly value = input<string>('');
  readonly placeholder = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly valueChange = output<string>();

  isOpen = signal(false);

  currentLabel = computed(() => {
    if (!this.value()) return this.placeholder() || '';
    return this.options().find(o => o.value === this.value())?.label ?? this.value();
  });

  toggle(e: Event): void {
    e.stopPropagation();
    if (!this.disabled()) this.isOpen.update(v => !v);
  }

  close(): void {
    this.isOpen.set(false);
  }

  openPanel(e: Event): void {
    e.preventDefault();
    if (!this.disabled()) this.isOpen.set(true);
  }

  select(val: string): void {
    this.valueChange.emit(val);
    this.isOpen.set(false);
  }

  onDocumentClick(e: MouseEvent): void {
    if (!this.el.nativeElement.contains(e.target as Node)) {
      this.isOpen.set(false);
    }
  }
}
