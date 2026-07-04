
You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Component Directory Structure

When a component's template contains a visually or functionally distinct element, extract it into a named sub-component under a `components/` folder — regardless of size. The goal is that the parent template reads as an explicit description of what is on screen, so developers understand the layout without diving into implementation details.

```
feature-component/
  components/
    part-a/
      part-a.ts
      part-a.html       ← external only if template is visually complex
    part-b/
      part-b.ts
  feature-component.ts
  feature-component.html  ← now a thin composition of sub-components
```

- Sub-components that are purely presentational for a single feature may inject shared services directly instead of receiving all data as inputs.
- Pass state via `input()` signals when the sub-component needs to be reusable or decoupled from service internals.
- The folder hierarchy must reflect actual consumption: if a set of sub-components is only consumed by one parent component, they live inside that parent's folder — not in a sibling `components/` folder at a higher level.
- Only add a `components/` intermediary folder when there are multiple peer components at that level. A single component does not warrant the extra layer.

### Spacing and Layout

Use `gap` (grid/flex) to space sibling elements. Do **not** use `padding` as a structural tool to push siblings apart — that creates per-element values that diverge over time and break as the layout evolves.

- Sibling spacing → `gap` on the parent grid/flex container.
- Internal element inset → `padding` on the **container itself**, declared once.
- Never create a wrapper `<div>` whose sole purpose is to add padding around a child.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
