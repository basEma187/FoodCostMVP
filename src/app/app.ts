import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly navItems: NavItem[] = [
    { path: '/catalog', label: 'Ingredienti', icon: '\uD83E\uDDC2' },
    { path: '/recipes', label: 'Ricette', icon: '\uD83D\uDCCB' },
    { path: '/documents', label: 'Documenti / OCR', icon: '\uD83D\uDCC4' },
    { path: '/settings', label: 'Impostazioni', icon: '\u2699\uFE0F' },
  ];
}

