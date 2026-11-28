import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Header } from './core/layout/header/header';
import { Footer } from './core/layout/footer/footer';
import { Notifications } from './core/notifications/notifications';
import { WidgetEvents } from './core/widgets/widget-events';
import { articleRoute } from './features/article/article-route';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, Notifications],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  constructor() {
    const router = inject(Router);

    inject(WidgetEvents)
      .events$.pipe(
        filter((event) => event.type === 'ticker-select'),
        takeUntilDestroyed(),
      )
      .subscribe((event) => void router.navigate(articleRoute(event.id)));
  }

  // plain #main link would navigate to "/" because of <base href="/">
  protected skipToMain(event: Event): void {
    event.preventDefault();
    this.main().nativeElement.focus();
  }
}
