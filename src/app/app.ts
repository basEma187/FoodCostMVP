import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly navItems: NavItem[] = [
    { path: '/catalog',   label: 'Ingredienti',    icon: 'inventory_2'     },
    { path: '/recipes',   label: 'Ricette',         icon: 'menu_book'       },
    { path: '/documents', label: 'Documenti / OCR', icon: 'document_scanner'},
    { path: '/samples',   label: 'Bolle campione',  icon: 'receipt_long'    },
    { path: '/settings',  label: 'Impostazioni',    icon: 'settings'        },
  ];
}


