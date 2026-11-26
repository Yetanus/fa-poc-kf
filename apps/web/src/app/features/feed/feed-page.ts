import { Component } from '@angular/core';

@Component({
  selector: 'app-feed-page',
  template: `
    <h1>Najnowsze wiadomości</h1>
    <p class="fa-text-muted">Wiadomości z Hacker News, Spaceflight News i Dev.to.</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--fa-space-2);
    }
  `,
})
export class FeedPage {}
