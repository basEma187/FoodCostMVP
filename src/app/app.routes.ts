import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'catalog', pathMatch: 'full' },
  {
    path: 'catalog',
    loadComponent: () =>
      import('./features/catalog/catalog-page').then(m => m.CatalogPage),
  },
  {
    path: 'recipes',
    loadComponent: () =>
      import('./features/recipes/recipes-page').then(m => m.RecipesPage),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings-page').then(m => m.SettingsPage),
  },
  {
    path: 'documents',
    loadComponent: () =>
      import('./features/documents/documents-page').then(m => m.DocumentsPage),
  },
  {
    path: 'samples',
    loadComponent: () =>
      import('./features/samples/samples-page').then(m => m.SamplesPage),
  },
];

