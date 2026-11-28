import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';

export type Theme = 'light' | 'dark';
export type ThemePreference = Theme | 'system';

const STORAGE_KEY = 'fa-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly media = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');

  private readonly systemTheme = signal<Theme>(this.media?.matches ? 'dark' : 'light');

  readonly preference = signal<ThemePreference>(this.readPreference());
  readonly theme = computed<Theme>(() => {
    const preference = this.preference();
    return preference === 'system' ? this.systemTheme() : preference;
  });

  constructor() {
    this.media?.addEventListener('change', (event) => {
      this.systemTheme.set(event.matches ? 'dark' : 'light');
    });

    effect(() => {
      const preference = this.preference();
      const root = this.document.documentElement;

      if (preference === 'system') {
        delete root.dataset['theme'];
        localStorage.removeItem(STORAGE_KEY);
      } else {
        root.dataset['theme'] = preference;
        localStorage.setItem(STORAGE_KEY, preference);
      }
    });
  }

  setTheme(theme: Theme): void {
    this.preference.set(theme);
  }

  private readPreference(): ThemePreference {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : 'system';
  }
}
