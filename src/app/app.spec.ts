import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have 4 nav items', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance.navItems.length).toBe(4);
  });

  it('nav items reference valid material icon names (non-empty strings)', () => {
    const fixture = TestBed.createComponent(App);
    for (const item of fixture.componentInstance.navItems) {
      expect(typeof item.icon).toBe('string');
      expect(item.icon.trim().length).toBeGreaterThan(0);
    }
  });

  it('nav items cover catalog, recipes, documents and settings routes', () => {
    const fixture = TestBed.createComponent(App);
    const paths = fixture.componentInstance.navItems.map(n => n.path);
    expect(paths).toContain('/catalog');
    expect(paths).toContain('/recipes');
    expect(paths).toContain('/documents');
    expect(paths).toContain('/settings');
  });
});

