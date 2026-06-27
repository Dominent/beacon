import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type Theme = 'light' | 'dark';
export type Density = 'comfortable' | 'compact';

const THEME_KEY = 'bc-theme';
const DENSITY_KEY = 'bc-density';

/**
 * App-wide UI preferences. Deliberately a plain-signals SERVICE, not a store:
 * the state is two scalars with no async, no entities, no derived collections —
 * a store would be ceremony. An `effect()` mirrors the signals onto <html> data
 * attributes (which the SCSS theme keys off) and into localStorage.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly doc = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly theme = signal<Theme>(this.read(THEME_KEY, 'light'));
  readonly density = signal<Density>(this.read(DENSITY_KEY, 'comfortable'));

  constructor() {
    effect(() => {
      const theme = this.theme();
      const density = this.density();
      if (!this.isBrowser) {
        return;
      }
      const root = this.doc.documentElement;
      root.setAttribute('data-theme', theme);
      root.setAttribute('data-density', density);
      localStorage.setItem(THEME_KEY, theme);
      localStorage.setItem(DENSITY_KEY, density);
    });
  }

  toggleTheme(): void {
    this.theme.update((t) => (t === 'light' ? 'dark' : 'light'));
  }

  toggleDensity(): void {
    this.density.update((d) => (d === 'comfortable' ? 'compact' : 'comfortable'));
  }

  private read<T extends string>(key: string, fallback: T): T {
    if (!this.isBrowser) {
      return fallback;
    }
    return (localStorage.getItem(key) as T | null) ?? fallback;
  }
}
