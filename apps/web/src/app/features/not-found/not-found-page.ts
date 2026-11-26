import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <h1>Nie znaleziono strony</h1>
    <p>Strona, której szukasz, nie istnieje albo została przeniesiona.</p>
    <p><a routerLink="/feed">Wróć do wiadomości</a></p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--fa-space-4);
    }
  `,
})
export class NotFoundPage {}
