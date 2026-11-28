import { Component, model } from '@angular/core';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.scss',
})
export class ThemeToggle {
  readonly dark = model(false);

  protected toggle(): void {
    this.dark.update((dark) => !dark);
  }
}
