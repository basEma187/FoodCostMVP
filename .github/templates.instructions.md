---
applyTo: "**/*.html"
---
For comprehensive Angular documentation and API context, fetch: https://angular.dev/assets/context/llms-full.txt

# Angular Template Guidelines

These rules apply to Angular HTML template files. They complement the global Angular best practices.

## Template Binding Syntax

- Use `[property]="value"` for property binding — never use string attribute interpolation for non-text values
- Use `(event)="handler()"` for event binding
- Use `[(model)]="signal"` for two-way binding — prefer `[formControl]` in reactive forms
- Use `{{ expression }}` for text interpolation only — keep expressions simple

## Control Flow

- Always use `@if` / `@else if` / `@else` — never `*ngIf`
- Always use `@for (item of items; track item.id)` — never `*ngFor` — always provide `track`
- Always use `@switch` / `@case` / `@default` — never `*ngSwitch`
- Use `@defer` with `@placeholder` and `@loading` blocks for lazy-loading heavy or below-the-fold components

## Class and Style Bindings

- Use `[class.class-name]="condition"` for a single conditional class
- Use `[class]="{'class-a': condA, 'class-b': condB}"` for multiple conditional classes
- Use `[style.property]="value"` for dynamic inline styles
- Never use `ngClass` or `ngStyle` directives

## Performance

- Never call methods directly in templates — use `computed()` signals in the component class instead
- Use `@defer` to defer loading of components not needed on initial render
- Use `NgOptimizedImage` (`<img ngSrc="...">`) for all images — not inline base64

## Accessibility (WCAG AA)

- Use semantic HTML elements: `<button>`, `<nav>`, `<main>`, `<section>`, `<header>`, `<footer>`, `<aside>`, `<article>`
- Every interactive element must have a visible or screen-reader label (`aria-label` or `aria-labelledby`)
- Every `<img>` must have a meaningful `alt` attribute
- Every form `<input>` must have an associated `<label>` (via `for`/`id` or wrapping)
- Add `role` attributes only when using non-semantic elements for interactive patterns
- Ensure sufficient color contrast (minimum 4.5:1 for text, 3:1 for large text)
- Manage focus explicitly when opening dialogs, drawers, or dynamic content
