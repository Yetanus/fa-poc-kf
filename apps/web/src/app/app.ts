import { Component, ElementRef, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './core/layout/header/header';
import { Footer } from './core/layout/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  // plain #main link would navigate to "/" because of <base href="/">
  protected skipToMain(event: Event): void {
    event.preventDefault();
    this.main().nativeElement.focus();
  }
}
